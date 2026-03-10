import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["Customer", "Admin"]);

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: userRoleEnum("role").notNull(),
});
