"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const editProductSchema = z.object({
    name: z.string().trim().min(5, "Name must be at least 5 characters"),
    description: z.string().trim().optional(),
    price: z
        .number({ error: "Price is required" })
        .min(0, "Price must be greater than or equal to 0"),
    imageUrl: z.string().url("Enter a valid image URL"),
    quantity: z
        .number({ error: "Quantity is required" })
        .int("Quantity must be a whole number")
        .min(0, "Quantity must be greater than or equal to 0"),
});

type EditProductInput = z.infer<typeof editProductSchema>;

type FormValues = {
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    quantity: string;
};

interface EditFormProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string;
        quantity: number;
    };
}

export default function EditForm({ product }: EditFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<FormValues>({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        imageUrl: product.imageUrl,
        quantity: product.quantity.toString(),
    });

    const canSubmit = useMemo(() => {
        return (
            form.name.trim() !== "" &&
            form.price.trim() !== "" &&
            form.imageUrl.trim() !== "" &&
            form.quantity.trim() !== ""
        );
    }, [form]);

    const hasChanges = useMemo(() => {
        return (
            form.name !== product.name ||
            form.description !== (product.description || "") ||
            form.price !== product.price.toString() ||
            form.imageUrl !== product.imageUrl ||
            form.quantity !== product.quantity.toString()
        );
    }, [form, product]);

    const onChange = (key: keyof FormValues, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const closeModal = () => {
        setOpen(false);
    };

    const resetForm = () => {
        setForm({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            imageUrl: product.imageUrl,
            quantity: product.quantity.toString(),
        });
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parsed = editProductSchema.safeParse({
            name: form.name,
            description: form.description || undefined,
            price: Number(form.price),
            imageUrl: form.imageUrl,
            quantity: Number(form.quantity),
        });

        if (!parsed.success) {
            toast.error(
                parsed.error.issues[0]?.message ?? "Invalid form values",
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: EditProductInput = parsed.data;
            const response = await fetch(`/api/products/${product.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = (await response.json()) as {
                success?: boolean;
                message?: string;
            };

            if (!response.ok || !data.success) {
                throw new Error(data.message ?? "Failed to update product");
            }

            toast.success("Product updated successfully");
            closeModal();
        } catch (submitError) {
            const message =
                submitError instanceof Error
                    ? submitError.message
                    : "Something went wrong";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Edit product"
            >
                <Edit className="h-5 w-5" />
            </button>

            {open ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl border bg-background p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Edit Product
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Update product details and save.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                        </div>

                        <form onSubmit={onSubmit} className="grid gap-4">
                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">Name</span>
                                <input
                                    value={form.name}
                                    onChange={(event) =>
                                        onChange("name", event.target.value)
                                    }
                                    placeholder="Velocity X1"
                                    className="h-10 rounded-md border bg-background px-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                                    required
                                />
                            </label>

                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">Description</span>
                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        onChange(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Lightweight performance sneaker"
                                    className="min-h-24 rounded-md border bg-background px-3 py-2 outline-none ring-ring/50 transition focus-visible:ring-3"
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">Price</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price}
                                        onChange={(event) =>
                                            onChange(
                                                "price",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="129"
                                        className="h-10 rounded-md border bg-background px-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                                        required
                                    />
                                </label>

                                <label className="grid gap-1.5 text-sm">
                                    <span className="font-medium">
                                        Quantity
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.quantity}
                                        onChange={(event) =>
                                            onChange(
                                                "quantity",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="50"
                                        className="h-10 rounded-md border bg-background px-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                                        required
                                    />
                                </label>
                            </div>

                            <label className="grid gap-1.5 text-sm">
                                <span className="font-medium">Image URL</span>
                                <input
                                    type="url"
                                    value={form.imageUrl}
                                    onChange={(event) =>
                                        onChange("imageUrl", event.target.value)
                                    }
                                    placeholder="https://example.com/sneaker.jpg"
                                    className="h-10 rounded-md border bg-background px-3 outline-none ring-ring/50 transition focus-visible:ring-3"
                                    required
                                />
                            </label>

                            <div className="mt-1 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetForm();
                                        closeModal();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !canSubmit ||
                                        !hasChanges
                                    }
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
