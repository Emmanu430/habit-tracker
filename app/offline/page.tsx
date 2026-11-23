export default function OfflinePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white">
        <h1 className="text-2xl font-semibold">You're offline</h1>
        <p className="mt-2 text-sm text-zinc-400">
            Reconnect to load your habits. Your progress will be there when you're back.
        </p>
        </main>
    );
}