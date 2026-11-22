    "use client";

    import { useRef, useState, useTransition } from "react";
    import { addHabit } from "@/app/actions/habits";

    export default function AddHabitForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
        const result = await addHabit(formData);
        if (result.error) {
            setError(result.error);
        } else {
            setError(null);
            formRef.current?.reset();
        }
        });
    }

    return (
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
            name="name"
            required
            maxLength={100}
            placeholder="New habit, e.g. Read 10 pages"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
        />
        <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
            {pending ? "Adding..." : "Add habit"}
        </button>
        {error && <p className="text-sm text-red-400 sm:basis-full">{error}</p>}
        </form>
    );
}