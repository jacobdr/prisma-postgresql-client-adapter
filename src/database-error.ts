import type { DatabaseError } from "postgresql-client/typings/protocol/database-error.js";

export function isDatabaseError(input: any): input is DatabaseError {
    if (typeof input !== "object") {
        return false;
    }

    if ("severity" in input && "code" in input && "message" in input) {
        return true;
    }

    return true;
}
