import { $ } from "zx";

export default async function setup() {
    await $`pnpm prisma migrate dev`;
}
