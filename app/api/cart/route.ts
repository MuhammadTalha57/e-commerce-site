import db from "@/db/drizzle";
import { carts, cartItems, products } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get or create cart
        let cart = await db
            .select()
            .from(carts)
            .where(eq(carts.userId, user.id));

        if (cart.length === 0) {
            const newCart = await db
                .insert(carts)
                .values({ userId: user.id })
                .returning();
            cart = newCart;
        }

        // Get cart items with product details
        const items = await db
            .select({
                id: cartItems.id,
                cartId: cartItems.cartId,
                productId: cartItems.productId,
                quantity: cartItems.quantity,
                addedAt: cartItems.addedAt,
                product: {
                    id: products.id,
                    name: products.name,
                    price: products.price,
                    imageUrl: products.imageUrl,
                    description: products.description,
                },
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.cartId, cart[0].id));

        const subtotal = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        return NextResponse.json(
            {
                success: true,
                data: {
                    cart: cart[0],
                    items,
                    pricing: {
                        subtotal: Math.round(subtotal * 100) / 100,
                        tax: Math.round(tax * 100) / 100,
                        total: Math.round(total * 100) / 100,
                    },
                },
            },
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

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { productId, quantity } = body;

        if (!productId || !quantity || quantity <= 0) {
            return NextResponse.json(
                { success: false, message: "Invalid product or quantity" },
                { status: 400 },
            );
        }

        // Get or create cart
        let cart = await db
            .select()
            .from(carts)
            .where(eq(carts.userId, user.id));

        if (cart.length === 0) {
            const newCart = await db
                .insert(carts)
                .values({ userId: user.id })
                .returning();
            cart = newCart;
        }

        // Check if item already in cart
        const existingItem = await db
            .select()
            .from(cartItems)
            .where(
                and(
                    eq(cartItems.cartId, cart[0].id),
                    eq(cartItems.productId, productId),
                ),
            );

        if (existingItem.length > 0) {
            // Update quantity
            await db
                .update(cartItems)
                .set({ quantity: existingItem[0].quantity + quantity })
                .where(eq(cartItems.id, existingItem[0].id));
        } else {
            // Add new item
            await db.insert(cartItems).values({
                cartId: cart[0].id,
                productId,
                quantity,
            });
        }

        return NextResponse.json(
            { success: true, message: "Item added to cart" },
            { status: 201 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
