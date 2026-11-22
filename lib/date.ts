export function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}