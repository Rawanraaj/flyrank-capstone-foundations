import { streamText, convertToModelMessages, tool, zodSchema, type UIMessage } from "ai";
import { z } from "zod";
import { getChatModel, systemPrompt } from "@/lib/ai/config";

// Static mock catalog of ~8 FlyStore products
const PRODUCTS_CATALOG = [
  { id: "prod-1", name: "FlyPods Pro", category: "Audio", price: 149.99, imageUrl: "/placeholders/audio.jpg" },
  { id: "prod-2", name: "FlyWatch Ultra", category: "Wearables", price: 299.99, imageUrl: "/placeholders/watch.jpg" },
  { id: "prod-3", name: "FlyBook Laptop 15", category: "Computers", price: 999.99, imageUrl: "/placeholders/laptop.jpg" },
  { id: "prod-4", name: "FlySound Bluetooth Speaker", category: "Audio", price: 79.99, imageUrl: "/placeholders/speaker.jpg" },
  { id: "prod-5", name: "FlyCharge Wireless Pad", category: "Accessories", price: 29.99, imageUrl: "/placeholders/charger.jpg" },
  { id: "prod-6", name: "FlyCam 4K Action Camera", category: "Cameras", price: 199.99, imageUrl: "/placeholders/camera.jpg" },
  { id: "prod-7", name: "FlyTab HD 10", category: "Tablets", price: 349.99, imageUrl: "/placeholders/tablet.jpg" },
  { id: "prod-8", name: "FlyFit Smart Band", category: "Wearables", price: 49.99, imageUrl: "/placeholders/fitness.jpg" },
];

// Static mock orders
const ORDERS_DB = [
  { orderId: "ORD-1001", status: "delivered" as const, estimatedDelivery: "2026-08-25", items: ["FlyPods Pro", "FlyCharge Wireless Pad"], total: 179.98 },
  { orderId: "ORD-1002", status: "shipped" as const, estimatedDelivery: "2026-09-02", items: ["FlyWatch Ultra"], total: 299.99 },
  { orderId: "ORD-1003", status: "processing" as const, estimatedDelivery: "2026-09-05", items: ["FlyBook Laptop 15"], total: 999.99 },
  { orderId: "ORD-1004", status: "shipped" as const, estimatedDelivery: "2026-09-01", items: ["FlySound Bluetooth Speaker"], total: 79.99 },
  { orderId: "ORD-1005", status: "delivered" as const, estimatedDelivery: "2026-08-20", items: ["FlyFit Smart Band"], total: 49.99 },
];

/**
 * API Route Handler for FlyBot streaming chat endpoint.
 */
export async function POST(req: Request) {
  console.log("[FlyBot] POST /api/chat — request received");

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("[FlyBot] FATAL: No API key found in environment");
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];
    const convertedMessages = await convertToModelMessages(messages);

    const model = getChatModel();

    const result = streamText({
      model,
      system: `${systemPrompt}

You have access to interactive store tools:
1. 'searchProducts': Use whenever the user asks to search, find, or browse products or items by keyword/category/price.
2. 'checkOrderStatus': Use whenever the user asks about an order status, tracking, or order ID.
3. 'calculatePrice': Use whenever the user asks to calculate the price, estimate total, or get a receipt for a product quantity and shipping speed.

Always prefer calling the appropriate tool when asked about products, orders, or price calculations.`,
      messages: convertedMessages,
      tools: {
        searchProducts: tool({
          description: "Search products in the FlyStore catalog by query and optional max price filter.",
          inputSchema: zodSchema(
            z.object({
              query: z.string().describe("search term for product name or category"),
              maxPrice: z.number().optional().describe("maximum price filter in USD"),
            })
          ),
          execute: async ({ query, maxPrice }) => {
            console.log(`[Tool: searchProducts] query="${query}", maxPrice=${maxPrice}`);
            const q = query.toLowerCase();
            const matches = PRODUCTS_CATALOG.filter((p) => {
              const nameMatch = p.name.toLowerCase().includes(q);
              const catMatch = p.category.toLowerCase().includes(q);
              const priceMatch = maxPrice === undefined || p.price <= maxPrice;
              return (nameMatch || catMatch) && priceMatch;
            });

            return {
              query,
              maxPrice,
              totalFound: matches.length,
              products: matches.slice(0, 4),
            };
          },
        }),

        checkOrderStatus: tool({
          description: "Look up order status by order ID in the FlyStore system.",
          inputSchema: zodSchema(
            z.object({
              orderId: z.string().describe("the order ID to look up"),
            })
          ),
          execute: async ({ orderId }) => {
            console.log(`[Tool: checkOrderStatus] orderId="${orderId}"`);
            const normalizedId = orderId.trim().toUpperCase();
            const foundOrder = ORDERS_DB.find(
              (o) => o.orderId.toUpperCase() === normalizedId
            );

            if (foundOrder) {
              return {
                found: true,
                order: foundOrder,
              };
            }

            return {
              found: false,
              orderId,
              message: `Order "${orderId}" was not found in our database.`,
            };
          },
        }),

        calculatePrice: tool({
          description: "Calculate full price breakdown including subtotal, shipping, tax, and total for a product.",
          inputSchema: zodSchema(
            z.object({
              productName: z.string(),
              quantity: z.number().min(1),
              shippingSpeed: z
                .enum(["standard", "express"])
                .default("standard")
                .describe("shipping speed preference: standard ($5) or express ($15)"),
            })
          ),
          execute: async ({
            productName,
            quantity,
            shippingSpeed,
          }) => {
            console.log(`[Tool: calculatePrice] productName="${productName}", qty=${quantity}, speed=${shippingSpeed}`);
            const q = productName.toLowerCase();
            const product = PRODUCTS_CATALOG.find((p) => p.name.toLowerCase().includes(q));

            if (!product) {
              throw new Error("Product not found in catalog");
            }

            const unitPrice = product.price;
            const subtotal = Number((unitPrice * quantity).toFixed(2));
            const shipping = shippingSpeed === "express" ? 15 : 5;
            const tax = Number((subtotal * 0.08).toFixed(2));
            const total = Number((subtotal + shipping + tax).toFixed(2));

            return {
              success: true,
              productName: product.name,
              unitPrice,
              quantity,
              shippingSpeed,
              subtotal,
              shipping,
              tax,
              total,
            };
          },
        }),
      },
      onError: ({ error }) => {
        console.error("[FlyBot streamText onError]:", error);
      },
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("[FlyBot toUIMessageStreamResponse onError]:", error);
        if (error instanceof Error) {
          const msg = error.message;
          if (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
            return "API quota exceeded. Please wait a moment and try again.";
          }
          if (msg.includes("API key") || msg.includes("401")) {
            return "API authentication failed. Please check the API key configuration.";
          }
          return msg;
        }
        return "An unexpected error occurred while generating a response.";
      },
    });
  } catch (error) {
    console.error("[FlyBot POST catch]:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Chat processing failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
