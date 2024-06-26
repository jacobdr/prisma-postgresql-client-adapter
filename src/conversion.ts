/**
 * This is copied from
 * https://github.com/prisma/prisma/blob/main/packages/adapter-pg/src/conversion.ts
 */
import {
    type ColumnType,
    ColumnTypeEnum, // JsonNullMarker
} from "@prisma/driver-adapter-utils";
import { DataTypeOIDs, type FieldInfo } from "postgresql-client";

/**
 * This is a cast to get compatibility with the upstream
 */
type ICapitalizedNames = Uppercase<keyof typeof DataTypeOIDs>;
type ICapitalizedDataTypeOIDs = { [key in ICapitalizedNames]: number };
const INTERNAL_DATATYPE_OIDS: ICapitalizedDataTypeOIDs = Object.fromEntries(
    Object.entries(DataTypeOIDs).map(([key, value]) => [
        key.toUpperCase() as ICapitalizedNames,
        value,
    ]),
) as ICapitalizedDataTypeOIDs;

// import { parse as parseArray } from "postgres-array";

// const { types } = pg;
// const { builtins: DataTypeOIDs, getTypeParser, setTypeParser } = types;

// const foo = pg.DataTypeOIDs

/**
 * Copies data, in the future maybe make this not functional?
 */
export function convertDataTypes(
    multipleRowData: unknown[][],
    columnTypes: FieldInfo[],
): unknown[][] {
    const convertedData = multipleRowData.map((singleRowData) => {
        return singleRowData.map((columnValue, index) => {
            const fieldInfo = columnTypes[index];
            const prismaType = fieldToColumnType(fieldInfo.dataTypeId);
            switch (prismaType) {
                // TODO: Handle more precision here?
                case ColumnTypeEnum.Time:
                    // Is a string like -- 1970-01-01T16:47:00.000Z
                    if (typeof columnValue === "string") {
                        const timeStringPart = columnValue.slice(11, 19);
                        return timeStringPart;
                    }
                    if (columnValue instanceof Date) {
                        return columnValue.toISOString().slice(11, 19);
                    }
                    throw new Error("UNREACHABLE");
                case ColumnTypeEnum.DateTime:
                    if (!(columnValue instanceof Date)) {
                        throw new Error("UNREACHABLE");
                    }

                    // TODO: Is this the correct logic?
                    if (fieldInfo.dataTypeName === "timestamptz") {
                        return columnValue.toISOString();
                    }

                    return columnValue.toISOString();
                default:
                    return columnValue;
            }
        });
    });
    return convertedData;
}

/**
 * PostgreSQL array column types (not defined in DataTypeOIDs).
 *
 * See the semantics of each of this code in:
 *   https://github.com/postgres/postgres/blob/master/src/include/catalog/pg_type.dat
 */
// const ArrayColumnType = {
//     BIT_ARRAY: 1561,
//     BOOL_ARRAY: 1000,
//     BYTEA_ARRAY: 1001,
//     BPCHAR_ARRAY: 1014,
//     CHAR_ARRAY: 1002,
//     CIDR_ARRAY: 651,
//     DATE_ARRAY: 1182,
//     FLOAT4_ARRAY: 1021,
//     FLOAT8_ARRAY: 1022,
//     INET_ARRAY: 1041,
//     INT2_ARRAY: 1005,
//     INT4_ARRAY: 1007,
//     INT8_ARRAY: 1016,
//     JSONB_ARRAY: 3807,
//     JSON_ARRAY: 199,
//     MONEY_ARRAY: 791,
//     NUMERIC_ARRAY: 1231,
//     OID_ARRAY: 1028,
//     TEXT_ARRAY: 1009,
//     TIMESTAMP_ARRAY: 1115,
//     TIME_ARRAY: 1183,
//     UUID_ARRAY: 2951,
//     VARBIT_ARRAY: 1563,
//     VARCHAR_ARRAY: 1015,
//     XML_ARRAY: 143,
// };

