import { getRestaurantById } from "./mock-data";
import type { CartLine, Restaurant } from "./types";

export const CHECKOUT_REDIRECT_MESSAGES = {
  missingRestaurant: "Vui lòng chọn nhà hàng để thanh toán",
  unknownRestaurant: "Không tìm thấy nhà hàng để thanh toán",
  emptyCart: "Giỏ hàng của bạn đang trống",
} as const;

export type CheckoutSessionValidation =
  | {
      valid: true;
      restaurant: Restaurant;
      lines: CartLine[];
      subtotal: number;
    }
  | {
      valid: false;
      reason: "missing_restaurant" | "unknown_restaurant" | "empty_cart";
      message: string;
    };

/**
 * Validates whether a checkout session can proceed for a given restaurantId
 * against the catalog and persisted Carts map.
 */
export function validateCheckoutSession(
  restaurantId: string | undefined | null,
  carts: Record<string, CartLine[]>,
): CheckoutSessionValidation {
  const trimmedId = restaurantId?.trim();
  if (!trimmedId) {
    return {
      valid: false,
      reason: "missing_restaurant",
      message: CHECKOUT_REDIRECT_MESSAGES.missingRestaurant,
    };
  }

  const restaurant = getRestaurantById(trimmedId);
  if (!restaurant) {
    return {
      valid: false,
      reason: "unknown_restaurant",
      message: CHECKOUT_REDIRECT_MESSAGES.unknownRestaurant,
    };
  }

  const lines = carts[trimmedId] ?? [];
  if (lines.length === 0) {
    return {
      valid: false,
      reason: "empty_cart",
      message: CHECKOUT_REDIRECT_MESSAGES.emptyCart,
    };
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  return {
    valid: true,
    restaurant,
    lines,
    subtotal,
  };
}
