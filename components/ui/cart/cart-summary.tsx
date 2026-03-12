"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

interface CartSummaryProps {
    subtotal: number;
    tax: number;
    total: number;
    itemCount: number;
    isCheckoutDisabled?: boolean;
}

export default function CartSummary({
    subtotal,
    tax,
    total,
    itemCount,
    isCheckoutDisabled = false,
}: CartSummaryProps) {
    const [isRedirectingToCheckout, setIsRedirectingToCheckout] =
        useState(false);

    const handleCheckout = async () => {
        setIsRedirectingToCheckout(true);

        try {
            const response = await fetch("/api/checkout/session", {
                method: "POST",
            });

            const data = (await response.json()) as {
                success?: boolean;
                message?: string;
                data?: {
                    checkoutUrl?: string;
                };
            };

            if (!response.ok || !data.success || !data.data?.checkoutUrl) {
                throw new Error(
                    data.message ?? "Failed to start Stripe checkout",
                );
            }

            window.location.href = data.data.checkoutUrl;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to start checkout";
            toast.error(message);
            setIsRedirectingToCheckout(false);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-t border-dashed pt-4">
                <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                        ${total.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </div>

            <Button
                disabled={
                    isCheckoutDisabled ||
                    itemCount === 0 ||
                    isRedirectingToCheckout
                }
                className="w-full"
                size="lg"
                onClick={handleCheckout}
            >
                {isRedirectingToCheckout
                    ? "Redirecting to Stripe..."
                    : "Proceed to Checkout"}
            </Button>

            <Link href="/products">
                <Button variant="outline" className="w-full">
                    Continue Shopping
                </Button>
            </Link>
        </div>
    );
}