export class UnsupportedNativeDataType extends Error {
    // map of type codes to type names
    static typeNames: { [key: number]: string } = {
        16: "bool",
        17: "bytea",
        18: "char",
        19: "name",
        20: "int8",
        21: "int2",
        22: "int2vector",
        23: "int4",
        24: "regproc",
        25: "text",
        26: "oid",
        27: "tid",
        28: "xid",
        29: "cid",
        30: "oidvector",
        32: "pg_ddl_command",
        71: "pg_type",
        75: "pg_attribute",
        81: "pg_proc",
        83: "pg_class",
        114: "json",
        142: "xml",
        194: "pg_node_tree",
        269: "table_am_handler",
        325: "index_am_handler",
        600: "point",
        601: "lseg",
        602: "path",
        603: "box",
        604: "polygon",
        628: "line",
        650: "cidr",
        700: "float4",
        701: "float8",
        705: "unknown",
        718: "circle",
        774: "macaddr8",
        790: "money",
        829: "macaddr",
        869: "inet",
        1033: "aclitem",
        1042: "bpchar",
        1043: "varchar",
        1082: "date",
        1083: "time",
        1114: "timestamp",
        1184: "timestamptz",
        1186: "interval",
        1266: "timetz",
        1560: "bit",
        1562: "varbit",
        1700: "numeric",
        1790: "refcursor",
        2202: "regprocedure",
        2203: "regoper",
        2204: "regoperator",
        2205: "regclass",
        2206: "regtype",
        2249: "record",
        2275: "cstring",
        2276: "any",
        2277: "anyarray",
        2278: "void",
        2279: "trigger",
        2280: "language_handler",
        2281: "internal",
        2283: "anyelement",
        2287: "_record",
        2776: "anynonarray",
        2950: "uuid",
        2970: "txid_snapshot",
        3115: "fdw_handler",
        3220: "pg_lsn",
        3310: "tsm_handler",
        3361: "pg_ndistinct",
        3402: "pg_dependencies",
        3500: "anyenum",
        3614: "tsvector",
        3615: "tsquery",
        3642: "gtsvector",
        3734: "regconfig",
        3769: "regdictionary",
        3802: "jsonb",
        3831: "anyrange",
        3838: "event_trigger",
        3904: "int4range",
        3906: "numrange",
        3908: "tsrange",
        3910: "tstzrange",
        3912: "daterange",
        3926: "int8range",
        4072: "jsonpath",
        4089: "regnamespace",
        4096: "regrole",
        4191: "regcollation",
        4451: "int4multirange",
        4532: "nummultirange",
        4533: "tsmultirange",
        4534: "tstzmultirange",
        4535: "datemultirange",
        4536: "int8multirange",
        4537: "anymultirange",
        4538: "anycompatiblemultirange",
        4600: "pg_brin_bloom_summary",
        4601: "pg_brin_minmax_multi_summary",
        5017: "pg_mcv_list",
        5038: "pg_snapshot",
        5069: "xid8",
        5077: "anycompatible",
        5078: "anycompatiblearray",
        5079: "anycompatiblenonarray",
        5080: "anycompatiblerange",
    };

    type: string;

    constructor(code: number) {
        super();
        this.type = UnsupportedNativeDataType.typeNames[code] || "Unknown";
        this.message = `Unsupported column type ${this.type}`;
    }
}

/**
 * This is a simplification of quaint's value inference logic. Take a look at quaint's conversion.rs
 * module to see how other attributes of the field packet such as the field length are used to infer
 * the correct quaint::Value variant.
 */
