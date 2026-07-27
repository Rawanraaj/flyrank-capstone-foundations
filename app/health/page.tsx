interface TodoResponse {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export const revalidate = 0;

export default async function HealthPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch health check data: ${res.statusText}`);
  }

  const todo: TodoResponse = await res.json();

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 w-full">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            System Health Check
          </h1>
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            Status: 200 OK
          </span>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Real-time data fetched from remote API endpoint (<code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">https://jsonplaceholder.typicode.com/todos/1</code>):
        </p>

        <div className="space-y-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">Todo ID:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{todo.id}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">User ID:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{todo.userId}</span>
          </div>
          <div className="pb-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Title:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 italic">"{todo.title}"</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">Completed Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                todo.completed
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {todo.completed ? "Completed (true)" : "Pending (false)"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
