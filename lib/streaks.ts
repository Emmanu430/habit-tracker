    function shiftDate(date: string, days: number) {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
    }

    // dates: every log_date for one habit (YYYY-MM-DD)
    // today: today's date (YYYY-MM-DD)
    export function calculateStreak(dates: string[], today: string): number {
    const completed = new Set(dates);
    // If today isn't done yet, start counting from yesterday
    let cursor = completed.has(today) ? today : shiftDate(today, -1);

    let streak = 0;
    while (completed.has(cursor)) {
        streak++;
        cursor = shiftDate(cursor, -1);
    }
    return streak;
}