"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/db/schema";

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | "" }> = [
    { label: "All", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Paid", value: "Paid" },
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
];

// Coloured pill styles per status
const STATUS_PILL: Record<string, string> = {
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

export default function OrderSearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const activeStatus = searchParams.get("status") ?? "";

    const push = useCallback(
        (newSearch: string, newStatus: string) => {
            const params = new URLSearchParams();
            if (newSearch.trim()) params.set("search", newSearch.trim());
            if (newStatus) params.set("status", newStatus);
            params.set("page", "1");
            router.push(`/orders?${params.toString()}`);
        },
        [router],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        push(search, activeStatus);
    };

    const hasFilters = search.trim() !== "" || activeStatus !== "";

    return (
        <div className="space-y-5 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Filter Orders</h2>

            {/* Search by order ID */}
            <form onSubmit={handleSubmit}>
                <label className="mb-2 block text-sm font-medium">
                    Order ID
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by order ID…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-md border bg-background pl-10 pr-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                    {hasFilters && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch("");
                                router.push("/orders");
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </form>

            {/* Status filter pills */}
            <div>
                <p className="mb-2 text-sm font-medium">Status</p>
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(({ label, value }) => {
                        const isActive = activeStatus === value;
                        return (
                            <button
                                key={label}
                                onClick={() => push(search, value)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                    isActive
                                        ? value
                                            ? `${STATUS_PILL[value]} border-transparent`
                                            : "border-transparent bg-foreground text-background"
                                        : "border-border bg-transparent hover:bg-muted"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
