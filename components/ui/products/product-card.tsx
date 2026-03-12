"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
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
import EditForm from "@/components/ui/products/edit-form";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string;
        quantity: number;
    };
    isAdmin?: boolean;
    onDelete?: (id: string) => Promise<void>;
}

export default function ProductCard({
    product,
    isAdmin = false,
    onDelete,
}: ProductCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete?.(product.id);
            toast.success("Product deleted successfully");
            setOpen(false);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to delete";
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const inStock = product.quantity > 0;

    return (
        <div className="group animate-in fade-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl dark:hover:shadow-xl/40">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <p className="text-lg font-semibold text-white">
                                Out of Stock
                            </p>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 p-4">
                    <div className="min-h-16">
                        <h3 className="line-clamp-2 text-base font-semibold leading-tight">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Price & Stock */}
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-2xl font-bold">
                            ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {product.quantity} in stock
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="flex-1"
                            disabled={!inStock}
                            onClick={() => toast.info("Added to cart!")}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                        </Button>

                        {isAdmin && (
                            <div className="flex gap-1">
                                <EditForm product={product} />
                                <AlertDialog open={open} onOpenChange={setOpen}>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            disabled={isDeleting}
                                            className="inline-flex items-center justify-center rounded-md p-1.5 text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                                            title="Delete product"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete Product
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete{" "}
                                                <span className="font-semibold text-foreground">
                                                    {product.name}
                                                </span>
                                                ? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                disabled={isDeleting}
                                            >
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {isDeleting
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
