    "use client";

    import { useState, type FormEvent } from "react";
    import { useRouter } from "next/navigation";
    import Link from "next/link";
    import { createClient } from "@/lib/supabase/client";

    type Props = { mode: "login" | "signup" };

    const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-emerald-400/10";

    export default function AuthForm({ mode }: Props) {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isLogin = mode === "login";

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

        setLoading(false);

        if (error) {
        setError(error.message);
        return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
        {/* Soft background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-xl ring-1 ring-emerald-400/30">
                ✓
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
                {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
                {isLogin
                ? "Log in to continue tracking your habits."
                : "Start building better habits today."}
            </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                />
                </div>

                <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={isLogin ? "Your password" : "At least 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                />
                </div>

                {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                    {error}
                </div>
                )}

                <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
                )}
                {loading ? "Please wait..." : isLogin ? "Log in" : "Create account"}
                </button>
            </form>
            </div>

            <p className="mt-6 text-center text-sm text-zinc-400">
            {isLogin ? "New here? " : "Already have an account? "}
            <Link
                href={isLogin ? "/signup" : "/login"}
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
            >
                {isLogin ? "Create an account" : "Log in"}
            </Link>
            </p>
        </div>
        </main>
    );
}