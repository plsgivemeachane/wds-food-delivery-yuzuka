import { describe, expect, it } from "vitest";
import {
  CHECKOUT_REDIRECT_MESSAGES,
  validateCheckoutSession,
} from "./checkout";
import { RESTAURANTS } from "./mock-data";
import type { CartLine } from "./types";

const [firstRestaurant, secondRestaurant] = RESTAURANTS;

describe("validateCheckoutSession", () => {
  const dummyLine1: CartLine = {
    dishId: "pho-bo-tai-chin",
    name: "Phở bò tái chín",
    price: 55_000,
    imageUrl: "/images/pho-bo-tai-chin.webp",
    quantity: 2,
  };

  const dummyLine2: CartLine = {
    dishId: "pho-bo-dac-biet",
    name: "Phở bò đặc biệt",
    price: 75_000,
    imageUrl: "/images/pho-bo-dac-biet.webp",
    quantity: 1,
  };

  const dummyLineOtherRestaurant: CartLine = {
    dishId: "com-tam-suon-bi-cha",
    name: "Cơm tấm sườn bì chả",
    price: 60_000,
    imageUrl: "/images/com-tam-suon-bi-cha.webp",
    quantity: 3,
  };

  it("fails when restaurantId is missing or undefined", () => {
    const result = validateCheckoutSession(undefined, {});
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("missing_restaurant");
      expect(result.message).toBe(
        CHECKOUT_REDIRECT_MESSAGES.missingRestaurant,
      );
    }
  });

  it("fails when restaurantId is empty string or only whitespace", () => {
    const emptyResult = validateCheckoutSession("", {});
    expect(emptyResult.valid).toBe(false);
    if (!emptyResult.valid) {
      expect(emptyResult.reason).toBe("missing_restaurant");
      expect(emptyResult.message).toBe(
        CHECKOUT_REDIRECT_MESSAGES.missingRestaurant,
      );
    }

    const whitespaceResult = validateCheckoutSession("   ", {});
    expect(whitespaceResult.valid).toBe(false);
    if (!whitespaceResult.valid) {
      expect(whitespaceResult.reason).toBe("missing_restaurant");
      expect(whitespaceResult.message).toBe(
        CHECKOUT_REDIRECT_MESSAGES.missingRestaurant,
      );
    }
  });

  it("fails when restaurantId is not in mock catalog", () => {
    const result = validateCheckoutSession("non-existent-restaurant-id", {
      "non-existent-restaurant-id": [dummyLine1],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("unknown_restaurant");
      expect(result.message).toBe(
        CHECKOUT_REDIRECT_MESSAGES.unknownRestaurant,
      );
    }
  });

  it("fails when valid restaurantId has an empty Cart", () => {
    const resultNoKey = validateCheckoutSession(firstRestaurant!.id, {});
    expect(resultNoKey.valid).toBe(false);
    if (!resultNoKey.valid) {
      expect(resultNoKey.reason).toBe("empty_cart");
      expect(resultNoKey.message).toBe(CHECKOUT_REDIRECT_MESSAGES.emptyCart);
    }

    const resultEmptyArray = validateCheckoutSession(firstRestaurant!.id, {
      [firstRestaurant!.id]: [],
    });
    expect(resultEmptyArray.valid).toBe(false);
    if (!resultEmptyArray.valid) {
      expect(resultEmptyArray.reason).toBe("empty_cart");
      expect(resultEmptyArray.message).toBe(
        CHECKOUT_REDIRECT_MESSAGES.emptyCart,
      );
    }
  });

  it("succeeds when restaurantId exists and has non-empty Cart lines", () => {
    const carts = {
      [firstRestaurant!.id]: [dummyLine1, dummyLine2],
      [secondRestaurant!.id]: [dummyLineOtherRestaurant],
    };

    const result = validateCheckoutSession(firstRestaurant!.id, carts);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.restaurant.id).toBe(firstRestaurant!.id);
      expect(result.restaurant.name).toBe(firstRestaurant!.name);
      expect(result.lines).toEqual([dummyLine1, dummyLine2]);
      // 55000*2 + 75000*1 = 110000 + 75000 = 185000
      expect(result.subtotal).toBe(185_000);
    }
  });

  it("isolates Cart lines between different restaurants", () => {
    const carts = {
      [firstRestaurant!.id]: [dummyLine1],
      [secondRestaurant!.id]: [dummyLineOtherRestaurant],
    };

    const resultFirst = validateCheckoutSession(firstRestaurant!.id, carts);
    expect(resultFirst.valid).toBe(true);
    if (resultFirst.valid) {
      expect(resultFirst.lines).toHaveLength(1);
      expect(resultFirst.lines[0]?.dishId).toBe("pho-bo-tai-chin");
      expect(resultFirst.subtotal).toBe(110_000);
    }

    const resultSecond = validateCheckoutSession(secondRestaurant!.id, carts);
    expect(resultSecond.valid).toBe(true);
    if (resultSecond.valid) {
      expect(resultSecond.lines).toHaveLength(1);
      expect(resultSecond.lines[0]?.dishId).toBe("com-tam-suon-bi-cha");
      expect(resultSecond.subtotal).toBe(180_000);
    }
  });
});