export function fieldToColumnType(fieldTypeId: number): ColumnType {
    switch (fieldTypeId) {
        case INTERNAL_DATATYPE_OIDS["INT2"]:
        case INTERNAL_DATATYPE_OIDS["INT4"]:
            return ColumnTypeEnum.Int32;
        case INTERNAL_DATATYPE_OIDS["INT8"]:
            return ColumnTypeEnum.Int64;
        case INTERNAL_DATATYPE_OIDS["FLOAT4"]:
            return ColumnTypeEnum.Float;
        case INTERNAL_DATATYPE_OIDS["FLOAT8"]:
            return ColumnTypeEnum.Double;
        case INTERNAL_DATATYPE_OIDS["BOOL"]:
            return ColumnTypeEnum.Boolean;
        case INTERNAL_DATATYPE_OIDS["DATE"]:
            return ColumnTypeEnum.Date;
        case INTERNAL_DATATYPE_OIDS["TIME"]:
            // case INTERNAL_DATATYPE_OIDS["TIMETZ"]:
            return ColumnTypeEnum.Time;
        case INTERNAL_DATATYPE_OIDS["TIMESTAMP"]:
        case INTERNAL_DATATYPE_OIDS["TIMESTAMPTZ"]:
            return ColumnTypeEnum.DateTime;
        case INTERNAL_DATATYPE_OIDS["NUMERIC"]:
            // case INTERNAL_DATATYPE_OIDS["MONEY"]:
            return ColumnTypeEnum.Numeric;
        case INTERNAL_DATATYPE_OIDS["JSON"]:
        case INTERNAL_DATATYPE_OIDS["JSONB"]:
            return ColumnTypeEnum.Json;
        case INTERNAL_DATATYPE_OIDS["UUID"]:
            return ColumnTypeEnum.Uuid;
        case INTERNAL_DATATYPE_OIDS["OID"]:
            return ColumnTypeEnum.Int64;
        case INTERNAL_DATATYPE_OIDS["BPCHAR"]:
        case INTERNAL_DATATYPE_OIDS["TEXT"]:
        case INTERNAL_DATATYPE_OIDS["VARCHAR"]:
        // case INTERNAL_DATATYPE_OIDS["BIT"]:
        // case INTERNAL_DATATYPE_OIDS["VARBIT"]:
        // case INTERNAL_DATATYPE_OIDS["INET"]:
        // case INTERNAL_DATATYPE_OIDS["CIDR"]:
        case INTERNAL_DATATYPE_OIDS["XML"]:
            return ColumnTypeEnum.Text;
        case INTERNAL_DATATYPE_OIDS["BYTEA"]:
            return ColumnTypeEnum.Bytes;
        // case ArrayColumnType.INT2_ARRAY:
        // case ArrayColumnType.INT4_ARRAY:
        //     return ColumnTypeEnum.Int32Array;
        // case ArrayColumnType.FLOAT4_ARRAY:
        //     return ColumnTypeEnum.FloatArray;
        // case ArrayColumnType.FLOAT8_ARRAY:
        //     return ColumnTypeEnum.DoubleArray;
        // case ArrayColumnType.NUMERIC_ARRAY:
        // case ArrayColumnType.MONEY_ARRAY:
        //     return ColumnTypeEnum.NumericArray;
        // case ArrayColumnType.BOOL_ARRAY:
        //     return ColumnTypeEnum.BooleanArray;
        // case ArrayColumnType.CHAR_ARRAY:
        //     return ColumnTypeEnum.CharacterArray;
        // case ArrayColumnType.BPCHAR_ARRAY:
        // case ArrayColumnType.TEXT_ARRAY:
        // case ArrayColumnType.VARCHAR_ARRAY:
        // case ArrayColumnType.VARBIT_ARRAY:
        // case ArrayColumnType.BIT_ARRAY:
        // case ArrayColumnType.INET_ARRAY:
        // case ArrayColumnType.CIDR_ARRAY:
        // case ArrayColumnType.XML_ARRAY:
        //     return ColumnTypeEnum.TextArray;
        // case ArrayColumnType.DATE_ARRAY:
        //     return ColumnTypeEnum.DateArray;
        // case ArrayColumnType.TIME_ARRAY:
        //     return ColumnTypeEnum.TimeArray;
        // case ArrayColumnType.TIMESTAMP_ARRAY:
        //     return ColumnTypeEnum.DateTimeArray;
        // case ArrayColumnType.JSON_ARRAY:
        // case ArrayColumnType.JSONB_ARRAY:
        //     return ColumnTypeEnum.JsonArray;
        // case ArrayColumnType.BYTEA_ARRAY:
        //     return ColumnTypeEnum.BytesArray;
        // case ArrayColumnType.UUID_ARRAY:
        //     return ColumnTypeEnum.UuidArray;
        // case ArrayColumnType.INT8_ARRAY:
        // case ArrayColumnType.OID_ARRAY:
        //     return ColumnTypeEnum.Int64Array;
        default:
            // Postgres custom types (types that come from extensions and user's enums).
            // We don't use `ColumnTypeEnum.Enum` for enums here and defer the decision to
            // the serializer in QE because it has access to the query schema, while on
            // this level we would have to query the catalog to introspect the type.
            if (fieldTypeId >= 10_000) {
                return ColumnTypeEnum.Text;
            }
            throw new UnsupportedNativeDataType(fieldTypeId);
    }
}

// function normalize_array(element_normalizer: (input: string) => string): (string) => string[] {
//     return (str) => parseArray(str, element_normalizer);
// }

// /****************************/
// /* Time-related data-types  */
// /****************************/

// function normalize_numeric(numeric: string): string {
//     return numeric;
// }

// setTypeParser(DataTypeOIDs.NUMERIC, normalize_numeric);
// setTypeParser(ArrayColumnType.NUMERIC_ARRAY, normalize_array(normalize_numeric));

// /****************************/
// /* Time-related data-types  */
// /****************************/

// function normalize_date(date: string): string {
//     return date;
// }

// function normalize_timestamp(time: string): string {
//     return time;
// }

// function normalize_timestampz(time: string): string {
//     return time.split("+")[0];
// }

// /*
//  * TIME, TIMETZ, TIME_ARRAY - converts value (or value elements) to a string in the format HH:mm:ss.f
//  */

// function normalize_time(time: string): string {
//     return time;
// }

// function normalize_timez(time: string): string {
//     // Although it might be controversial, UTC is assumed in consistency with the behavior of rust postgres driver
//     // in quaint. See quaint/src/connector/postgres/conversion.rs
//     return time.split("+")[0];
// }

