import Link from "next/link";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-8"
      >
        ← Back to Products
      </Link>

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-sm">
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-semibold mb-4">
          ID: {id}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
          Product Details Placeholder ({id})
        </h1>

        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
          This is a placeholder page for product <code className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-sm">{id}</code>. In a production environment, product specifications, images, and inventory data would be loaded asynchronously.
        </p>

        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Price</span>
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$199.99</span>
          </div>

          <Link
            href="/cart"
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-center transition-all shadow-sm"
          >
            Add to Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
