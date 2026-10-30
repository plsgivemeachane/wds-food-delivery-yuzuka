import type { CheckoutInput } from "./schemas";
import type {
  CartLine,
  OrderRejection,
  OrderRejectionReason,
  OrderRequest,
  OrderSuccess,
} from "./types";

export const ORDER_REJECTION_MESSAGES: Record<OrderRejectionReason, string> = {
  PRICE_CHANGED: "Giá món đã thay đổi, vui lòng kiểm tra lại giỏ hàng.",
  UNKNOWN_RESTAURANT: "Nhà hàng không tồn tại hoặc đã ngừng hoạt động.",
  UNKNOWN_DISH: "Món ăn không tồn tại hoặc không thuộc nhà hàng này.",
  INVALID_CUSTOMER: "Thông tin giao hàng không hợp lệ, vui lòng kiểm tra lại.",
  EMPTY_ORDER: "Giỏ hàng đang trống, vui lòng chọn món trước khi đặt hàng.",
};

export const DEFAULT_ORDER_ERROR_MESSAGE =
  "Không thể đặt hàng, vui lòng thử lại sau.";

export function getOrderErrorMessage(reason?: unknown): string {
  if (
    typeof reason === "string" &&
    reason in ORDER_REJECTION_MESSAGES
  ) {
    return ORDER_REJECTION_MESSAGES[reason as OrderRejectionReason];
  }
  return DEFAULT_ORDER_ERROR_MESSAGE;
}

export function getOrdersEndpoint(): string {
  if (typeof window !== "undefined") {
    return "/api/orders";
  }
  const baseUrl = process.env.ORDER_API_BASE_URL ?? "http://localhost";
  return `${baseUrl.replace(/\/$/, "")}/api/orders`;
}

export function buildOrderRequest(
  restaurantId: string,
  lines: CartLine[],
  customer: CheckoutInput,
): OrderRequest {
  return {
    restaurantId,
    lines: lines.map((line) => ({
      dishId: line.dishId,
      quantity: line.quantity,
      price: line.price,
    })),
    customer: {
      fullName: customer.fullName.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      ...(customer.note?.trim() ? { note: customer.note.trim() } : {}),
    },
  };
}

export type PlaceOrderResult =
  | { success: true; orderCode: string }
  | { success: false; errorMessage: string; reason?: OrderRejectionReason };

export async function placeOrder(
  orderRequest: OrderRequest,
  fetchFn: typeof fetch = fetch,
): Promise<PlaceOrderResult> {
  try {
    const response = await fetchFn(getOrdersEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderRequest),
    });

    if (response.status === 201) {
      const data = (await response.json()) as OrderSuccess;
      return { success: true, orderCode: data.orderCode };
    }

    if (response.status >= 400 && response.status < 500) {
      try {
        const data = (await response.json()) as OrderRejection;
        return {
          success: false,
          errorMessage: getOrderErrorMessage(data?.reason),
          reason: data?.reason,
        };
      } catch {
        return {
          success: false,
          errorMessage: DEFAULT_ORDER_ERROR_MESSAGE,
        };
      }
    }

    return {
      success: false,
      errorMessage: DEFAULT_ORDER_ERROR_MESSAGE,
    };
  } catch {
    return {
      success: false,
      errorMessage: DEFAULT_ORDER_ERROR_MESSAGE,
    };
  }
}
