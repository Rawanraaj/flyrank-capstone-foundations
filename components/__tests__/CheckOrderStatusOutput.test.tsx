import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CheckOrderStatusOutput } from "../FlyBot";

describe("CheckOrderStatusOutput Component (Standalone Tool Result)", () => {
  describe("Normal Rendered Output (Order Found)", () => {
    const mockDeliveredOrder = {
      found: true,
      order: {
        orderId: "ORD-1001",
        status: "delivered",
        estimatedDelivery: "2026-08-25",
        items: ["FlyPods Pro", "FlyCharge Wireless Pad"],
        total: 179.98,
      },
    };

    it("renders order header and region with accessible role and label", () => {
      render(<CheckOrderStatusOutput result={mockDeliveredOrder} />);

      // Accessible region
      const region = screen.getByRole("region", {
        name: /Order Status ORD-1001/i,
      });
      expect(region).toBeInTheDocument();

      // Heading level 4
      const heading = screen.getByRole("heading", {
        name: /Order Status \(ORD-1001\)/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("renders the status badge with accessible label and text for delivered status", () => {
      render(<CheckOrderStatusOutput result={mockDeliveredOrder} />);

      const statusBadge = screen.getByLabelText(/Order status: Delivered/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveTextContent("Delivered");
    });

    it("renders delivery date and formatted total price", () => {
      render(<CheckOrderStatusOutput result={mockDeliveredOrder} />);

      expect(screen.getByText("Est. Delivery")).toBeInTheDocument();
      expect(screen.getByText("2026-08-25")).toBeInTheDocument();

      expect(screen.getByText("Order Total")).toBeInTheDocument();
      expect(screen.getByText("$179.98")).toBeInTheDocument();
    });

    it("renders list of items using accessible list and listitem roles", () => {
      render(<CheckOrderStatusOutput result={mockDeliveredOrder} />);

      const itemsList = screen.getByRole("list", { name: /Items in order/i });
      expect(itemsList).toBeInTheDocument();

      const items = within(itemsList).getAllByRole("listitem");
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent("FlyPods Pro");
      expect(items[1]).toHaveTextContent("FlyCharge Wireless Pad");
    });

    it("renders shipped status badge correctly", () => {
      const mockShippedOrder = {
        found: true,
        order: {
          orderId: "ORD-1002",
          status: "shipped",
          estimatedDelivery: "2026-09-02",
          items: ["FlyWatch Ultra"],
          total: 299.99,
        },
      };

      render(<CheckOrderStatusOutput result={mockShippedOrder} />);

      const statusBadge = screen.getByLabelText(/Order status: Shipped/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveTextContent("Shipped");
    });

    it("renders processing status badge correctly", () => {
      const mockProcessingOrder = {
        found: true,
        order: {
          orderId: "ORD-1003",
          status: "processing",
          estimatedDelivery: "2026-09-05",
          items: ["FlyBook Laptop 15"],
          total: 999.99,
        },
      };

      render(<CheckOrderStatusOutput result={mockProcessingOrder} />);

      const statusBadge = screen.getByLabelText(/Order status: Processing/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveTextContent("Processing");
    });
  });

  describe("Empty / Error Variant (Order Not Found)", () => {
    it("renders accessible alert when order is not found with custom message", () => {
      const mockNotFoundResult = {
        found: false,
        orderId: "ORD-9999",
        message: 'Order "ORD-9999" was not found in our database.',
      };

      render(<CheckOrderStatusOutput result={mockNotFoundResult} />);

      // Alert role with accessible label
      const alert = screen.getByRole("alert", { name: /Order Not Found/i });
      expect(alert).toBeInTheDocument();

      // Heading text
      expect(screen.getByText("Order Not Found")).toBeInTheDocument();

      // Message text
      expect(
        screen.getByText('Order "ORD-9999" was not found in our database.')
      ).toBeInTheDocument();

      // Ensure normal order details are NOT rendered
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByText(/Order Total/i)).not.toBeInTheDocument();
    });

    it("falls back to default not found message when message property is omitted", () => {
      const mockFallbackResult = {
        found: false,
        orderId: "ORD-UNKNOWN",
      };

      render(<CheckOrderStatusOutput result={mockFallbackResult} />);

      expect(screen.getByRole("alert", { name: /Order Not Found/i })).toBeInTheDocument();
      expect(
        screen.getByText('No order matching ID "ORD-UNKNOWN" was located.')
      ).toBeInTheDocument();
    });
  });
});
