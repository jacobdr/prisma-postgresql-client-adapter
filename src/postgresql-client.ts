/* eslint-disable @typescript-eslint/require-await */
import { name as packageName } from "../package.json";
import {
    // fixArrayBufferValues,
    UnsupportedNativeDataType,
    convertDataTypes,
    fieldToColumnType,
} from "./conversion.js";
import { isDatabaseError } from "./database-error.js";
import type {
    ColumnType,
    ConnectionInfo,
    DriverAdapter,
    Query,
    Queryable,
    Result,
    ResultSet,
    Transaction,
    TransactionOptions,
} from "@prisma/driver-adapter-utils";
import { Debug, err, ok } from "@prisma/driver-adapter-utils";
import * as pg from "postgresql-client";

const debug = Debug("prisma:driver-adapter:postgresql-client");

type StdClient = pg.Pool;
type TransactionClient = pg.Connection;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
class PgQueryable<ClientT extends StdClient | TransactionClient> implements Queryable {
    readonly provider = "postgres";
    readonly adapterName = packageName;

    constructor(protected readonly client: ClientT) {}

    /**
     * Execute a query given as SQL, interpolating the given parameters.
     */
    async queryRaw(query: Query): Promise<Result<ResultSet>> {
        const tag = "[js::query_raw]";
        debug(`${tag} %O`, query);

        const res = await this.performIO(query);

        if (!res.ok) {
            return err(res.error);
        }

        const { fields, rows } = res.value;
        if (!fields) {
            debug("Error no fields returned in query result: %O", res.value);
            throw new Error("No fields in result");
        }
        if (!rows) {
            debug("Error no rows returned in query result: %O", res.value);
            throw new Error("No rows in result");
        }

        const columnNames = fields.map((field) => field.fieldName);
        let columnTypes: ColumnType[] = [];

        try {
            columnTypes = fields.map((field) => fieldToColumnType(field.dataTypeId));
        } catch (e) {
            if (e instanceof UnsupportedNativeDataType) {
                return err({
                    kind: "UnsupportedNativeDataType",
                    type: e.type,
                });
            }
            throw e;
        }

        const convertedRows = convertDataTypes(rows, fields);
        const debugCtx = { columnNames, columnTypes, fields, rows, convertedRows };
        debug("Context for debugging row conversions: %O", debugCtx);

        return ok({
            columnNames,
            columnTypes,
            rows: convertedRows,
        });
    }

    /**
     * Execute a query given as SQL, interpolating the given parameters and
     * returning the number of affected rows.
     * Note: Queryable expects a u64, but napi.rs only supports u32.
     */
    async executeRaw(query: Query): Promise<Result<number>> {
        const tag = "[js::execute_raw]";
        debug(`${tag} %O`, query);

        // Note: `rowsAffected` can sometimes be null (e.g., when executing `"BEGIN"`)
        const result = await this.performIO(query);
        return result.map(({ rowsAffected }) => {
            return rowsAffected ?? 0;
        });
    }

    /**
     * Run a query against the database, returning the result set.
     * Should the query fail due to a connection error, the connection is
     * marked as unhealthy.
     */
    private async performIO(query: Query): Promise<Result<pg.QueryResult>> {
        const { sql, args: values } = query;

        try {
            const result = await this.client.query(sql, { params: values });
            if (!result.rows) {
                // TODO: Fix this
                throw new Error("No rows in the result set");
                // return err({
                //     kind: "Postgres",
                //     code: e.code,
                //     severity: e.severity,
                //     message: e.message,
                //     detail: e.detail,
                //     column: e.column,
                //     hint: e.hint,
                // });
            }
            return ok(result);
        } catch (error) {
            debug("Error in performIO: %O", error);
            if (isDatabaseError(error)) {
                return err({
                    kind: "Postgres",
                    code: error.code || "unknown",
                    severity: error.severity || "unknown",
                    message: error.message,
                    detail: error.detail,
                    column: error.column,
                    hint: error.hint,
                });
            }

            throw error;
        }
    }
}

class PgTransaction extends PgQueryable<TransactionClient> implements Transaction {
    constructor(
        client: pg.Connection,
        readonly options: TransactionOptions,
    ) {
        super(client);
    }

    async commit(): Promise<Result<void>> {
        debug(`[js::commit]`);

        await this.client.commit();
        return ok(undefined);
    }

    async rollback(): Promise<Result<void>> {
        debug(`[js::rollback]`);

        await this.client.rollback();
        return ok(undefined);
    }
}

export type PrismaPgOptions = {
    schema?: string;
};

const IMPORT_ERROR_STRING = `PrismaPg must be initialized with an instance of Pool:
import { Pool } from 'postgresql-client'
const pool = new Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
`;
export class PrismaPg extends PgQueryable<StdClient> implements DriverAdapter {
    constructor(
        client: pg.Pool,
        private options?: PrismaPgOptions,
    ) {
        if (!(client instanceof pg.Pool)) {
            throw new TypeError(IMPORT_ERROR_STRING);
        }
        super(client);
    }

    getConnectionInfo(): Result<ConnectionInfo> {
        return ok({
            schemaName: this.options?.schema,
        });
    }

    async startTransaction(): Promise<Result<Transaction>> {
        const options: TransactionOptions = {
            usePhantomQuery: false,
        };

        const tag = "[js::startTransaction]";
        debug(`${tag} options: %O`, options);

        const connection = await this.client.acquire();
        return ok(new PgTransaction(connection, options));
    }
}
