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
] as const satisfies (keyof Prisma.KitchenSinkSelect)[];

export const SEED_ROWS = [
    {
        id: "1",
        is_valid: true,
        count_int: -10,
        count_bingint: BigInt(1_000_000),
        count_float: 10,
        count_decimal: new Prisma.Decimal("-9.777"),
        datetime: FIXED_DATE,
        timestamp_tz: FIXED_DATE_2,
        time_without_zone: FIXED_DATE,
        time_with_zone: FIXED_DATE_2,
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
