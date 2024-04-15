/** @type {import("prettier").Config} */
const prettierConfig = {
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    bracketSpacing: true,
    jsxSingleQuote: false,
    printWidth: 100,
    proseWrap: "always",
    semi: true,
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "all",
    /**
     * @see https://github.com/trivago/prettier-plugin-sort-imports
     */
    //  importOrder: [
    //     "<THIRD_PARTY_MODULES>",
    //     "^@/tests(.*)$",
    //     "^@/common(.*)$",
    //     "^@/trpc(.*)$",
    //     "^@/server(.*)$",
    //     "^@/state(.*)$",
    //     "^@/ui(.*)$",
    //     "^[./]",
    // ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};

export default prettierConfig;
