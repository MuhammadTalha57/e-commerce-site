"use client";

import { Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CartItemProps {
    item: {
        id: string;
        product: {
            id: string;
            name: string;
            price: number;
            imageUrl: string;
            description: string | null;
        };
        quantity: number;
    };
}

export default function CartItem({ item }: CartItemProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(item.quantity);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleQuantityChange = useCallback(
        async (newQuantity: number) => {
            if (newQuantity < 1) return;

            const oldQuantity = quantity;
            setQuantity(newQuantity);
            setIsUpdating(true);

            try {
                const response = await fetch(`/api/cart/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: newQuantity }),
                });

                if (!response.ok) {
                    throw new Error("Failed to update quantity");
                }

                toast.success("Quantity updated");
                router.refresh();
            } catch (error) {
                setQuantity(oldQuantity);
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update quantity";
                toast.error(message);
            } finally {
                setIsUpdating(false);
            }
        },
        [item.id, quantity, router],
    );

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/cart/${item.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to remove item");
            }

            toast.success("Item removed from cart");
            setOpenDelete(false);
            router.refresh();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to remove item";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    }, [item.id, router]);

    const itemTotal = item.product.price * quantity;

    return (
        <div className="flex gap-4 rounded-lg border bg-card p-4 animate-in fade-in duration-300">
            {/* Product Image */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                />
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <h3 className="font-semibold">{item.product.name}</h3>
                    {item.product.description && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                            {item.product.description}
                        </p>
                    )}
                    <p className="mt-1 text-lg font-bold">
                        ${item.product.price.toFixed(2)}
                    </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={isUpdating || quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                            {quantity}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={isUpdating}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                        <AlertDialogTrigger asChild>
                            <button
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md p-2 text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                                title="Remove from cart"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Remove{" "}
                                    <span className="font-semibold text-foreground">
                                        {item.product.name}
                                    </span>{" "}
                                    from your cart?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    {isDeleting ? "Removing..." : "Remove"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Item Total */}
            <div className="flex flex-col items-end justify-between">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-xl font-bold">${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
