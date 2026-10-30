import { expect, test, type Page } from "@playwright/test";
import { getDishesByRestaurant, RESTAURANTS } from "../lib/mock-data";
import { ORDER_CODE_PATTERN } from "../mocks/order-code";
import type { CartLine } from "../lib/types";

const [firstRestaurant, secondRestaurant] = RESTAURANTS;
const firstDishes = getDishesByRestaurant(firstRestaurant!.id);
const secondDishes = getDishesByRestaurant(secondRestaurant!.id);

const dish1 = firstDishes[0]!;
const dish2 = firstDishes[1]!;
const otherDish = secondDishes[0]!;

async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByTestId("cart-badge")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
}

function addDishButton(page: Page, dishName: string) {
  return page.getByRole("button", {
    name: `Thêm ${dishName} vào giỏ hàng`,
  });
}

async function openDrawer(page: Page) {
  await page.getByTestId("cart-badge").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });
  expect(hasOverflow).toBe(false);
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

test.describe("Đặt hàng, xác nhận đơn hàng và xóa giỏ hàng (Issue #14)", () => {
  test("luồng đặt hàng hoàn chỉnh: thêm món từ 2 nhà hàng -> Drawer -> Đặt hàng -> điền form -> submit -> spinner -> hiển thị Mã đơn hàng -> xóa đúng giỏ hàng", async ({
    page,
  }) => {
    // 1. Thêm món từ nhà hàng 1
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addDishButton(page, dish1.name).click();
    await addDishButton(page, dish2.name).click();

    // 2. Thêm món từ nhà hàng 2
    await gotoHydrated(page, `/restaurant/${secondRestaurant!.id}`);
    await addDishButton(page, otherDish.name).click();

    // Badge hiện tổng cộng 3 món
    await expect(page.getByTestId("cart-badge-count")).toHaveText("3");

    // 3. Mở Drawer từ badge
    await openDrawer(page);

    // 4. Bấm "Đặt hàng" cho Nhà hàng 1
    const checkoutLink1 = page.getByTestId(
      `cart-checkout-link-${firstRestaurant!.id}`,
    );
    await expect(checkoutLink1).toBeVisible();
    await checkoutLink1.click();

    await expect(page).toHaveURL(`/checkout?restaurantId=${firstRestaurant!.id}`);
    await expect(page.getByTestId("checkout-form")).toBeVisible();

    // 5. Điền form hợp lệ (phone 0901234567)
    await page.locator("#fullName").fill("Nguyễn Văn An");
    await page.locator("#phone").fill("0901234567");
    await page.locator("#address").fill("123 Đường Lê Lợi, Phường Bến Nghé, Quận 1");
    await page.locator("#note").fill("Giao giờ hành chính");

    const submitButton = page.getByTestId("checkout-submit-button");
    await expect(submitButton).toBeEnabled();

    // 6. Submit và kiểm tra chuyển sang màn hình xác nhận
    await submitButton.click();

    // Màn hình xác nhận hiển thị
    const confirmation = page.getByTestId("order-confirmation");
    await expect(confirmation).toBeVisible();

    // 7. Màn hình xác nhận hiển thị Mã đơn hàng khớp /FD-[A-HJ-NP-Z2-9]{6}/
    const orderCodeElement = page.getByTestId("order-code");
    await expect(orderCodeElement).toBeVisible();
    await expect(orderCodeElement).toHaveText(ORDER_CODE_PATTERN);
    await expect(confirmation).toContainText("Mã đơn hàng");

    // Kiểm tra không tràn ngang màn hình xác nhận
    await expectNoHorizontalOverflow(page);

    // 8. Giỏ hàng của Nhà hàng A bị xóa, giỏ hàng Nhà hàng B vẫn giữ nguyên
    // Badge chỉ còn 1 món (của Nhà hàng B)
    await expect(page.getByTestId("cart-badge-count")).toHaveText("1");

    // Mở drawer kiểm tra section Nhà hàng A đã mất, section Nhà hàng B còn
    await openDrawer(page);
    await expect(
      page.getByTestId(`cart-section-${firstRestaurant!.id}`),
    ).toHaveCount(0);
    await expect(
      page.getByTestId(`cart-section-${secondRestaurant!.id}`),
    ).toBeVisible();
    await expect(
      page.getByTestId(`cart-dish-${otherDish.id}`),
    ).toBeVisible();
  });

  test("tải lại (reload) trang xác nhận đơn hàng sẽ chuyển hướng về trang chủ (/)", async ({
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

    await page.locator("#fullName").fill("Trần Thị B");
    await page.locator("#phone").fill("0901234567");
    await page.locator("#address").fill("456 Đường CMT8, Phường 11, Quận 3");

    await page.getByTestId("checkout-submit-button").click();
    await expect(page.getByTestId("order-confirmation")).toBeVisible();

    // Reload trang xác nhận
    await page.reload();

    // Chuyển hướng về trang chủ (/) kèm toast báo giỏ hàng trống
    await expect(page).toHaveURL("/");
    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(page.getByText("Giỏ hàng của bạn đang trống")).toBeVisible();
  });

  test("bị từ chối đặt hàng (PRICE_CHANGED) hiển thị đúng thông báo lỗi tiếng Việt và giữ lại giỏ hàng", async ({
    page,
  }) => {
    // Giỏ hàng có giá bị sai lệch so với thực đơn để kích hoạt PRICE_CHANGED
    const carts = {
      [firstRestaurant!.id]: [
        {
          dishId: dish1.id,
          name: dish1.name,
          price: dish1.price + 15000,
          imageUrl: dish1.imageUrl,
          quantity: 2,
        },
      ],
    };
    await seedCart(page, carts);
    await gotoHydrated(page, `/checkout?restaurantId=${firstRestaurant!.id}`);

    await page.locator("#fullName").fill("Lê Văn C");
    await page.locator("#phone").fill("0901234567");
    await page.locator("#address").fill("789 Đường Hai Bà Trưng, Quận 1");
    await page.locator("#note").fill("Ghi chú thử nghiệm");

    await page.getByTestId("checkout-submit-button").click();

    // Hiển thị toast thông báo lỗi tiếng Việt
    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(
      page.getByText("Giá món đã thay đổi, vui lòng kiểm tra lại giỏ hàng."),
    ).toBeVisible();

    // Vẫn ở form đặt hàng, không chuyển sang confirmation
    await expect(page.getByTestId("checkout-form")).toBeVisible();

    // Dữ liệu form được giữ nguyên
    await expect(page.locator("#fullName")).toHaveValue("Lê Văn C");
    await expect(page.locator("#phone")).toHaveValue("0901234567");
    await expect(page.locator("#address")).toHaveValue(
      "789 Đường Hai Bà Trưng, Quận 1",
    );
    await expect(page.locator("#note")).toHaveValue("Ghi chú thử nghiệm");

    // Giỏ hàng vẫn được giữ nguyên
    await expect(page.getByTestId("checkout-summary")).toBeVisible();
    await expect(page.getByTestId("cart-badge-count")).toHaveText("2");
  });

  test("nút 'Quay về trang chủ' trên màn hình xác nhận chuyển hướng về trang chủ", async ({
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

    await page.locator("#fullName").fill("Phạm Văn D");
    await page.locator("#phone").fill("0901234567");
    await page.locator("#address").fill("101 Đường Nam Kỳ Khởi Nghĩa, Quận 1");

    await page.getByTestId("checkout-submit-button").click();
    await expect(page.getByTestId("order-confirmation")).toBeVisible();

    await page.getByRole("link", { name: "Quay về trang chủ" }).click();
    await expect(page).toHaveURL("/");
  });
});
