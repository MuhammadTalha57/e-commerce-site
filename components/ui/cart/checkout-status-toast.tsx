"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function CheckoutStatusToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const handledRef = useRef(false);

    useEffect(() => {
        if (handledRef.current) return;

        const checkout = searchParams.get("checkout");

        if (!checkout) return;

        handledRef.current = true;

        const cleanUrl = () => {
            const nextParams = new URLSearchParams(searchParams.toString());
            nextParams.delete("checkout");
            nextParams.delete("session_id");
            const query = nextParams.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, {
                scroll: false,
            });
        };

        if (checkout === "cancel") {
            toast.error("Payment canceled. Your order was not placed.");
            cleanUrl();
            return;
        }

        if (checkout === "success") {
            const sessionId = searchParams.get("session_id");

            if (!sessionId) {
                toast.error(
                    "Missing checkout session. Unable to verify payment.",
                );
                cleanUrl();
                return;
            }

            void (async () => {
                try {
                    const response = await fetch("/api/checkout/confirm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId }),
                    });

                    const data = (await response.json()) as {
                        success?: boolean;
                        message?: string;
                    };

                    if (!response.ok || !data.success) {
                        throw new Error(
                            data.message ?? "Payment verification failed",
                        );
                    }

                    toast.success("Payment successful. Your order was placed.");
                    router.refresh();
                } catch (error) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "Payment verification failed";
                    toast.error(message);
                } finally {
                    cleanUrl();
                }
            })();
        }
    }, [pathname, router, searchParams]);

    return null;
}
