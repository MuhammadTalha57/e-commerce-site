import db from "@/db/drizzle";
import { products } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { like, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") || "";
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "12", 10);

        const offset = (page - 1) * limit;

        const filters = [];

        if (search) {
            filters.push(like(products.name, `%${search}%`));
        }

        if (minPrice) {
            filters.push(gte(products.price, parseFloat(minPrice)));
        }

        if (maxPrice) {
            filters.push(lte(products.price, parseFloat(maxPrice)));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const [allProducts, countResult] = await Promise.all([
            db
                .select()
                .from(products)
                .where(whereClause)
                .orderBy(products.name)
                .limit(limit)
                .offset(offset),
            db.select({ count: products.id }).from(products).where(whereClause),
        ]);

        const total = countResult.length;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json(
            {
                success: true,
                message: "Products Fetched",
                data: {
                    products: allProducts,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                    },
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const insertedProduct = await db
            .insert(products)
            .values({
                name: body.name,
                description: body.description,
                price: body.price,
                imageUrl: body.imageUrl,
                quantity: body.quantity,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Product Created",
                data: insertedProduct[0],
            },
            { status: 201 },
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            { status: 500 },
        );
    }
}
