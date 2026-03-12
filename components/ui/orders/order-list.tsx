"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderCard from "@/components/ui/orders/order-card";
import type { OrderStatus } from "@/db/schema";

interface Order {
    id: string;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    createdAt: Date | string;
    paidAt: Date | string | null;
    user: { name: string; email: string } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface OrderListProps {
    orders: Order[];
    isAdmin: boolean;
    pagination: Pagination;
}

export default function OrderList({
    orders,
    isAdmin,
    pagination,
}: OrderListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", page.toString());
        router.push(`/orders?${newParams.toString()}`);
    };

    if (orders.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                <div>
                    <h3 className="text-lg font-semibold">No orders found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your search or status filter
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} isAdmin={isAdmin} />
                ))}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} (
                        {pagination.total} total)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() =>
                                handlePageChange(pagination.page - 1)
                            }
                        >
                            Previous
                        </Button>
                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            const isNear =
                                Math.abs(pageNum - pagination.page) <= 1;
                            const isFirst = pageNum === 1;
                            const isLast = pageNum === pagination.totalPages;

                            if (!isNear && !isFirst && !isLast) return null;

                            return (
                                <Button
                                    key={pageNum}
                                    variant={
                                        pageNum === pagination.page
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() =>
                                handlePageChange(pagination.page + 1)
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
