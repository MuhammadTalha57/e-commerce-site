import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { orders, users } from "@/db/schema";
import type { OrderStatus } from "@/db/schema";

const VALID_STATUSES = new Set<string>([
    "Pending",
    "Paid",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
]);

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await currentUser();

        if (!user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!dbUser.length || dbUser[0].role !== "Admin") {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 },
            );
        }

        const { id } = await params;
        const body = (await request.json()) as { status?: string };

        if (!body.status || !VALID_STATUSES.has(body.status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status" },
                { status: 400 },
            );
        }

        const updated = await db
            .update(orders)
            .set({ status: body.status as OrderStatus, updatedAt: new Date() })
            .where(eq(orders.id, id))
            .returning();

        if (!updated.length) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { success: true, data: updated[0] },
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
