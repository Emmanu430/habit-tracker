    import { createClient } from "@/lib/supabase/client";
    import { logKey, type OutboxOp, type UserDB } from "@/lib/local-db";

    type Supabase = ReturnType<typeof createClient>;

    let flushing = false;

    // Sends queued changes to Supabase in order. Returns true if the queue is empty.
    export async function flushOutbox(db: UserDB): Promise<boolean> {
    if (flushing || !navigator.onLine) return false;
    flushing = true;

    try {
        const supabase = createClient();

        for (;;) {
        const keys = await db.getAllKeys("outbox");
        if (keys.length === 0) return true;

        const ops = await db.getAll("outbox");
        for (let i = 0; i < ops.length; i++) {
            const { error } = await send(supabase, ops[i]);
            if (error) return false; // stop here and retry on the next sync
            await db.delete("outbox", keys[i]);
        }
        }
    } finally {
        flushing = false;
    }
    }

    async function send(supabase: Supabase, op: OutboxOp) {
    if (op.type === "addHabit") {
        return await supabase.from("habits").upsert({ id: op.id, name: op.name });
    }
    if (op.type === "setLog") {
        return op.done
        ? await supabase
            .from("habit_logs")
            .upsert(
                { habit_id: op.habit_id, log_date: op.log_date },
                { onConflict: "habit_id,log_date", ignoreDuplicates: true }
            )
        : await supabase
            .from("habit_logs")
            .delete()
            .eq("habit_id", op.habit_id)
            .eq("log_date", op.log_date);
    }
    return await supabase.from("habits").delete().eq("id", op.id);
    }

    // Replaces the local copy with the server's data. Call only after the outbox is flushed.
    export async function pullFromServer(db: UserDB) {
    if (!navigator.onLine) return;

    const supabase = createClient();
    const [habitsRes, logsRes] = await Promise.all([
        supabase.from("habits").select("id, name, created_at"),
        supabase.from("habit_logs").select("habit_id, log_date"),
    ]);
    if (habitsRes.error || logsRes.error) return;

    const tx = db.transaction(["habits", "logs"], "readwrite");
    await tx.objectStore("habits").clear();
    await tx.objectStore("logs").clear();
    for (const h of habitsRes.data ?? []) {
        await tx.objectStore("habits").put(h);
    }
    for (const l of logsRes.data ?? []) {
        await tx.objectStore("logs").put({
        key: logKey(l.habit_id, l.log_date),
        habit_id: l.habit_id,
        log_date: l.log_date,
        });
    }
    await tx.done;
}