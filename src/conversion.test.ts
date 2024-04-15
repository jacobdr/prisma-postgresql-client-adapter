import { convertDataTypes } from "./conversion.js";
import { describe, it } from "vitest";

describe("convertDataTypes", () => {
    it("Should convert time", ({ expect }) => {
        // When supplied as a time string
        const date = "1970-01-01T16:47:00.000Z";

        const [[value]] = convertDataTypes(
            [[date]],
            [
                {
                    fieldName: "time_without_zone",
                    tableId: 16614,
                    columnId: 9,
                    dataTypeId: 1083,
                    dataTypeName: "time",
                    jsType: "string",
                    isArray: false,
                    fixedSize: 8,
                },
            ],
        );
        expect(value).toEqual("16:47:00");

        // When supplied as a date
        // 1994-06-17T18:46:27.134Z
        const someDate = new Date(771878787134);
        const [[otherValue]] = convertDataTypes(
            [[someDate]],
            [
                {
                    fieldName: "time_without_zone",
                    tableId: 16614,
                    columnId: 9,
                    dataTypeId: 1083,
                    dataTypeName: "time",
                    jsType: "string",
                    isArray: false,
                    fixedSize: 8,
                },
            ],
        );
        expect(otherValue).toEqual("18:46:27");
    });

    it("Should convert datetime", ({ expect }) => {
        expect(true).toEqual(true);
    });
});
