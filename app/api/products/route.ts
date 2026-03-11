import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allProducts = await db.select().from(products);

        return NextResponse.json(
            {
                success: true,
                message: "All Products Fetched",
                data: allProducts,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const insertedProduct = await db
            .insert(products)
            .values({
                name: body.name,
                description: body.description,
                price: body.price,
                imageUrl: body.imageUrl,
                quantity: body.quantity,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Product Created",
                data: insertedProduct[0],
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 },
        );
    }
}