// setTypeParser(DataTypeOIDs.TIME, normalize_time);
// setTypeParser(ArrayColumnType.TIME_ARRAY, normalize_array(normalize_time));
// setTypeParser(DataTypeOIDs.TIMETZ, normalize_timez);

// /*
//  * DATE, DATE_ARRAY - converts value (or value elements) to a string in the format YYYY-MM-DD
//  */

// setTypeParser(DataTypeOIDs.DATE, normalize_date);
// setTypeParser(ArrayColumnType.DATE_ARRAY, normalize_array(normalize_date));

// /*
//  * TIMESTAMP, TIMESTAMP_ARRAY - converts value (or value elements) to a string in the rfc3339 format
//  * ex: 1996-12-19T16:39:57-08:00
//  */
// setTypeParser(DataTypeOIDs.TIMESTAMP, normalize_timestamp);
// setTypeParser(ArrayColumnType.TIMESTAMP_ARRAY, normalize_array(normalize_timestamp));
// setTypeParser(DataTypeOIDs.TIMESTAMPTZ, normalize_timestampz);

// /******************/
// /* Money handling */
// /******************/

// function normalize_money(money: string): string {
//     return money.slice(1);
// }

// setTypeParser(DataTypeOIDs.MONEY, normalize_money);
// setTypeParser(ArrayColumnType.MONEY_ARRAY, normalize_array(normalize_money));

// /*****************/
// /* JSON handling */
// /*****************/

// /**
//  * JsonNull are stored in JSON strings as the string "null", distinguishable from
//  * the `null` value which is used by the driver to represent the database NULL.
//  * By default, JSON and JSONB columns use JSON.parse to parse a JSON column value
//  * and this will lead to serde_json::Value::Null in Rust, which will be interpreted
//  * as DbNull.
//  *
//  * By converting "null" to JsonNullMarker, we can signal JsonNull in Rust side and
//  * convert it to QuaintValue::Json(Some(Null)).
//  */
// function toJson(json: string): unknown {
//     return json === "null" ? JsonNullMarker : JSON.parse(json);
// }

// setTypeParser(DataTypeOIDs.JSONB, toJson);
// setTypeParser(DataTypeOIDs.JSON, toJson);

// /************************/
// /* Binary data handling */
// /************************/

// /**
//  * TODO:
//  * 1. Check if using base64 would be more efficient than this encoding.
//  * 2. Consider the possibility of eliminating re-encoding altogether
//  *    and passing bytea hex format to the engine if that can be aligned
//  *    with other adapters of the same database provider.
//  */
// function encodeBuffer(buffer: Buffer) {
//     return Array.from(new Uint8Array(buffer));
// }

// /*
//  * BYTEA - arbitrary raw binary strings
//  */

// const parsePgBytes = getTypeParser(DataTypeOIDs.BYTEA) as (_: string) => Buffer;
// /**
//  * Convert bytes to a JSON-encodable representation since we can't
//  * currently send a parsed Buffer or ArrayBuffer across JS to Rust
//  * boundary.
//  */
// function convertBytes(serializedBytes: string): number[] {
//     const buffer = parsePgBytes(serializedBytes);
//     return encodeBuffer(buffer);
// }

// setTypeParser(DataTypeOIDs.BYTEA, convertBytes);

// /*
//  * BYTEA_ARRAY - arrays of arbitrary raw binary strings
//  */

// const parseBytesArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY) as (_: string) => Buffer[];

// setTypeParser(ArrayColumnType.BYTEA_ARRAY, (serializedBytesArray) => {
//     const buffers = parseBytesArray(serializedBytesArray);
//     return buffers.map((buf) => (buf ? encodeBuffer(buf) : null));
// });

// /* BIT_ARRAY, VARBIT_ARRAY */

// function normalizeBit(bit: string): string {
//     return bit;
// }

// setTypeParser(ArrayColumnType.BIT_ARRAY, normalize_array(normalizeBit));
// setTypeParser(ArrayColumnType.VARBIT_ARRAY, normalize_array(normalizeBit));

// // https://github.com/brianc/node-postgres/pull/2930
// export function fixArrayBufferValues(values: unknown[]) {
//     for (let i = 0; i < values.length; i++) {
//         const list = values[i];
//         if (!Array.isArray(list)) {
//             continue;
//         }

//         for (let j = 0; j < list.length; j++) {
//             const listItem = list[j];
//             if (ArrayBuffer.isView(listItem)) {
//                 list[j] = Buffer.from(listItem.buffer, listItem.byteOffset, listItem.byteLength);
//             }
//         }
//     }

//     return values;
// }
