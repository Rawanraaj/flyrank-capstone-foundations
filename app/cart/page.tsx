import Link from "next/link";

export const metadata = {
  title: "Shopping Cart - FlyStore",
  description: "Your shopping cart details",
};

export default function CartPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 sm:px-12 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-6 text-zinc-400">
        🛒
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        Your Cart is Empty
      </h1>

      <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-md">
        Looks like you haven't added any products to your cart yet. Explore our store to find your favorite items.
      </p>

      <div className="mt-8">
        <Link
          href="/products"
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-base transition-all shadow-md"
        >
          Explore Products
        </Link>
      </div>
    </main>
  );
}
