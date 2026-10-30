import { getRestaurantById } from "./mock-data";
import type { CartLine } from "./types";

export interface CartSection {
  restaurantId: string;
  restaurantName: string;
  lines: CartLine[];
  subtotal: number;
}

/**
 * Transforms the Cart store's raw `carts` record into non-empty CartSections.
 * Each section contains the Restaurant name, its Dish lines, and the section subtotal.
 * Empty Carts are excluded.
 */
export function getCartSections(
  carts: Record<string, CartLine[] | undefined>,
): CartSection[] {
  const sections: CartSection[] = [];

  for (const [restaurantId, lines] of Object.entries(carts)) {
    if (!lines || lines.length === 0) {
      continue;
    }

    const subtotal = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );

    const restaurant = getRestaurantById(restaurantId);

    sections.push({
      restaurantId,
      restaurantName: restaurant?.name ?? restaurantId,
      lines,
      subtotal,
    });
  }

  return sections;
}
