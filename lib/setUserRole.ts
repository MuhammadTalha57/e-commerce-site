import { clerkClient, User } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { type UserRole, users } from "@/db/schema";

export async function setUserRole(user: User, role: UserRole) {
    // Call when user sign up. It sets user role and create
    // DB record.
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
        publicMetadata: { role: role },
    });

    await db.insert(users).values({
        id: user.id,
        role: role,
        name: user.fullName ?? user.username ?? "User",
        email: user.primaryEmailAddress?.emailAddress || "",
    });
    console.log("USER ADDED");
}
