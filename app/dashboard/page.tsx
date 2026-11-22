    import { redirect } from "next/navigation";
    import { createClient } from "@/lib/supabase/server";
    import LogoutButton from "@/components/logout-button";

    export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your habits</h1>
            <p className="mt-1 text-sm text-zinc-400">Signed in as {user.email}</p>
            </div>
            <LogoutButton />
        </div>
        </main>
    );
}