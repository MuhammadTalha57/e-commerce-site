CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" real NOT NULL,
	"imageUrl" text NOT NULL,
	CONSTRAINT "price_gte_0" CHECK ("products"."price" >= 0)
);
