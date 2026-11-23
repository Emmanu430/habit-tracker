    "use client";

    import { useRouter } from "next/navigation";
    import { createClient } from "@/lib/supabase/client";
    import { clearLocalData } from "@/lib/local-db";

    export default function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        await clearLocalData();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <button
        onClick={handleLogout}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
        Log out
        </button>
    );
}