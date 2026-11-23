    import { Suspense } from "react";
    import { redirect } from "next/navigation";
    import { connection } from "next/server";
    import { createClient } from "@/lib/supabase/server";
    import LogoutButton from "@/components/logout-button";
    import HabitsApp from "@/components/habits-app";

    export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl space-y-8">
            <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
            </Suspense>
        </div>
        </main>
    );
    }

    async function DashboardContent() {
    await connection();

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <>
        <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Your habits</h1>
            <LogoutButton />
        </header>
        <HabitsApp userId={user.id} />
        </>
    );
    }

    function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-8">
        <div className="h-7 w-40 rounded bg-white/10" />
        <div className="h-11 rounded-xl bg-white/5" />
        <div className="space-y-2">
            <div className="h-14 rounded-xl bg-white/5" />
            <div className="h-14 rounded-xl bg-white/5" />
        </div>
        </div>
    );
}