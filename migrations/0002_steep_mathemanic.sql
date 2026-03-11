ALTER TABLE "products" ADD COLUMN "quantity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "quantity_gte_0" CHECK ("products"."quantity" >= 0);