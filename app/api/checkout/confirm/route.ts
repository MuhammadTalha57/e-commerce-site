import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { carts, cartItems, orders } from "@/db/schema";
import { getStripeServerClient } from "@/lib/stripe";

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();

        if (!user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = (await request.json()) as { sessionId?: string };

        if (!body.sessionId) {
            return NextResponse.json(
                { success: false, message: "sessionId is required" },
                { status: 400 }
            );
        }

        const stripe = getStripeServerClient();
        const session = await stripe.checkout.sessions.retrieve(body.sessionId);

        const orderId = session.client_reference_id ?? session.metadata?.orderId;
        const sessionUserId = session.metadata?.userId;

        if (!orderId || !sessionUserId || sessionUserId !== user.id) {
            return NextResponse.json(
                { success: false, message: "Invalid checkout session" },
                { status: 403 }
            );
        }

        const orderResult = await db
            .select()
            .from(orders)
            .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
            .limit(1);

        if (!orderResult.length) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 }
            );
        }

        const order = orderResult[0];

        if (session.payment_status !== "paid") {
            return NextResponse.json(
                { success: false, message: "Payment not completed" },
                { status: 400 }
            );
        }

        if (order.status !== "Paid") {
            await db
                .update(orders)
                .set({
                    status: "Paid",
                    paidAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(and(eq(orders.id, order.id), eq(orders.userId, user.id)));

            const userCart = await db
                .select()
                .from(carts)
                .where(eq(carts.userId, user.id))
                .limit(1);

            if (userCart.length) {
                await db
                    .delete(cartItems)
                    .where(eq(cartItems.cartId, userCart[0].id));
            }
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    orderId: order.id,
                    status: "Paid",
                },
            },
            { status: 200 }
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to confirm payment";

        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }
}
