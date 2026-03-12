import db from "@/db/drizzle";
import { cartItems } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ itemId: string }> },
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { itemId } = await params;
        const body = await request.json();
        const { quantity } = body;

        if (!quantity || quantity <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid quantity" },
                { status: 400 },
            );
        }

        const updated = await db
            .update(cartItems)
            .set({ quantity })
            .where(eq(cartItems.id, itemId))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json(
                { success: false, message: "Item not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { success: true, message: "Item updated", data: updated[0] },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ itemId: string }> },
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { itemId } = await params;

        const deleted = await db
            .delete(cartItems)
            .where(eq(cartItems.id, itemId))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { success: false, message: "Item not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { success: true, message: "Item removed from cart" },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
