    import { openDB, type DBSchema, type IDBPDatabase } from "idb";

    export type LocalHabit = { id: string; name: string; created_at: string };
    export type LocalLog = { key: string; habit_id: string; log_date: string };
    export type OutboxOp =
    | { type: "addHabit"; id: string; name: string }
    | { type: "setLog"; habit_id: string; log_date: string; done: boolean }
    | { type: "deleteHabit"; id: string };

    interface HabitDB extends DBSchema {
    habits: { key: string; value: LocalHabit };
    logs: { key: string; value: LocalLog };
    outbox: { key: number; value: OutboxOp };
    }

    export type UserDB = IDBPDatabase<HabitDB>;

    const DB_PREFIX = "habit-tracker-";

    // One database per user, so accounts on a shared device stay separate
    export function openUserDB(userId: string): Promise<UserDB> {
    return openDB<HabitDB>(`${DB_PREFIX}${userId}`, 1, {
        upgrade(db) {
        db.createObjectStore("habits", { keyPath: "id" });
        db.createObjectStore("logs", { keyPath: "key" });
        db.createObjectStore("outbox", { autoIncrement: true });
        },
    });
    }

    export function logKey(habitId: string, date: string) {
    return `${habitId}|${date}`;
    }

    // Called on logout so nothing private stays on the device
    export async function clearLocalData() {
    const dbs = await indexedDB.databases();
    for (const info of dbs) {
        if (info.name?.startsWith(DB_PREFIX)) indexedDB.deleteDatabase(info.name);
    }
    for (const key of await caches.keys()) {
        await caches.delete(key);
    }
}