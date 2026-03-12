import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { carts, cartItems, orderItems, orders, products } from "@/db/schema";
import { getStripeServerClient } from "@/lib/stripe";

const TAX_RATE = 0.1;

function getStripeSafeImageUrl(imageUrl: string | null | undefined) {
    if (!imageUrl) return undefined;

    const normalized = imageUrl.trim();

    if (!normalized || normalized.length > 2048) {
        return undefined;
    }

    try {
        const parsed = new URL(normalized);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return undefined;
        }
        return normalized;
    } catch {
        return undefined;
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();

        if (!user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const userCart = await db
            .select()
            .from(carts)
            .where(eq(carts.userId, user.id))
            .limit(1);

        if (!userCart.length) {
            return NextResponse.json(
                { success: false, message: "Cart is empty" },
                { status: 400 },
            );
        }

        const items = await db
            .select({
                cartItemId: cartItems.id,
                quantity: cartItems.quantity,
                product: {
                    id: products.id,
                    name: products.name,
                    imageUrl: products.imageUrl,
                    price: products.price,
                    stock: products.quantity,
                },
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.cartId, userCart[0].id));

        if (!items.length) {
            return NextResponse.json(
                { success: false, message: "Cart is empty" },
                { status: 400 },
            );
        }

        const invalidStockItem = items.find(
            (item) =>
                item.quantity > item.product.stock || item.product.stock <= 0,
        );

        if (invalidStockItem) {
            return NextResponse.json(
                {
                    success: false,
                    message: `${invalidStockItem.product.name} does not have enough stock`,
                },
                { status: 400 },
            );
        }

        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;

        const createdOrders = await db
            .insert(orders)
            .values({
                userId: user.id,
                status: "Pending",
                subtotal,
                tax,
                total,
                currency: "usd",
            })
            .returning();

        const createdOrder = createdOrders[0];

        await db.insert(orderItems).values(
            items.map((item) => ({
                orderId: createdOrder.id,
                productId: item.product.id,
                productName: item.product.name,
                productImageUrl: item.product.imageUrl,
                unitPrice: Number(item.product.price),
                quantity: item.quantity,
                lineTotal: Number(item.product.price) * item.quantity,
            })),
        );

        try {
            const stripe = getStripeServerClient();
            const origin = request.nextUrl.origin;

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: items.map((item) => {
                    const imageUrl = getStripeSafeImageUrl(
                        item.product.imageUrl,
                    );

                    return {
                        quantity: item.quantity,
                        price_data: {
                            currency: "usd",
                            unit_amount: Math.round(
                                Number(item.product.price) * 100,
                            ),
                            product_data: {
                                name: item.product.name,
                                images: imageUrl ? [imageUrl] : undefined,
                            },
                        },
                    };
                }),
                metadata: {
                    orderId: createdOrder.id,
                    userId: user.id,
                },
                client_reference_id: createdOrder.id,
                success_url: `${origin}/cart?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/cart?checkout=cancel`,
            });

            await db
                .update(orders)
                .set({
                    stripeSessionId: session.id,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(orders.id, createdOrder.id),
                        eq(orders.userId, user.id),
                    ),
                );

            return NextResponse.json(
                {
                    success: true,
                    data: {
                        checkoutUrl: session.url,
                        sessionId: session.id,
                    },
                },
                { status: 200 },
            );
        } catch (stripeError) {
            await db.delete(orders).where(eq(orders.id, createdOrder.id));
            throw stripeError;
        }
    } catch (error) {
        console.error(error);
        const message =
            error instanceof Error
                ? error.message
                : "Failed to create checkout session";

        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
