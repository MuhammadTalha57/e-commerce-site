import Link from "next/link";
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import { setUserRole } from "@/lib/setUserRole";
import { userRoleEnum } from "@/db/schema";
import { Button } from "@/components/ui/button";

export default async function Home() {
    const { isAuthenticated } = await auth();

    if (isAuthenticated) {
        const user = await currentUser();
        if (user) {
            if (!user.publicMetadata?.role) {
                await setUserRole(user, userRoleEnum.enumValues[0]);
            }
        }
    }

    const highlights = [
        "Ultra-light cushioning",
        "Breathable knit upper",
        "Street-ready silhouette",
    ];

    return (
        <main className="relative isolate overflow-hidden pb-16">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,oklch(0.95_0.07_85)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,oklch(0.95_0.04_235)_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.28_0.05_85)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,oklch(0.3_0.03_235)_0%,transparent_40%)]" />

            <section className="mx-auto grid min-h-screen max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <p className="mb-4 inline-flex rounded-full border bg-background/80 px-3 py-1 text-xs tracking-[0.18em] uppercase backdrop-blur">
                        New Season Drop
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                        Sneakers Built For Motion
                    </h1>
                    <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                        Clean design, premium comfort, and everyday performance.
                        Discover pairs that move from city mornings to
                        late-night streets.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link href="/shop">Shop Collection</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/new-arrivals">New Arrivals</Link>
                        </Button>
                    </div>

                    <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="rounded-md border bg-background/75 px-3 py-2 backdrop-blur"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="animate-in fade-in zoom-in-95 duration-700 delay-150">
                    <div className="relative mx-auto aspect-square max-w-md rounded-4xl border bg-linear-to-br from-background to-muted p-6 shadow-2xl dark:from-background dark:to-secondary/35">
                        <div className="absolute -top-4 -right-4 rounded-2xl border bg-background px-3 py-2 text-xs font-semibold">
                            Limited Edition
                        </div>
                        <div className="flex h-full flex-col justify-between rounded-3xl border bg-background/70 p-6 backdrop-blur">
                            <div className="relative mx-auto mb-4 w-full max-w-xs animate-in fade-in zoom-in-95 duration-700 delay-300">
                                <Image
                                    src="data:image/jpeg;base64,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"
                                    alt="Limited edition sneaker"
                                    width={900}
                                    height={540}
                                    priority
                                    className="h-auto w-full"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Velocity X1
                                </p>
                                <p className="text-2xl font-semibold">$129</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl border bg-muted/55 p-3">
                                    <p className="text-muted-foreground">
                                        Weight
                                    </p>
                                    <p className="font-semibold">220g</p>
                                </div>
                                <div className="rounded-xl border bg-muted/55 p-3">
                                    <p className="text-muted-foreground">
                                        Sizes
                                    </p>
                                    <p className="font-semibold">US 6-12</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
