import { $ } from "zx";

export default async function setup() {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.match(/localhost/)) {
        throw new Error(
            `Require DATABASE_URL to reference localhost for safety, got: ${process.env.DATABASE_URL}`,
        );
    }
    await $`prisma migrate reset --force`;
}
