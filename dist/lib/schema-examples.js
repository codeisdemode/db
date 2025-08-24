"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appSchema = exports.productsTable = exports.usersTable = exports.messagesTable = void 0;
const zod_1 = require("zod");
const columnist_1 = require("./columnist");
// Example 1: Basic schema with auto-validation
exports.messagesTable = (0, columnist_1.defineTable)()
    .column("id", "number")
    .column("user_id", "number")
    .column("content", "string")
    .column("timestamp", "date")
    .column("edited", "boolean")
    .primaryKey("id")
    .searchable("content")
    .indexes("user_id", "timestamp")
    .build();
// Example 2: Advanced schema with custom validation
exports.usersTable = (0, columnist_1.defineTable)()
    .column("id", "number")
    .column("email", "string")
    .column("name", "string")
    .column("age", "number")
    .column("metadata", "json")
    .column("created_at", "date")
    .primaryKey("id")
    .searchable("name", "email")
    .indexes("email", "created_at")
    .validate(zod_1.z.object({
    id: zod_1.z.number().optional(),
    email: zod_1.z.string().email("Invalid email format"),
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    age: zod_1.z.number().min(13, "Must be at least 13 years old").max(120, "Age must be realistic"),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    created_at: zod_1.z.date().optional().default(() => new Date())
}))
    .build();
// Example 3: Product catalog with complex validation
exports.productsTable = (0, columnist_1.defineTable)()
    .column("id", "number")
    .column("name", "string")
    .column("description", "string")
    .column("price", "number")
    .column("category", "string")
    .column("tags", "json")
    .column("in_stock", "boolean")
    .column("created_at", "date")
    .primaryKey("id")
    .searchable("name", "description")
    .indexes("category", "price", "in_stock")
    .validate(zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string().min(1, "Product name is required"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    price: zod_1.z.number().positive("Price must be positive"),
    category: zod_1.z.enum(["electronics", "clothing", "books", "home", "other"]),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    in_stock: zod_1.z.boolean().default(true),
    created_at: zod_1.z.date().default(() => new Date())
}))
    .build();
// Type-safe schema definition
exports.appSchema = {
    messages: exports.messagesTable,
    users: exports.usersTable,
    products: exports.productsTable
};
// Usage examples with type safety:
/*
// Initialize with schema
const db = await Columnist.init("my-app", { schema: appSchema })
const typed = db.typed<typeof appSchema>()

// Type-safe inserts
await typed.insert({
  email: "user@example.com",
  name: "John Doe",
  age: 25,
  metadata: { role: "admin" }
}, "users")

// Type-safe queries
const users = await typed.find({
  table: "users",
  where: { age: { $gte: 18 } },
  orderBy: "created_at"
})

// Type-safe search
const products = await typed.search("laptop", {
  table: "products",
  category: "electronics"
})

// TypeScript will catch errors:
await typed.insert({
  email: "invalid-email", // Validation error: Invalid email format
  name: "A", // Validation error: Name must be at least 2 characters
  age: 12   // Validation error: Must be at least 13 years old
}, "users")
*/
