    import { redirect } from "next/navigation";
    import { createClient } from "@/lib/supabase/server";
    import { todayString } from "@/lib/date";
    import LogoutButton from "@/components/logout-button";
    import AddHabitForm from "@/components/add-habit-form";
    import HabitItem from "@/components/habit-item";

    export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const today = todayString();

    const [{ data: habits }, { data: logs }] = await Promise.all([
        supabase.from("habits").select("id, name").order("created_at"),
        supabase.from("habit_logs").select("habit_id").eq("log_date", today),
    ]);

    const doneIds = new Set((logs ?? []).map((l) => l.habit_id));
    const doneCount = doneIds.size;
    const total = habits?.length ?? 0;

    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl space-y-8">
            <header className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Your habits</h1>
                <p className="mt-1 text-sm text-zinc-400">
                {doneCount} of {total} done today
                </p>
            </div>
            <LogoutButton />
            </header>

            <AddHabitForm />

            {total === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                No habits yet. Add your first one above.
            </p>
            ) : (
            <ul className="space-y-2">
                {habits!.map((habit) => (
                <HabitItem
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    doneToday={doneIds.has(habit.id)}
                />
                ))}
            </ul>
            )}
        </div>
        </main>
    );
}