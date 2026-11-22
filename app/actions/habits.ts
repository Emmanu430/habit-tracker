    "use server";

    import { revalidatePath } from "next/cache";
    import { todayString } from "@/lib/date";
    import { createClient } from "@/lib/supabase/server";

    // export function todayString() {
    // return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    // }

    export async function addHabit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name || name.length > 100) {
        return { error: "Habit name must be between 1 and 100 characters." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("habits").insert({ name });
    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    return { error: null };
    }

    export async function toggleToday(habitId: string, done: boolean) {
    const supabase = await createClient();
    const today = todayString();

    const { error } = done
        ? await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("log_date", today)
        : await supabase.from("habit_logs").insert({ habit_id: habitId, log_date: today });

    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    return { error: null };
    }

    export async function deleteHabit(habitId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("habits").delete().eq("id", habitId);
    if (error) return { error: error.message };

    revalidatePath("/dashboard");
    return { error: null };
}