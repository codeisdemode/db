import { type InferTableType } from "./columnist";
export declare const messagesTable: import("./columnist").TableDefinition & {
    columns: Record<"id", "number"> & Record<"user_id", "number"> & Record<"content", "string"> & Record<"timestamp", "date"> & Record<"edited", "boolean">;
};
export declare const usersTable: import("./columnist").TableDefinition & {
    columns: Record<"id", "number"> & Record<"email", "string"> & Record<"name", "string"> & Record<"age", "number"> & Record<"metadata", "json"> & Record<"created_at", "date">;
};
export declare const productsTable: import("./columnist").TableDefinition & {
    columns: Record<"id", "number"> & Record<"name", "string"> & Record<"description", "string"> & Record<"price", "number"> & Record<"category", "string"> & Record<"tags", "json"> & Record<"in_stock", "boolean"> & Record<"created_at", "date">;
};
export declare const appSchema: {
    readonly messages: import("./columnist").TableDefinition & {
        columns: Record<"id", "number"> & Record<"user_id", "number"> & Record<"content", "string"> & Record<"timestamp", "date"> & Record<"edited", "boolean">;
    };
    readonly users: import("./columnist").TableDefinition & {
        columns: Record<"id", "number"> & Record<"email", "string"> & Record<"name", "string"> & Record<"age", "number"> & Record<"metadata", "json"> & Record<"created_at", "date">;
    };
    readonly products: import("./columnist").TableDefinition & {
        columns: Record<"id", "number"> & Record<"name", "string"> & Record<"description", "string"> & Record<"price", "number"> & Record<"category", "string"> & Record<"tags", "json"> & Record<"in_stock", "boolean"> & Record<"created_at", "date">;
    };
};
export type MessageType = InferTableType<typeof messagesTable>;
export type UserType = InferTableType<typeof usersTable>;
export type ProductType = InferTableType<typeof productsTable>;
//# sourceMappingURL=schema-examples.d.ts.map