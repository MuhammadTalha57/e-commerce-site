import { sql } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    text,
    integer,
    check,
    real,
    uuid,
} from "drizzle-orm/pg-core";

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
        id: uuid().defaultRandom().primaryKey(),
        name: text("name").notNull(),
        description: text("description"),
        price: real("price").notNull(),
        imageUrl: text("imageUrl").notNull(),
        quantity: integer("quantity").notNull(),
    },
    (table) => [
        check("price_gte_0", sql`${table.price} >= 0`),
        check("quantity_gte_0", sql`${table.quantity} >= 0`),
    ],
);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
