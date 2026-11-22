    "use client";

    import { useTransition } from "react";
    import { toggleToday, deleteHabit } from "@/app/actions/habits";

    type Props = { id: string; name: string; doneToday: boolean };

    export default function HabitItem({ id, name, doneToday }: Props) {
    const [pending, startTransition] = useTransition();

    return (
        <li className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3">
        <button
            onClick={() => startTransition(() => { toggleToday(id, doneToday); })}
            disabled={pending}
            className="flex flex-1 items-center gap-3 text-left"
        >
            <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                doneToday
                ? "border-emerald-400 bg-emerald-500 text-zinc-950"
                : "border-zinc-600 text-transparent"
            }`}
            >
            ✓
            </span>
            <span className={doneToday ? "text-zinc-500 line-through" : "text-white"}>{name}</span>
        </button>
        <button
            onClick={() => startTransition(() => { deleteHabit(id); })}
            disabled={pending}
            aria-label={`Delete ${name}`}
            className="text-sm text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
        >
            Delete
        </button>
        </li>
    );
}