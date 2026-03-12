"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

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
                disabled={isCheckoutDisabled || itemCount === 0}
                className="w-full"
                size="lg"
            >
                Proceed to Checkout
            </Button>

            <Link href="/products">
                <Button variant="outline" className="w-full">
                    Continue Shopping
                </Button>
            </Link>
        </div>
    );
}
