import {
    type IAllColumns,
    INVALID_COLUMNS,
    type IValidColumns,
    SEED_ROWS,
    VALID_COLUMNS,
} from "../prisma/seed.js";
import { PrismaPg } from "./index.js";
import { type Prisma, PrismaClient } from "@prisma/client";
import { Pool, type PoolConfiguration } from "postgresql-client";
import { afterAll, beforeAll, describe, it } from "vitest";

function columnsToSelection<T extends IAllColumns[]>(columnNames: T) {
    return Object.fromEntries(columnNames.map((x) => [x, true])) as {
        [k in T[number]]: true;
    } satisfies Prisma.KitchenSinkSelect;
}

const POOL_CONFIGURATION: PoolConfiguration = {
    host: "postgres://localhost",
    user: "postgres",
    password: "password",
};

describe("Client initialization", () => {
    it("Should setup the client", async ({ expect }) => {
        const pgPool = new Pool(POOL_CONFIGURATION);
        const adapter = new PrismaPg(pgPool);
        const prisma = new PrismaClient({ adapter });
        await prisma.$connect();
        const rowCount = await prisma.kitchenSink.count();
        expect(rowCount).toEqual(SEED_ROWS.length);
    });
});

describe("Data Checks", () => {
    let prisma: PrismaClient;

    beforeAll(async () => {
        const pgPool = new Pool(POOL_CONFIGURATION);
        const adapter = new PrismaPg(pgPool);
        const prismaClient = new PrismaClient({ adapter });
        await prismaClient.$connect();
        prisma = prismaClient;
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("Should throw an error for unsupported columns", async ({ expect }) => {
        expect(
            prisma.kitchenSink.findMany({
                select: columnsToSelection(INVALID_COLUMNS),
            }),
        ).rejects.toThrowError(/Inconsistent column data:/);
    });

    it("Should have parity with a raw postgres client", async ({ expect }) => {
        const validColumnSelection = columnsToSelection(VALID_COLUMNS);
        const rawPrismaClient = new PrismaClient();
        try {
            const allRowsAdapter = await prisma.kitchenSink.findMany({
                select: validColumnSelection,
            });
            const allRowsOriginalPrisma = await prisma.kitchenSink.findMany({
                select: validColumnSelection,
            });
            expect(allRowsAdapter).toEqual(allRowsOriginalPrisma);
        } finally {
            await rawPrismaClient.$disconnect();
        }
    });

    it("Should match the data for supported columns", async ({ expect }) => {
        // const allColumnSelection = columnsToSelection(VALID_COLUMNS);
        const dateColumns = [
            "datetime",
            "timestamp_tz",
            "time_without_zone",
        ] as const satisfies IValidColumns[];

        const columnsWithoutDates = VALID_COLUMNS.filter(
            (x) => !dateColumns.includes(x as any),
        ) as Exclude<IValidColumns, (typeof dateColumns)[number]>[];
        const nonDateColumnsSelect = columnsToSelection(columnsWithoutDates);

        const dateOnlyColumns = columnsToSelection(dateColumns);

        const dateOnlyRows = await prisma.kitchenSink.findMany({
            select: dateOnlyColumns,
        });
        const firstRowDateData = dateOnlyRows[0];

        expect(firstRowDateData.datetime.getTime()).toEqual(0);
        expect(firstRowDateData.timestamp_tz.getTime()).toEqual(1_000);
        // This needs to be improved -- make it not UTC
        expect(firstRowDateData.time_without_zone.getTime()).toEqual(0);

        const allRowsNoDates = await prisma.kitchenSink.findMany({
            select: nonDateColumnsSelect,
        });

        // Check all the non time-related rows
        const rowWithoutInvalidColumnsAndTimes = Object.fromEntries(
            Object.entries(SEED_ROWS[0]).filter(([columnName]) =>
                columnsWithoutDates.includes(columnName as any),
            ),
        );

        expect(allRowsNoDates[0]).toEqual(rowWithoutInvalidColumnsAndTimes);
    });
});
