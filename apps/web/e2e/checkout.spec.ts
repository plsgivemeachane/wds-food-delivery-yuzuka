import { expect, test, type Page } from "@playwright/test";
import { formatVnd } from "../lib/format-vnd";
import {
  getDishesByRestaurant,
  RESTAURANTS,
} from "../lib/mock-data";
import type { CartLine } from "../lib/types";

const [firstRestaurant, secondRestaurant] = RESTAURANTS;
const firstDishes = getDishesByRestaurant(firstRestaurant!.id);
const secondDishes = getDishesByRestaurant(secondRestaurant!.id);

const dish1 = firstDishes[0]!;
const dish2 = firstDishes[1]!;
const otherDish = secondDishes[0]!;

const HYDRATION_PATTERN =
  /hydrat|did not match|Minified React error #(418|419|423|425)/i;

async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByTestId("cart-badge")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
}

async function seedCart(page: Page, carts: Record<string, CartLine[]>) {
  await page.goto("/");
  await page.evaluate(
    ({ storageKey, carts }) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ state: { carts }, version: 1 }),
      );
    },
    { storageKey: "fd-carts-v1", carts },
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test.describe("Trang thanh toán và kiểm tra form (Checkout page & form validation)", () => {
  test("chuyển hướng về trang chủ kèm toast khi thiếu, rỗng hoặc sai restaurantId", async ({
    page,
  }) => {
    // 1. Missing restaurantId
    await gotoHydrated(page, "/checkout");
    await expect(page).toHaveURL("/");
    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(
      page.getByText("Vui lòng chọn nhà hàng để thanh toán"),
    ).toBeVisible();

    // Clear toasts
    await page.evaluate(() => window.localStorage.clear());

    // 2. Empty restaurantId
    await gotoHydrated(page, "/checkout?restaurantId=");
    await expect(page).toHaveURL("/");
    await expect(page.locator("[data-sonner-toast]")).toBeVisible();

    // 3. Unknown restaurantId
    await gotoHydrated(page, "/checkout?restaurantId=nha-hang-khong-ton-tai");
    await expect(page).toHaveURL("/");
    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(
      page.getByText("Không tìm thấy nhà hàng để thanh toán"),
    ).toBeVisible();
  });

  test("chuyển hướng về trang chủ kèm toast khi giỏ hàng của nhà hàng đang trống", async ({
    page,
  }) => {
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);
    await expect(page).toHaveURL("/");
    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(page.getByText("Giỏ hàng của bạn đang trống")).toBeVisible();
  });

  test("hiển thị tóm tắt đơn hàng đúng món, số lượng, tạm tính và chỉ của nhà hàng đó", async ({
    page,
  }) => {
    const carts = {
      [firstRestaurant!.id]: [
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
      ],
      [secondRestaurant!.id]: [
        {
          dishId: otherDish.id,
          name: otherDish.name,
          price: otherDish.price,
          imageUrl: otherDish.imageUrl,
          quantity: 3,
        },
      ],
    };

    await seedCart(page, carts);
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);

    // Verify current page is checkout
    await expect(page).toHaveURL(
      `/checkout?restaurantId=${firstRestaurant!.id}`,
    );

    const summary = page.getByTestId("checkout-summary");
    await expect(summary).toBeVisible();

    // Restaurant name is displayed
    await expect(page.getByTestId("checkout-restaurant-name")).toContainText(
      firstRestaurant!.name,
    );

    // Dishes from first restaurant are displayed with quantities and line totals
    const line1 = page.getByTestId(`checkout-line-${dish1.id}`);
    await expect(line1).toBeVisible();
    await expect(line1.getByTestId("checkout-dish-name")).toHaveText(dish1.name);
    await expect(line1.getByTestId("checkout-dish-quantity")).toContainText(
      "Số lượng: 2",
    );
    await expect(line1.getByTestId("checkout-dish-total")).toHaveText(
      formatVnd(dish1.price * 2),
    );

    const line2 = page.getByTestId(`checkout-line-${dish2.id}`);
    await expect(line2).toBeVisible();
    await expect(line2.getByTestId("checkout-dish-name")).toHaveText(dish2.name);
    await expect(line2.getByTestId("checkout-dish-quantity")).toContainText(
      "Số lượng: 1",
    );
    await expect(line2.getByTestId("checkout-dish-total")).toHaveText(
      formatVnd(dish2.price * 1),
    );

    // Subtotal matches sum of first restaurant's lines
    const expectedSubtotal = dish1.price * 2 + dish2.price * 1;
    await expect(page.getByTestId("checkout-subtotal")).toHaveText(
      formatVnd(expectedSubtotal),
    );

    // Second restaurant's dish is NOT present
    await expect(
      page.getByTestId(`checkout-line-${otherDish.id}`),
    ).toHaveCount(0);
    await expect(summary).not.toContainText(otherDish.name);
    await expect(summary).not.toContainText(secondRestaurant!.name);
  });

  test("bấm gửi form rỗng hiển thị đúng 1 lỗi tiếng Việt cho mỗi trường bắt buộc và không có lỗi ở ghi chú", async ({
    page,
  }) => {
    const carts = {
      [firstRestaurant!.id]: [
        {
          dishId: dish1.id,
          name: dish1.name,
          price: dish1.price,
          imageUrl: dish1.imageUrl,
          quantity: 1,
        },
      ],
    };

    await seedCart(page, carts);
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);

    // Click submit empty
    const submitButton = page.getByTestId("checkout-submit-button");
    await submitButton.click();

    // Required fields show their exact Vietnamese errors
    const fullNameError = page.locator("#fullName-error");
    await expect(fullNameError).toBeVisible();
    await expect(fullNameError).toHaveText("Vui lòng nhập họ và tên");

    const phoneError = page.locator("#phone-error");
    await expect(phoneError).toBeVisible();
    await expect(phoneError).toHaveText("Vui lòng nhập số điện thoại");

    const addressError = page.locator("#address-error");
    await expect(addressError).toBeVisible();
    await expect(addressError).toHaveText("Vui lòng nhập địa chỉ giao hàng");

    // Note is optional, no error shown
    const noteError = page.locator("#note-error");
    await expect(noteError).toHaveCount(0);

    // Inputs have aria-invalid and aria-describedby linked
    await expect(page.locator("#fullName")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator("#fullName")).toHaveAttribute(
      "aria-describedby",
      "fullName-error",
    );

    await expect(page.locator("#phone")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator("#phone")).toHaveAttribute(
      "aria-describedby",
      "phone-error",
    );

    await expect(page.locator("#address")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator("#address")).toHaveAttribute(
      "aria-describedby",
      "address-error",
    );

    await expect(page.locator("#note")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  test("kiểm tra số điện thoại: 0901234567 hợp lệ và 12345 báo lỗi", async ({
    page,
  }) => {
    const carts = {
      [firstRestaurant!.id]: [
        {
          dishId: dish1.id,
          name: dish1.name,
          price: dish1.price,
          imageUrl: dish1.imageUrl,
          quantity: 1,
        },
      ],
    };

    await seedCart(page, carts);
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);

    const fullNameInput = page.locator("#fullName");
    const phoneInput = page.locator("#phone");
    const addressInput = page.locator("#address");
    const submitButton = page.getByTestId("checkout-submit-button");

    await fullNameInput.fill("Nguyễn Văn An");
    await addressInput.fill("123 Đường Lê Lợi, Phường Bến Nghé, Quận 1");

    // Invalid phone: 12345
    await phoneInput.fill("12345");
    await submitButton.click();

    const phoneError = page.locator("#phone-error");
    await expect(phoneError).toBeVisible();
    await expect(phoneError).toHaveText("Số điện thoại không hợp lệ");
    await expect(phoneInput).toHaveAttribute("aria-invalid", "true");

    // Valid phone: 0901234567
    await phoneInput.fill("0901234567");
    await submitButton.click();

    await expect(phoneError).toHaveCount(0);
    await expect(phoneInput).toHaveAttribute("aria-invalid", "false");
    // Required fields are valid, no error on full name or address either
    await expect(page.locator("#fullName-error")).toHaveCount(0);
    await expect(page.locator("#address-error")).toHaveCount(0);
  });

  test("không bị tràn chiều ngang ở giao diện 375px và 1280px", async ({
    page,
  }) => {
    const carts = {
      [firstRestaurant!.id]: [
        {
          dishId: dish1.id,
          name: dish1.name,
          price: dish1.price,
          imageUrl: dish1.imageUrl,
          quantity: 2,
        },
      ],
    };

    await seedCart(page, carts);
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);

    // Check no horizontal scroll overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });

  test("không có cảnh báo hydration trong console khi tải trang thanh toán", async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        messages.push(message.text());
      }
    });
    page.on("pageerror", (error) => messages.push(error.message));

    const carts = {
      [firstRestaurant!.id]: [
        {
          dishId: dish1.id,
          name: dish1.name,
          price: dish1.price,
          imageUrl: dish1.imageUrl,
          quantity: 2,
        },
      ],
    };

    await seedCart(page, carts);
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);

    // Wait a brief moment to ensure all hydration microtasks settle
    await page.waitForTimeout(300);

    const hydrationErrors = messages.filter((text) =>
      HYDRATION_PATTERN.test(text),
    );
    expect(hydrationErrors).toEqual([]);
  });
});
