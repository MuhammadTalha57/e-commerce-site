import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/ui/cart/cart-item";
import CartSummary from "@/components/ui/cart/cart-summary";
import CheckoutStatusToast from "@/components/ui/cart/checkout-status-toast";
import { ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { carts, cartItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";

interface CartData {
    items: Array<{
        id: string;
        product: {
            id: string;
            name: string;
            price: number;
            imageUrl: string;
            description: string | null;
        };
        quantity: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
}

async function getCart(): Promise<CartData | null> {
    try {
        const user = await currentUser();
        if (!user?.id) return null;

        // Get user's cart
        const userCart = await db
            .select()
            .from(carts)
            .where(eq(carts.userId, user.id))
            .limit(1);

        if (!userCart.length) {
            return {
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
            };
        }

        // Get cart items with product details
        const cartItemsResult = await db
            .select({
                id: cartItems.id,
                quantity: cartItems.quantity,
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
            .where(eq(cartItems.cartId, userCart[0].id));

        // Calculate pricing
        const subtotal = cartItemsResult.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0,
        );
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        return {
            items: cartItemsResult.map((item) => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
            })),
            subtotal,
            tax,
            total,
        };
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        return null;
    }
}

export default async function CartPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const cartData = await getCart();

    // Empty cart state
    if (!cartData || cartData.items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
                <CheckoutStatusToast />
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold">Shopping Cart</h1>
                        <p className="mt-2 text-muted-foreground">
                            Review and manage your items
                        </p>
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 py-16 text-center">
                        <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h2 className="mb-2 text-xl font-semibold">
                            Your cart is empty
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Start shopping and add some sneakers to your cart!
                        </p>
                        <Link href="/products">
                            <Button size="lg">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <CheckoutStatusToast />
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">Shopping Cart</h1>
                    <p className="mt-2 text-muted-foreground">
                        Review and manage your items before checkout
                    </p>
                </div>

                {/* Cart Content */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {cartData.items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Continue Shopping Link */}
                        <div className="mt-6">
                            <Link href="/products">
                                <Button variant="outline" className="w-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Cart Summary Sidebar */}
                    <div>
                        <CartSummary
                            subtotal={cartData.subtotal}
                            tax={cartData.tax}
                            total={cartData.total}
                            itemCount={cartData.items.length}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
