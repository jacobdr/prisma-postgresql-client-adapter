declare module "postgres-array" {
    export function parse(input: string, parsingFunc: (input: string) => T): T;
}
