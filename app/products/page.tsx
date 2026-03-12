import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import CreateForm from "@/components/ui/products/create-form";
import ProductGrid from "@/components/ui/products/product-grid";
import ProductSearchClient from "@/app/products/search-client";
import { users } from "@/db/schema";
import db from "@/db/drizzle";
import { eq } from "drizzle-orm";

async function getProducts(
    search?: string,
    minPrice?: string,
    maxPrice?: string,
    page?: string,
) {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set("search", search);
    if (minPrice) searchParams.set("minPrice", minPrice);
    if (maxPrice) searchParams.set("maxPrice", maxPrice);
    searchParams.set("page", page || "1");
    searchParams.set("limit", "12");

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products?${searchParams}`,
        { cache: "no-store" },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    return response.json();
}

async function checkIsAdmin(): Promise<boolean> {
    try {
        const user = await currentUser();
        if (!user) return false;

        const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id));

        return dbUser.length > 0 && dbUser[0].role === "Admin";
    } catch {
        return false;
    }
}

interface ProductsPageProps {
    searchParams: Promise<{
        search?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
    }>;
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
    const params = await searchParams;
    const isAdmin = await checkIsAdmin();

    const result = await getProducts(
        params.search,
        params.minPrice,
        params.maxPrice,
        params.page,
    );

    const { products, pagination } = result.data;
    const currentPage = pagination.page;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="mt-1 text-muted-foreground">
                        Browse our collection of premium sneakers
                    </p>
                </div>
                {isAdmin && <CreateForm />}
            </div>

            {/* Search & Filters */}
            <ProductSearchClient />

            {/* Products Grid */}
            <ProductGrid
                products={products}
                isAdmin={isAdmin}
                pagination={pagination}
            />
        </div>
    );
}

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    return (
        <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
            <Suspense
                fallback={
                    <div className="space-y-4">
                        <div className="h-12 animate-pulse rounded-lg bg-muted" />
                        <div className="h-40 animate-pulse rounded-lg bg-muted" />
                    </div>
                }
            >
                <ProductsContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}
