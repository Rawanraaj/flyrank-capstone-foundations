# FlyStore & FlyBot AI Assistant

This is a [Next.js](https://nextjs.org) e-commerce application integrated with **FlyBot**—an AI shopping assistant built using Vercel AI SDK and Groq.

## Tool Contracts

FlyBot is equipped with three server-side AI tools defined in `app/api/chat/route.ts` using the AI SDK's `tool` helper and `zod` schema validation.

---

### 1. `searchProducts`
Searches the FlyStore product catalog by keyword/category with an optional maximum price threshold.

* **Zod Schema:**
  ```ts
  z.object({
    query: z.string().describe("search term for product name or category"),
    maxPrice: z.number().optional().describe("maximum price filter in USD"),
  })
  ```

* **Return Value Shape:**
  ```json
  {
    "query": "audio",
    "maxPrice": 100,
    "totalFound": 2,
    "products": [
      {
        "id": "prod-4",
        "name": "FlySound Bluetooth Speaker",
        "category": "Audio",
        "price": 79.99,
        "imageUrl": "/placeholders/speaker.jpg"
      }
    ]
  }
  ```

---

### 2. `checkOrderStatus`
Looks up order details and delivery status by order ID.

* **Zod Schema:**
  ```ts
  z.object({
    orderId: z.string().describe("the order ID to look up"),
  })
  ```

* **Return Value Shape (Found):**
  ```json
  {
    "found": true,
    "order": {
      "orderId": "ORD-1002",
      "status": "shipped",
      "estimatedDelivery": "2026-09-02",
      "items": ["FlyWatch Ultra"],
      "total": 299.99
    }
  }
  ```

* **Return Value Shape (Not Found):**
  ```json
  {
    "found": false,
    "orderId": "ORD-9999",
    "message": "Order \"ORD-9999\" was not found in our database."
  }
  ```

---

### 3. `calculatePrice`
Calculates an itemized total including unit price, subtotal, shipping fees ($5 standard / $15 express), and 8% estimated tax.

* **Zod Schema:**
  ```ts
  z.object({
    productName: z.string(),
    quantity: z.number().min(1),
    shippingSpeed: z.enum(["standard", "express"]).default("standard"),
  })
  ```

* **Return Value Shape (Success):**
  ```json
  {
    "success": true,
    "productName": "FlyPods Pro",
    "unitPrice": 149.99,
    "quantity": 2,
    "shippingSpeed": "express",
    "subtotal": 299.98,
    "shipping": 15,
    "tax": 24,
    "total": 338.98
  }
  ```

* **Return Value Shape (Failure / Output Error):**
  ```ts
  Throws Error("Product not found in catalog")
  ```

---

## Getting Started

Run the development server:

```bash
npm run dev
```

Run build check:

```bash
npm run build
```
