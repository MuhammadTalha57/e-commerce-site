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
                        Discover pairs that move from city mornings to late-night
                        streets.
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
                            <li key={item} className="rounded-md border bg-background/75 px-3 py-2 backdrop-blur">
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
                                    src="/sneaker.svg"
                                    alt="Limited edition sneaker"
                                    width={900}
                                    height={540}
                                    priority
                                    className="h-auto w-full"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Velocity X1</p>
                                <p className="text-2xl font-semibold">$129</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl border bg-muted/55 p-3">
                                    <p className="text-muted-foreground">Weight</p>
                                    <p className="font-semibold">220g</p>
                                </div>
                                <div className="rounded-xl border bg-muted/55 p-3">
                                    <p className="text-muted-foreground">Sizes</p>
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
