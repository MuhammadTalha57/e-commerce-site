import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { orderItems, orders, users } from "@/db/schema";

export async function GET(
    _request: NextRequest,
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

        const { id } = await params;

        const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        const isAdmin = dbUser.length > 0 && dbUser[0].role === "Admin";

        const orderResult = await db
            .select({
                id: orders.id,
                userId: orders.userId,
                status: orders.status,
                subtotal: orders.subtotal,
                tax: orders.tax,
                total: orders.total,
                currency: orders.currency,
                paidAt: orders.paidAt,
                createdAt: orders.createdAt,
                user: {
                    name: users.name,
                    email: users.email,
                },
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .where(
                isAdmin
                    ? eq(orders.id, id)
                    : and(eq(orders.id, id), eq(orders.userId, user.id)),
            )
            .limit(1);

        if (!orderResult.length) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 },
            );
        }

        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, id));

        return NextResponse.json(
            { success: true, data: { order: orderResult[0], items } },
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
