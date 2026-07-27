import Link from "next/link";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
}

const dummyProducts: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Noise-Canceling Headphones",
    category: "Audio",
    price: 299,
    description: "Immersive sound clarity with active noise cancellation and 30-hour battery life.",
    rating: 4.8,
  },
  {
    id: "prod-2",
    name: "Ergonomic Mechanical Keyboard",
    category: "Peripherals",
    price: 149,
    description: "Customizable hot-swappable switches with RGB backlighting and tactile feel.",
    rating: 4.7,
  },
  {
    id: "prod-3",
    name: "Ultra-Wide Curved Monitor 34\"",
    category: "Displays",
    price: 649,
    description: "144Hz refresh rate with HDR 400 for stunning gaming and productivity.",
    rating: 4.9,
  },
  {
    id: "prod-4",
    name: "Minimalist Aluminum Desk Mat",
    category: "Accessories",
    price: 45,
    description: "Sleek micro-textured surface designed for precise mouse movement.",
    rating: 4.5,
  },
  {
    id: "prod-5",
    name: "Smart Fitness Watch Ultra",
    category: "Wearables",
    price: 399,
    description: "GPS tracking, heart rate monitor, sleep analysis, and 50m water resistance.",
    rating: 4.6,
  },
  {
    id: "prod-6",
    name: "Portable GaN Fast Charger 100W",
    category: "Power",
    price: 69,
    description: "Compact dual USB-C power delivery charger for laptops and smartphones.",
    rating: 4.8,
  },
];

export const metadata = {
  title: "Products - FlyStore",
  description: "Browse our collection of high-performance tech products.",
};

export default function ProductsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          All Products
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Explore our collection of premium hardware and accessories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {product.category}
                </span>
                <div className="flex items-center text-xs font-bold text-amber-500">
                  ★ {product.rating}
                </div>
              </div>

              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {product.name}
              </h2>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
                ${product.price}
              </span>
              <Link
                href={`/products/${product.id}`}
                className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 font-semibold text-sm transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
