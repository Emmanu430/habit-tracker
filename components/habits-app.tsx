    "use client";

    import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
    import {
    logKey,
    openUserDB,
    type LocalHabit,
    type LocalLog,
    type OutboxOp,
    type UserDB,
    } from "@/lib/local-db";
    import { flushOutbox, pullFromServer } from "@/lib/sync";
    import { todayString } from "@/lib/date";
    import { calculateStreak } from "@/lib/streaks";

    const inputClass =
    "flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10";

    export default function HabitsApp({ userId }: { userId: string }) {
    const [db, setDb] = useState<UserDB | null>(null);
    const [habits, setHabits] = useState<LocalHabit[]>([]);
    const [logs, setLogs] = useState<LocalLog[]>([]);
    const [pending, setPending] = useState(0);
    const [online, setOnline] = useState(true);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const today = todayString();

    const refresh = useCallback(async (database: UserDB) => {
        const [h, l, p] = await Promise.all([
        database.getAll("habits"),
        database.getAll("logs"),
        database.count("outbox"),
        ]);
        setHabits(h.sort((a, b) => a.created_at.localeCompare(b.created_at)));
        setLogs(l);
        setPending(p);
    }, []);

    const sync = useCallback(
    async (database: UserDB) => {
        setOnline(navigator.onLine);
        const flushed = await flushOutbox(database);
        if (flushed) await pullFromServer(database);
        await refresh(database);
    },
    [refresh]
    );

    useEffect(() => {
        let active = true;
        let database: UserDB | null = null;

        async function start() {
        const opened = await openUserDB(userId);
        if (!active) {
            opened.close();
            return;
        }
        database = opened;
        setDb(opened);
        setOnline(navigator.onLine);
        await refresh(opened);
        if (navigator.onLine) await sync(opened);
        }
        start();

        function handleOnline() {
        setOnline(true);
        if (database) sync(database);
        }
        function handleOffline() {
        setOnline(false);
        }

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
        active = false;
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        database?.close();
        };
    }, [userId, refresh, sync]);

    // Save locally, queue the change, then try to sync
    async function commit(op: OutboxOp, localWrite: (database: UserDB) => Promise<unknown>) {
        if (!db) return;
        setOnline(navigator.onLine)
        await localWrite(db);
        await db.add("outbox", op);
        await refresh(db);
        if (navigator.onLine) await sync(db);
    }

    function handleAdd(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || trimmed.length > 100) {
        setError("Habit name must be between 1 and 100 characters.");
        return;
        }
        setError(null);
        setName("");

        const habit: LocalHabit = {
        id: crypto.randomUUID(),
        name: trimmed,
        created_at: new Date().toISOString(),
        };
        void commit({ type: "addHabit", id: habit.id, name: habit.name }, (database) =>
        database.put("habits", habit)
        );
    }

    function toggleToday(habitId: string, isDone: boolean) {
        const nextDone = !isDone;
        const key = logKey(habitId, today);
        void commit(
        { type: "setLog", habit_id: habitId, log_date: today, done: nextDone },
        (database) =>
            nextDone
            ? database.put("logs", { key, habit_id: habitId, log_date: today })
            : database.delete("logs", key)
        );
    }

    function removeHabit(habitId: string) {
        void commit({ type: "deleteHabit", id: habitId }, async (database) => {
        const tx = database.transaction(["habits", "logs"], "readwrite");
        await tx.objectStore("habits").delete(habitId);
        let cursor = await tx.objectStore("logs").openCursor();
        while (cursor) {
            if (cursor.value.habit_id === habitId) await cursor.delete();
            cursor = await cursor.continue();
        }
        await tx.done;
        });
    }

    const doneIds = useMemo(
        () => new Set(logs.filter((l) => l.log_date === today).map((l) => l.habit_id)),
        [logs, today]
    );

    const datesByHabit = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const l of logs) {
        const list = map.get(l.habit_id) ?? [];
        list.push(l.log_date);
        map.set(l.habit_id, list);
        }
        return map;
    }, [logs]);

    return (
        <div className="space-y-8">
        <div>
            <p className="text-sm text-zinc-400">
            {doneIds.size} of {habits.length} done today
            </p>
            <p className="mt-1 text-xs text-zinc-500">
            {online ? "Online" : "Offline"}
            {pending > 0 &&
                ` · ${pending} change${pending === 1 ? "" : "s"} waiting to sync`}
            </p>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
            <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="New habit, e.g. Read 10 pages"
            className={inputClass}
            />
            <button
            type="submit"
            disabled={!db}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
            Add habit
            </button>
        </form>
        {error && <p className="text-sm text-red-400">{error}</p>}

        {habits.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            No habits yet. Add your first one above.
            </p>
        ) : (
            <ul className="space-y-2">
            {habits.map((habit) => {
                const isDone = doneIds.has(habit.id);
                const streak = calculateStreak(datesByHabit.get(habit.id) ?? [], today);
                return (
                <li
                    key={habit.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3"
                >
                    <button
                    onClick={() => toggleToday(habit.id, isDone)}
                    className="flex flex-1 items-center gap-3 text-left"
                    >
                    <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                        isDone
                            ? "border-emerald-400 bg-emerald-500 text-zinc-950"
                            : "border-zinc-600 text-transparent"
                        }`}
                    >
                        ✓
                    </span>
                    <div>
                        <span className={isDone ? "text-zinc-500 line-through" : "text-white"}>
                        {habit.name}
                        </span>
                        <p className="text-xs text-zinc-500">
                        {streak > 0
                            ? `🔥 ${streak} day${streak === 1 ? "" : "s"} in a row`
                            : "No streak yet"}
                        </p>
                    </div>
                    </button>
                    <button
                    onClick={() => removeHabit(habit.id)}
                    aria-label={`Delete ${habit.name}`}
                    className="text-sm text-zinc-500 transition hover:text-red-400"
                    >
                    Delete
                    </button>
                </li>
                );
            })}
            </ul>
        )}
        </div>
    );
}