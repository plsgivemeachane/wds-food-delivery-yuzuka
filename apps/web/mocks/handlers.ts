import { delay, http, HttpResponse } from "msw";
import { getDishById, getRestaurantById } from "@/lib/mock-data";
import { checkoutSchema } from "@/lib/schemas";
import type {
  OrderRejection,
  OrderRejectionReason,
  OrderRequest,
  OrderSuccess,
} from "@/lib/types";
import { generateOrderCode } from "@/mocks/order-code";

export const DEFAULT_ORDER_DELAY_MS = 800;

export interface OrderHandlerOptions {
  delayMs?: number;
}

function rejectOrder(reason: OrderRejectionReason) {
  const body: OrderRejection = { reason };
  return HttpResponse.json(body, { status: 400 });
}

export function createOrderHandlers(options: OrderHandlerOptions = {}) {
  const delayMs = options.delayMs ?? DEFAULT_ORDER_DELAY_MS;

  return [
    http.post("*/api/orders", async ({ request }) => {
      let payload: Partial<OrderRequest> | null = null;
      try {
        const raw = await request.json();
        if (typeof raw === "object" && raw !== null) {
          payload = raw as Partial<OrderRequest>;
        }
      } catch {
        payload = null;
      }

      const restaurantId =
        typeof payload?.restaurantId === "string" ? payload.restaurantId : "";
      const restaurant = getRestaurantById(restaurantId);
      if (!restaurant) {
        return rejectOrder("UNKNOWN_RESTAURANT");
      }

      if (!Array.isArray(payload?.lines) || payload.lines.length === 0) {
        return rejectOrder("EMPTY_ORDER");
      }

      for (const line of payload.lines) {
        if (
          typeof line !== "object" ||
          line === null ||
          typeof line.quantity !== "number" ||
          !Number.isInteger(line.quantity) ||
          line.quantity <= 0
        ) {
          return rejectOrder("EMPTY_ORDER");
        }

        const dishId = typeof line.dishId === "string" ? line.dishId : "";
        const dish = getDishById(dishId);
        if (!dish || dish.restaurantId !== restaurant.id) {
          return rejectOrder("UNKNOWN_DISH");
        }

        if (typeof line.price !== "number" || line.price !== dish.price) {
          return rejectOrder("PRICE_CHANGED");
        }
      }

      const customerValidation = checkoutSchema.safeParse(payload?.customer);
      if (!customerValidation.success) {
        return rejectOrder("INVALID_CUSTOMER");
      }

      if (delayMs > 0) {
        await delay(delayMs);
      }

      const body: OrderSuccess = {
        orderCode: generateOrderCode(),
      };
      return HttpResponse.json(body, { status: 201 });
    }),
  ];
}

export const createHandlers = createOrderHandlers;

export const handlers = createOrderHandlers();

