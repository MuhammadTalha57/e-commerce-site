import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import CreateForm from "@/components/ui/products/create-form";
import ProductGrid from "@/components/ui/products/product-grid";
import ProductSearchClient from "@/app/products/search-client";
import { users, products as productsTable } from "@/db/schema";
import db from "@/db/drizzle";
import { eq, and, gte, lte, like } from "drizzle-orm";

async function getProducts(
    search?: string,
    minPrice?: string,
    maxPrice?: string,
    page?: string,
) {
    const pageNum = parseInt(page || "1", 10);
    const limit = 12;
    const offset = (pageNum - 1) * limit;

    const filters = [];

    if (search) {
        filters.push(like(productsTable.name, `%${search}%`));
    }

    if (minPrice) {
        filters.push(gte(productsTable.price, parseFloat(minPrice)));
    }

    if (maxPrice) {
        filters.push(lte(productsTable.price, parseFloat(maxPrice)));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    try {
        const [allProducts, countResult] = await Promise.all([
            db
                .select()
                .from(productsTable)
                .where(whereClause)
                .orderBy(productsTable.name)
                .limit(limit)
                .offset(offset),
            db
                .select({ count: productsTable.id })
                .from(productsTable)
                .where(whereClause),
        ]);

        const total = countResult.length;
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                products: allProducts,
                pagination: {
                    page: pageNum,
                    limit,
                    total,
                    totalPages,
                },
            },
        };
    } catch (error) {
        throw new Error("Failed to fetch products from database");
    }
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
