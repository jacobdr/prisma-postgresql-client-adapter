import { PrismaPg } from "./postgresql-client.js";
import { Connection, Pool } from "postgresql-client";
import { describe, test } from "vitest";

describe("validation", () => {
    test("throws if passed Client instance", ({ expect }) => {
        const client = new Connection();

        expect(() => {
            // @ts-expect-error
            new PrismaPg(client);
        })
            .toThrowErrorMatchingInlineSnapshot(`[TypeError: PrismaPg must be initialized with an instance of Pool:
import { Pool } from 'postgresql-client'
const pool = new Pool({ connectionString: url })
const adapter = new PrismaPg(pool)
]`);
    });

    test("accepts Pool instance", ({ expect }) => {
        const pool = new Pool();

        expect(() => {
            new PrismaPg(pool);
        }).not.toThrow();
    });
});
