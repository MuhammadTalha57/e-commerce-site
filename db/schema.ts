import { pgEnum, pgTable, text, real, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["Customer", "Admin"]);

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").notNull(),
});

export const products = pgTable(
    "products",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        description: text("description"),
        price: real("price").notNull(),
        imageUrl: text("imageUrl").notNull(),
    },
    (table) => [check("price_gte_0", sql`${table.price} >= 0`)],
);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
