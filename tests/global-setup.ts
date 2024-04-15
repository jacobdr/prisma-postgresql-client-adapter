import { $ } from "zx";

export default async function setup() {
    await $`prisma migrate reset --force`;
}
