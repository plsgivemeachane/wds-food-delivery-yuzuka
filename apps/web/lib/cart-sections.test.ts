import { describe, expect, it } from "vitest";
import { getCartSections } from "./cart-sections";
import { RESTAURANTS } from "./mock-data";
import type { CartLine } from "./types";

describe("getCartSections", () => {
  const [firstRestaurant, secondRestaurant] = RESTAURANTS;

  const line1: CartLine = {
    dishId: "dish-1",
    name: "Phở Bò Tái Chín",
    price: 55000,
    imageUrl: "/images/dishes/pho-bo-tai-chin.webp",
    quantity: 2,
  };

  const line2: CartLine = {
    dishId: "dish-2",
    name: "Quẩy Giòn & Trứng Chần",
    price: 25000,
    imageUrl: "/images/dishes/quay-gion-trung-chan.webp",
    quantity: 1,
  };

  const line3: CartLine = {
    dishId: "dish-3",
    name: "Cơm Tấm Sườn Bì Chả",
    price: 60000,
    imageUrl: "/images/dishes/com-tam-suon-bi-cha.webp",
    quantity: 3,
  };

  it("returns an empty array when carts is empty", () => {
    expect(getCartSections({})).toEqual([]);
  });

  it("omits restaurants with empty lines array", () => {
    const carts: Record<string, CartLine[]> = {
      [firstRestaurant!.id]: [],
    };
    expect(getCartSections(carts)).toEqual([]);
  });

  it("calculates section subtotal correctly for a single cart", () => {
    const carts: Record<string, CartLine[]> = {
      [firstRestaurant!.id]: [line1, line2],
    };

    const sections = getCartSections(carts);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toEqual({
      restaurantId: firstRestaurant!.id,
      restaurantName: firstRestaurant!.name,
      lines: [line1, line2],
      subtotal: 55000 * 2 + 25000 * 1, // 135000
    });
  });

  it("handles multiple restaurant carts independently with correct subtotals", () => {
    const carts: Record<string, CartLine[]> = {
      [firstRestaurant!.id]: [line1],
      [secondRestaurant!.id]: [line3],
    };

    const sections = getCartSections(carts);
    expect(sections).toHaveLength(2);

    const firstSection = sections.find(
      (s) => s.restaurantId === firstRestaurant!.id,
    );
    const secondSection = sections.find(
      (s) => s.restaurantId === secondRestaurant!.id,
    );

    expect(firstSection).toBeDefined();
    expect(firstSection?.restaurantName).toBe(firstRestaurant!.name);
    expect(firstSection?.subtotal).toBe(110000);

    expect(secondSection).toBeDefined();
    expect(secondSection?.restaurantName).toBe(secondRestaurant!.name);
    expect(secondSection?.subtotal).toBe(180000);
  });

  it("falls back to restaurantId as restaurantName if restaurant is unknown in mock data", () => {
    const carts: Record<string, CartLine[]> = {
      "unknown-restaurant": [line1],
    };

    const sections = getCartSections(carts);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.restaurantName).toBe("unknown-restaurant");
    expect(sections[0]?.subtotal).toBe(110000);
  });
});
