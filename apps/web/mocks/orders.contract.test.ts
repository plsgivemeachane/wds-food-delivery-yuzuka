import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { getRestaurantById, getDishById } from "@/lib/mock-data";
import type { OrderRejection, OrderRequest, OrderSuccess } from "@/lib/types";
import { createServer } from "@/mocks/node";
import { generateOrderCode, ORDER_CODE_PATTERN } from "@/mocks/order-code";

const BASE_URL = process.env.ORDER_API_BASE_URL ?? "http://localhost";
const ORDERS_URL = `${BASE_URL.replace(/\/$/, "")}/api/orders`;

const server = createServer({ delayMs: 0 });

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

function buildValidOrderPayload(): OrderRequest {
  const restaurant = getRestaurantById("pho-gia-truyen-bat-dan")!;
  const firstDish = getDishById("pho-bo-tai-chin")!;
  const secondDish = getDishById("quay-gion-trung-chan")!;

  return {
    restaurantId: restaurant.id,
    lines: [
      { dishId: firstDish.id, quantity: 2, price: firstDish.price },
      { dishId: secondDish.id, quantity: 1, price: secondDish.price },
    ],
    customer: {
      fullName: "Nguyễn Văn An",
      phone: "0901234567",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      note: "Giao giờ hành chính",
    },
  };
}

describe("generateOrderCode", () => {
  it("generates an Order Code matching FD-XXXXXX without 0, O, 1, or I across 1000 runs", () => {
    expect(ORDER_CODE_PATTERN).toEqual(/^FD-[A-HJ-NP-Z2-9]{6}$/);

    const codes = new Set<string>();
    for (let i = 0; i < 1000; i += 1) {
      const code = generateOrderCode();
      expect(code).toMatch(ORDER_CODE_PATTERN);
      expect(code).not.toMatch(/[0O1I]/);
      codes.add(code);
    }

    expect(codes.size).toBeGreaterThan(990);
  });
});

describe("POST /api/orders HTTP contract", () => {
  it("returns 201 with an Order Code matching FD-XXXXXX for a valid Order", async () => {
    const payload = buildValidOrderPayload();

    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as OrderSuccess;
    expect(body).toEqual({
      orderCode: expect.stringMatching(ORDER_CODE_PATTERN),
    });
  });

  it("rejects with 400 UNKNOWN_RESTAURANT when restaurantId does not exist", async () => {
    const payload = {
      ...buildValidOrderPayload(),
      restaurantId: "unknown-restaurant-id",
    };

    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as OrderRejection;
    expect(body).toEqual({ reason: "UNKNOWN_RESTAURANT" });
  });

  it("rejects with 400 EMPTY_ORDER when lines is empty or has a non-positive quantity", async () => {
    const emptyLinesPayload: OrderRequest = {
      ...buildValidOrderPayload(),
      lines: [],
    };

    const emptyResponse = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emptyLinesPayload),
    });

    expect(emptyResponse.status).toBe(400);
    expect((await emptyResponse.json()) as OrderRejection).toEqual({
      reason: "EMPTY_ORDER",
    });

    const zeroQuantityPayload: OrderRequest = {
      ...buildValidOrderPayload(),
      lines: [
        {
          ...buildValidOrderPayload().lines[0]!,
          quantity: 0,
        },
      ],
    };

    const zeroQuantityResponse = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(zeroQuantityPayload),
    });

    expect(zeroQuantityResponse.status).toBe(400);
    expect((await zeroQuantityResponse.json()) as OrderRejection).toEqual({
      reason: "EMPTY_ORDER",
    });
  });

  it("rejects with 400 UNKNOWN_DISH when a dishId does not exist", async () => {
    const base = buildValidOrderPayload();
    const payload: OrderRequest = {
      ...base,
      lines: [
        base.lines[0]!,
        { dishId: "non-existent-dish", quantity: 1, price: 50000 },
      ],
    };

    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as OrderRejection;
    expect(body).toEqual({ reason: "UNKNOWN_DISH" });
  });

  it("rejects with 400 UNKNOWN_DISH when a Dish belongs to another Restaurant", async () => {
    const base = buildValidOrderPayload();
    const dishFromOtherRestaurant = getDishById("com-tam-suon-bi-cha")!;

    const payload: OrderRequest = {
      ...base,
      lines: [
        base.lines[0]!,
        {
          dishId: dishFromOtherRestaurant.id,
          quantity: 1,
          price: dishFromOtherRestaurant.price,
        },
      ],
    };

    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as OrderRejection;
    expect(body).toEqual({ reason: "UNKNOWN_DISH" });
  });

  it("rejects with 400 PRICE_CHANGED when a line has a stale price", async () => {
    const base = buildValidOrderPayload();
    const firstLine = base.lines[0]!;

    const payload: OrderRequest = {
      ...base,
      lines: [
        {
          ...firstLine,
          price: firstLine.price - 5000,
        },
        base.lines[1]!,
      ],
    };

    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as OrderRejection;
    expect(body).toEqual({ reason: "PRICE_CHANGED" });
  });

  it("rejects with 400 INVALID_CUSTOMER when customer fails checkoutSchema validation", async () => {
    const base = buildValidOrderPayload();
    const payload: OrderRequest = {
      ...base,
      customer: {
        ...base.customer,
        phone: "12345",
      },
    };

    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as OrderRejection;
    expect(body).toEqual({ reason: "INVALID_CUSTOMER" });
  });

  it("handles malformed JSON bodies with 400 instead of throwing 500", async () => {
    const response = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-valid-json",
    });

    expect(response.status).toBe(400);
    const body = (await response.json()) as OrderRejection;
    expect(body).toEqual({ reason: "UNKNOWN_RESTAURANT" });
  });
});







