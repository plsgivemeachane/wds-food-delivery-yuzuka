import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { createServer } from "@/mocks/node";
import { ORDER_CODE_PATTERN } from "@/mocks/order-code";
import { getDishesByRestaurant, RESTAURANTS } from "./mock-data";
import {
  buildOrderRequest,
  DEFAULT_ORDER_ERROR_MESSAGE,
  getOrderErrorMessage,
  ORDER_REJECTION_MESSAGES,
  placeOrder,
} from "./order";
import type { CartLine, OrderRequest } from "./types";
import type { CheckoutInput } from "./schemas";

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

const sampleRestaurant = RESTAURANTS[0]!;
const sampleDishes = getDishesByRestaurant(sampleRestaurant.id);
const dish1 = sampleDishes[0]!;
const dish2 = sampleDishes[1]!;

const sampleCartLines: CartLine[] = [
  {
    dishId: dish1.id,
    name: dish1.name,
    price: dish1.price,
    imageUrl: dish1.imageUrl,
    quantity: 2,
  },
  {
    dishId: dish2.id,
    name: dish2.name,
    price: dish2.price,
    imageUrl: dish2.imageUrl,
    quantity: 1,
  },
];

const sampleCustomer: CheckoutInput = {
  fullName: "Nguyễn Văn A",
  phone: "0901234567",
  address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1",
  note: "Giao trước 12h",
};

describe("ORDER_REJECTION_MESSAGES and getOrderErrorMessage", () => {
  it("maps PRICE_CHANGED to an instruction to review the cart", () => {
    expect(ORDER_REJECTION_MESSAGES.PRICE_CHANGED).toBe(
      "Giá món đã thay đổi, vui lòng kiểm tra lại giỏ hàng.",
    );
    expect(getOrderErrorMessage("PRICE_CHANGED")).toBe(
      "Giá món đã thay đổi, vui lòng kiểm tra lại giỏ hàng.",
    );
  });

  it("maps all other standard rejection reasons to Vietnamese messages", () => {
    expect(getOrderErrorMessage("UNKNOWN_RESTAURANT")).toBe(
      "Nhà hàng không tồn tại hoặc đã ngừng hoạt động.",
    );
    expect(getOrderErrorMessage("UNKNOWN_DISH")).toBe(
      "Món ăn không tồn tại hoặc không thuộc nhà hàng này.",
    );
    expect(getOrderErrorMessage("INVALID_CUSTOMER")).toBe(
      "Thông tin giao hàng không hợp lệ, vui lòng kiểm tra lại.",
    );
    expect(getOrderErrorMessage("EMPTY_ORDER")).toBe(
      "Giỏ hàng đang trống, vui lòng chọn món trước khi đặt hàng.",
    );
  });

  it("falls back to generic error message for unknown reasons or undefined", () => {
    expect(getOrderErrorMessage("SOMETHING_ELSE")).toBe(
      DEFAULT_ORDER_ERROR_MESSAGE,
    );
    expect(getOrderErrorMessage(undefined)).toBe(DEFAULT_ORDER_ERROR_MESSAGE);
    expect(getOrderErrorMessage(null)).toBe(DEFAULT_ORDER_ERROR_MESSAGE);
  });
});

describe("buildOrderRequest", () => {
  it("transforms cart lines and customer values into an OrderRequest", () => {
    const request = buildOrderRequest(
      sampleRestaurant.id,
      sampleCartLines,
      sampleCustomer,
    );

    expect(request).toEqual<OrderRequest>({
      restaurantId: sampleRestaurant.id,
      lines: [
        { dishId: dish1.id, quantity: 2, price: dish1.price },
        { dishId: dish2.id, quantity: 1, price: dish2.price },
      ],
      customer: {
        fullName: "Nguyễn Văn A",
        phone: "0901234567",
        address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1",
        note: "Giao trước 12h",
      },
    });
  });

  it("omits note if note is empty or whitespace", () => {
    const customerWithoutNote: CheckoutInput = {
      fullName: "Trần Thị B",
      phone: "0987654321",
      address: "456 Đường CMT8, Quận 3",
      note: "   ",
    };

    const request = buildOrderRequest(
      sampleRestaurant.id,
      sampleCartLines,
      customerWithoutNote,
    );

    expect(request.customer.note).toBeUndefined();
  });
});

describe("placeOrder with MSW node server", () => {
  it("returns success with a valid order code on 201", async () => {
    const request = buildOrderRequest(
      sampleRestaurant.id,
      sampleCartLines,
      sampleCustomer,
    );

    const result = await placeOrder(request);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.orderCode).toMatch(ORDER_CODE_PATTERN);
    }
  });

  it("returns mapped error when price changed (PRICE_CHANGED)", async () => {
    const tamperedLines: CartLine[] = [
      {
        dishId: dish1.id,
        name: dish1.name,
        price: dish1.price + 10000,
        imageUrl: dish1.imageUrl,
        quantity: 1,
      },
    ];

    const request = buildOrderRequest(
      sampleRestaurant.id,
      tamperedLines,
      sampleCustomer,
    );

    const result = await placeOrder(request);

    expect(result).toEqual({
      success: false,
      reason: "PRICE_CHANGED",
      errorMessage: "Giá món đã thay đổi, vui lòng kiểm tra lại giỏ hàng.",
    });
  });

  it("returns mapped error when restaurant is unknown", async () => {
    const request = buildOrderRequest(
      "non-existent-restaurant",
      sampleCartLines,
      sampleCustomer,
    );

    const result = await placeOrder(request);

    expect(result).toEqual({
      success: false,
      reason: "UNKNOWN_RESTAURANT",
      errorMessage: "Nhà hàng không tồn tại hoặc đã ngừng hoạt động.",
    });
  });

  it("returns mapped error when customer is invalid", async () => {
    const invalidCustomer = {
      fullName: "A", // too short
      phone: "123", // invalid
      address: "Short",
    } as unknown as CheckoutInput;

    const request = buildOrderRequest(
      sampleRestaurant.id,
      sampleCartLines,
      invalidCustomer,
    );

    const result = await placeOrder(request);

    expect(result).toEqual({
      success: false,
      reason: "INVALID_CUSTOMER",
      errorMessage: "Thông tin giao hàng không hợp lệ, vui lòng kiểm tra lại.",
    });
  });

  it("handles 500 server error gracefully", async () => {
    server.use(
      http.post("*/api/orders", () => {
        return HttpResponse.json({ error: "crash" }, { status: 500 });
      }),
    );

    const request = buildOrderRequest(
      sampleRestaurant.id,
      sampleCartLines,
      sampleCustomer,
    );

    const result = await placeOrder(request);

    expect(result).toEqual({
      success: false,
      errorMessage: DEFAULT_ORDER_ERROR_MESSAGE,
    });
  });

  it("handles network error gracefully", async () => {
    server.use(
      http.post("*/api/orders", () => {
        return HttpResponse.error();
      }),
    );

    const request = buildOrderRequest(
      sampleRestaurant.id,
      sampleCartLines,
      sampleCustomer,
    );

    const result = await placeOrder(request);

    expect(result).toEqual({
      success: false,
      errorMessage: DEFAULT_ORDER_ERROR_MESSAGE,
    });
  });
});
