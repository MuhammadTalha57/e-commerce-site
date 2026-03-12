import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc, sql, count } from "drizzle-orm";
import db from "@/db/drizzle";
import { users, orders, type OrderStatus } from "@/db/schema";
import OrderList from "@/components/ui/orders/order-list";
import OrderSearchClient from "@/app/orders/search-client";

// ---------- Auth helpers ----------

async function getCurrentUserId(): Promise<string | null> {
    const user = await currentUser();
    return user?.id ?? null;
}

async function checkIsAdmin(userId: string): Promise<boolean> {
    try {
        const [dbUser] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
        return dbUser?.role === "Admin";
    } catch {
        return false;
    }
}

// ---------- Data fetching ----------

async function getOrders(
    userId: string,
    isAdmin: boolean,
    search?: string,
    status?: string,
    page?: string,
) {
    const pageNum = Math.max(1, parseInt(page || "1", 10));
    const limit = 10;
    const offset = (pageNum - 1) * limit;

    const filters = [];

    // Customers only see their own orders
    if (!isAdmin) {
        filters.push(eq(orders.userId, userId));
    }

    // Search by order ID (UUID cast to text)
    if (search?.trim()) {
        const searchTerm = `%${search.trim()}%`;
        filters.push(sql`${orders.id}::text ilike ${searchTerm}`);
    }

    // Status filter — validate against allowed values
    const validStatuses: OrderStatus[] = [
        "Pending",
        "Paid",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ];
    if (status && validStatuses.includes(status as OrderStatus)) {
        filters.push(eq(orders.status, status as OrderStatus));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [rows, [{ total }]] = await Promise.all([
        db
            .select({
                id: orders.id,
                userId: orders.userId,
                status: orders.status,
                subtotal: orders.subtotal,
                tax: orders.tax,
                total: orders.total,
                currency: orders.currency,
                createdAt: orders.createdAt,
                paidAt: orders.paidAt,
                userName: users.name,
                userEmail: users.email,
            })
            .from(orders)
            .leftJoin(users, eq(orders.userId, users.id))
            .where(whereClause)
            .orderBy(desc(orders.createdAt))
            .limit(limit)
            .offset(offset),
        db.select({ total: count() }).from(orders).where(whereClause),
    ]);

    const orderList = rows.map((r) => ({
        id: r.id,
        status: r.status,
        subtotal: r.subtotal,
        tax: r.tax,
        total: r.total,
        currency: r.currency,
        createdAt: r.createdAt,
        paidAt: r.paidAt,
        user:
            r.userName && r.userEmail
                ? { name: r.userName, email: r.userEmail }
                : null,
    }));

    return {
        orders: orderList,
        pagination: {
            page: pageNum,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
}

// ---------- Content (async sub-component inside Suspense) ----------

interface OrdersPageProps {
    searchParams: Promise<{
        search?: string;
        status?: string;
        page?: string;
    }>;
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
    const params = await searchParams;
    const userId = await getCurrentUserId();
    if (!userId) redirect("/sign-in");

    const isAdmin = await checkIsAdmin(userId);

    const { orders: orderList, pagination } = await getOrders(
        userId,
        isAdmin,
        params.search,
        params.status,
        params.page,
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Orders</h1>
                <p className="mt-1 text-muted-foreground">
                    {isAdmin
                        ? "Manage all customer orders"
                        : "View and track your orders"}
                </p>
            </div>

            {/* Search + Status Filters */}
            <OrderSearchClient />

            {/* Orders List */}
            <OrderList
                orders={orderList}
                isAdmin={isAdmin}
                pagination={pagination}
            />
        </div>
    );
}

// ---------- Page ----------

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    return (
        <main className="mx-auto max-w-4xl px-6 pt-24 pb-16">
            <Suspense
                fallback={
                    <div className="space-y-4">
                        <div className="h-12 animate-pulse rounded-lg bg-muted" />
                        <div className="h-64 animate-pulse rounded-lg bg-muted" />
                    </div>
                }
            >
                <OrdersContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}
