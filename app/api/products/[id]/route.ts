import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const product = await db
            .select()
            .from(products)
            .where(eq(products.id, params.id));

        return NextResponse.json(
            {
                success: product.length > 0,
                message:
                    product.length > 0
                        ? "Product Fetched"
                        : "Product Not Found",
                data: product.length > 0 ? product[0] : null,
            },
            { status: product.length > 0 ? 200 : 404 },
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

export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const body = await req.json();

        const updatedProduct = await db
            .update(products)
            .set({
                name: body.name,
                description: body.description,
                price: body.price,
                imageUrl: body.imageUrl,
                quantity: body.quantity,
            })
            .where(eq(products.id, params.id))
            .returning();

        return NextResponse.json(
            {
                success: updatedProduct.length > 0,
                message:
                    updatedProduct.length > 0
                        ? "Product Updated"
                        : "Product Not Updated",
                data: updatedProduct.length > 0 ? updatedProduct[0] : null,
            },
            { status: updatedProduct.length > 0 ? 200 : 400 },
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

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const deletedProduct = await db
            .delete(products)
            .where(eq(products.id, params.id))
            .returning();

        return NextResponse.json(
            {
                success: deletedProduct.length > 0,
                message:
                    deletedProduct.length > 0
                        ? "Product Deleted"
                        : "Product Not Deleted",
                data: deletedProduct.length > 0 ? deletedProduct[0] : null,
            },
            { status: deletedProduct.length > 0 ? 200 : 400 },
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
