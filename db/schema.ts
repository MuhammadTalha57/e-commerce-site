import { sql } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    text,
    integer,
    check,
    real,
    uuid,
    timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["Customer", "Admin"]);
export const orderStatusEnum = pgEnum("order_status", [
    "Pending",
    "Paid",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
]);

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

export const carts = pgTable("carts", {
    id: uuid().defaultRandom().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const cartItems = pgTable(
    "cart_items",
    {
        id: uuid().defaultRandom().primaryKey(),
        cartId: uuid("cartId")
            .notNull()
            .references(() => carts.id, { onDelete: "cascade" }),
        productId: uuid("productId")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        quantity: integer("quantity").notNull(),
        addedAt: timestamp("addedAt").defaultNow().notNull(),
    },
    (table) => [check("cart_quantity_gt_0", sql`${table.quantity} > 0`)],
);

export const orders = pgTable("orders", {
    id: uuid().defaultRandom().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull().default("Pending"),
    subtotal: real("subtotal").notNull(),
    tax: real("tax").notNull(),
    total: real("total").notNull(),
    currency: text("currency").notNull().default("usd"),
    stripeSessionId: text("stripeSessionId").unique(),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderItems = pgTable(
    "order_items",
    {
        id: uuid().defaultRandom().primaryKey(),
        orderId: uuid("orderId")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),
        productId: uuid("productId")
            .notNull()
            .references(() => products.id),
        productName: text("productName").notNull(),
        productImageUrl: text("productImageUrl").notNull(),
        unitPrice: real("unitPrice").notNull(),
        quantity: integer("quantity").notNull(),
        lineTotal: real("lineTotal").notNull(),
        createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (table) => [
        check("order_item_quantity_gt_0", sql`${table.quantity} > 0`),
        check("order_item_unit_price_gte_0", sql`${table.unitPrice} >= 0`),
        check("order_item_line_total_gte_0", sql`${table.lineTotal} >= 0`),
    ],
);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
