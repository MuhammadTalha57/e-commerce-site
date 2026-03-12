"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function ProductSearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [minPrice, setMinPrice] = useState(
        searchParams.get("minPrice") || "",
    );
    const [maxPrice, setMaxPrice] = useState(
        searchParams.get("maxPrice") || "",
    );

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (minPrice) params.set("minPrice", minPrice);
            if (maxPrice) params.set("maxPrice", maxPrice);
            params.set("page", "1");

            router.push(`/products?${params.toString()}`);
        },
        [search, minPrice, maxPrice, router],
    );

    const handleReset = useCallback(() => {
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        router.push("/products");
    }, [router]);

    return (
        <form
            onSubmit={handleSearch}
            className="space-y-4 rounded-xl border bg-card p-6"
        >
            <h2 className="text-lg font-semibold">Filter Products</h2>

            <div className="grid gap-4 sm:grid-cols-3">
                {/* Search by Name */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                        Product Name
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search sneakers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-md border bg-background pl-10 pr-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                        />
                    </div>
                </div>

                {/* Filters Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Min Price
                        </label>
                        <input
                            type="number"
                            placeholder="$0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            className="h-10 w-full rounded-md border bg-background px-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Max Price
                        </label>
                        <input
                            type="number"
                            placeholder="$999"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            className="h-10 w-full rounded-md border bg-background px-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 sm:grid-cols-3">
                <Button type="submit" className="flex-1 sm:col-span-2">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                >
                    <X className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>
        </form>
    );
}
