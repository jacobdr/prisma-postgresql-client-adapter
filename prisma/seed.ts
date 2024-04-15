import { Prisma, PrismaClient } from "@prisma/client";
// import { createRequire } from "module";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// end existing

const entryFile = process.argv?.[1];
const isBeingExecuted = entryFile === __filename;

const FIXED_DATE = new Date(0);
const FIXED_DATE_2 = new Date(1_000);

export const INVALID_COLUMNS = [
    "time_with_zone",
    "inet",
    "small_int",
] as const satisfies (keyof Prisma.KitchenSinkSelect)[];

export const SEED_ROWS = [
    {
        // Valid
        id: "1",
        is_valid: true,
        count_int: -10,
        count_bingint: BigInt(1_000_000),
        count_float: 10,
        count_decimal: new Prisma.Decimal("-9.777"),
        datetime: FIXED_DATE,
        timestamp_tz: FIXED_DATE_2,
        time_without_zone: FIXED_DATE,
        xml: "<bar>foo</bar>",
        int_int: 57,
        int_oid: 99,
        float_double_precision: 93123.123123,
        float_real: 17.12,
        json_json: {
            type: "json_json",
            car: true,
            fad: null,
            bronze: "gold",
            something: 10,
            nested: { data: { below: false } },
        },
        json_jsonb: { type: "json_jsonb", car: false, fad: null, bronze: "gold", something: 10 },
        // Invalid
        time_with_zone: FIXED_DATE_2,
        inet: "192.168.1.1",
        small_int: 8,
    },
] as const satisfies Prisma.KitchenSinkCreateInput[];

export type IAllColumns = keyof (typeof SEED_ROWS)[0];
export type IInvalidColumns = (typeof INVALID_COLUMNS)[number];
export type IValidColumns = Exclude<IAllColumns, IInvalidColumns>;

export const VALID_COLUMNS = Object.keys(SEED_ROWS[0]).filter(
    (columnName) => !INVALID_COLUMNS.includes(columnName as any),
) as IValidColumns[];

if (isBeingExecuted) {
    const prismaClient = new PrismaClient();
    await prismaClient.$connect();
    await prismaClient.kitchenSink.deleteMany();
    await prismaClient.kitchenSink.createMany({ data: SEED_ROWS });
    await prismaClient.$disconnect();
}
