"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, X } from "lucide-react";
import type { OrderStatus } from "@/db/schema";

// ---------- Status helpers ----------

const STATUS_STYLES: Record<OrderStatus, string> = {
    Pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Processing:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    Shipped:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    Delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const ALL_STATUSES: OrderStatus[] = [
    "Pending",
    "Paid",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

function StatusBadge({ status }: { status: OrderStatus }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
        >
            {status}
        </span>
    );
}

// ---------- Types ----------

interface OrderItem {
    id: string;
    productName: string;
    productImageUrl: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface OrderCardProps {
    order: {
        id: string;
        status: OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        currency: string;
        createdAt: Date | string;
        paidAt: Date | string | null;
        user: { name: string; email: string } | null;
    };
    isAdmin: boolean;
}

// ---------- Component ----------

export default function OrderCard({ order, isAdmin }: OrderCardProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<OrderItem[] | null>(null);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
        order.status,
    );

    const formattedDate = new Date(order.createdAt).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" },
    );

    const openDialog = async () => {
        setOpen(true);
        if (items !== null) return;

        setIsLoadingItems(true);
        try {
            const response = await fetch(`/api/orders/${order.id}`);
            const data = (await response.json()) as {
                success?: boolean;
                data?: { items: OrderItem[] };
                message?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? "Failed to load order items");
            }

            setItems(data.data!.items);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to load order items";
            toast.error(message);
            setOpen(false);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === currentStatus || isUpdatingStatus) return;

        setIsUpdatingStatus(true);
        try {
            const response = await fetch(`/api/orders/${order.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = (await response.json()) as {
                success?: boolean;
                message?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? "Failed to update status");
            }

            setCurrentStatus(newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            router.refresh();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update status";
            toast.error(message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <>
            {/* ---- Summary Card ---- */}
            <button
                onClick={openDialog}
                className="group w-full animate-in fade-in duration-300"
            >
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                    <div className="flex flex-1 flex-wrap items-center gap-4">
                        {/* Order ID */}
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                                Order
                            </p>
                            <p className="font-mono text-sm font-semibold">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>

                        {/* Date */}
                        <div className="hidden sm:block">
                            <p className="text-xs text-muted-foreground">
                                Date
                            </p>
                            <p className="text-sm font-medium">
                                {formattedDate}
                            </p>
                        </div>

                        {/* Customer (admin only) */}
                        {isAdmin && order.user && (
                            <div className="hidden md:block">
                                <p className="text-xs text-muted-foreground">
                                    Customer
                                </p>
                                <p className="max-w-32 truncate text-sm font-medium">
                                    {order.user.name}
                                </p>
                            </div>
                        )}

                        {/* Status */}
                        <div>
                            <p className="mb-0.5 text-xs text-muted-foreground">
                                Status
                            </p>
                            <StatusBadge status={currentStatus} />
                        </div>

                        {/* Total */}
                        <div className="ml-auto text-right">
                            <p className="text-xs text-muted-foreground">
                                Total
                            </p>
                            <p className="text-lg font-bold">
                                ${order.total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
            </button>

            {/* ---- Detail Dialog ---- */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border bg-background shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b p-6">
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <h2 className="text-xl font-bold">
                                        Order Details
                                    </h2>
                                </div>
                                <p className="font-mono text-sm text-muted-foreground">
                                    {order.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 space-y-6 overflow-y-auto p-6">
                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="mb-1 text-xs text-muted-foreground">
                                        Status
                                    </p>
                                    <StatusBadge status={currentStatus} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-muted-foreground">
                                        Ordered
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formattedDate}
                                    </p>
                                </div>
                                {order.paidAt && (
                                    <div>
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            Paid
                                        </p>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                order.paidAt,
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Customer info (admin only) */}
                            {isAdmin && order.user && (
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Customer
                                    </p>
                                    <p className="font-semibold">
                                        {order.user.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.user.email}
                                    </p>
                                </div>
                            )}

                            {/* Admin status changer */}
                            {isAdmin && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Update Status
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_STATUSES.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() =>
                                                    handleStatusChange(s)
                                                }
                                                disabled={isUpdatingStatus}
                                                className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                    currentStatus === s
                                                        ? `${STATUS_STYLES[s]} border-transparent`
                                                        : "border-border bg-transparent hover:bg-muted"
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order items */}
                            <div className="space-y-3">
                                <p className="text-sm font-medium">
                                    Items
                                    {items !== null && (
                                        <span className="ml-1.5 text-muted-foreground">
                                            ({items.length})
                                        </span>
                                    )}
                                </p>

                                {isLoadingItems ? (
                                    <div className="space-y-3">
                                        {[...Array(2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex animate-pulse gap-3"
                                            >
                                                <div className="h-16 w-16 shrink-0 rounded-lg bg-muted" />
                                                <div className="flex-1 space-y-2 pt-1">
                                                    <div className="h-4 w-3/4 rounded bg-muted" />
                                                    <div className="h-3 w-1/2 rounded bg-muted" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(items ?? []).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                                            >
                                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    <Image
                                                        src={
                                                            item.productImageUrl
                                                        }
                                                        alt={item.productName}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                        onError={(e) => {
                                                            (
                                                                e.currentTarget as HTMLImageElement
                                                            ).style.display =
                                                                "none";
                                                        }}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {item.productName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        $
                                                        {item.unitPrice.toFixed(
                                                            2,
                                                        )}{" "}
                                                        each
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="text-sm text-muted-foreground">
                                                        ×{item.quantity}
                                                    </p>
                                                    <p className="font-semibold">
                                                        $
                                                        {item.lineTotal.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pricing summary */}
                            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Tax (10%)
                                    </span>
                                    <span>${order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t p-4 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
