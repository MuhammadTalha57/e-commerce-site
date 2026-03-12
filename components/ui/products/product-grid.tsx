"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/products/product-card";
import { Button } from "@/components/ui/button";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string;
    quantity: number;
}

interface ProductGridProps {
    products: Product[];
    isAdmin?: boolean;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    isLoading?: boolean;
}

export default function ProductGrid({
    products,
    isAdmin = false,
    pagination,
    isLoading = false,
}: ProductGridProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleDelete = async (id: string) => {
        const response = await fetch(`/api/products/${id}`, {
            method: "DELETE",
        });

        const data = (await response.json()) as {
            success?: boolean;
            message?: string;
        };

        if (!response.ok || !data.success) {
            throw new Error(data.message ?? "Failed to delete product");
        }

        router.refresh();
    };

    const handlePageChange = (page: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", page.toString());
        router.push(`/products?${newParams.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse rounded-2xl bg-muted aspect-square"
                    />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex min-h-96 items-center justify-center rounded-xl border border-dashed">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">No products found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your search filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isAdmin={isAdmin}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
                    <div className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} (
                        {pagination.total} total)
                    </div>
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
