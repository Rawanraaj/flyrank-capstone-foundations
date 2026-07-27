import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 sm:px-12 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
        <span>✨ New Season Arrivals</span>
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl text-zinc-900 dark:text-white">
        Welcome to <span className="text-indigo-600 dark:text-indigo-400">FlyStore</span>
      </h1>

      {/* Description */}
      <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
        Discover curated tech essentials, premium accessories, and modern design gear designed to elevate your everyday workflow.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        <Link
          href="/products"
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-base transition-all shadow-md hover:shadow-indigo-500/25"
        >
          Browse Products
        </Link>
        <Link
          href="/settings"
          className="px-8 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold text-base transition-all"
        >
          Profile Settings
        </Link>
      </div>

      {/* Highlights Grid */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-left">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">
            🚀
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Fast Shipping</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Express worldwide delivery right to your doorstep.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">
            🛡️
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">2-Year Warranty</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Full coverage guarantee on all hardware and tech gear.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-4">
            💬
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">24/7 Support</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Our expert customer care team is always here to help.
          </p>
        </div>
      </div>
    </main>
  );
}
