CREATE TYPE "public"."order_status" AS ENUM('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"productName" text NOT NULL,
	"productImageUrl" text NOT NULL,
	"unitPrice" real NOT NULL,
	"quantity" integer NOT NULL,
	"lineTotal" real NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_item_quantity_gt_0" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_item_unit_price_gte_0" CHECK ("order_items"."unitPrice" >= 0),
	CONSTRAINT "order_item_line_total_gte_0" CHECK ("order_items"."lineTotal" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"status" "order_status" DEFAULT 'Pending' NOT NULL,
	"subtotal" real NOT NULL,
	"tax" real NOT NULL,
	"total" real NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripeSessionId" text,
	"paidAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_stripeSessionId_unique" UNIQUE("stripeSessionId")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;