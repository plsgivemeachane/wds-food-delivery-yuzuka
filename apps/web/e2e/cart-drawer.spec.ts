import { expect, test, type Page } from "@playwright/test";
import { formatVnd } from "../lib/format-vnd";
import { getDishesByRestaurant, RESTAURANTS } from "../lib/mock-data";

const [firstRestaurant, secondRestaurant] = RESTAURANTS;
const firstDish = getDishesByRestaurant(firstRestaurant!.id)[0]!;
const secondDish = getDishesByRestaurant(secondRestaurant!.id)[0]!;

const HYDRATION_PATTERN =
  /hydrat|did not match|Minified React error #(418|419|423|425)/i;

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

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test.describe("Cart Drawer với một section cho mỗi Cart (Issue #12)", () => {
  test("mở Cart Drawer khi giỏ rỗng hiển thị empty state và liên kết về trang chủ", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");
    await openDrawer(page);

    const emptyState = page.getByTestId("cart-empty-state");
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText("Giỏ hàng trống");

    const browseLink = page.getByTestId("cart-empty-browse-link");
    await expect(browseLink).toBeVisible();
    await expect(browseLink).toHaveAttribute("href", "/");

    await browseLink.click();
    await expect(page.getByTestId("cart-drawer")).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test("món từ hai Nhà hàng hiển thị thành 2 section riêng biệt với tạm tính chuẩn, không có tổng cộng", async ({
    page,
  }) => {
    // Thêm 2 phần món thứ nhất từ nhà hàng 1
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    const firstAddBtn = addDishButton(page, firstDish.name);
    await firstAddBtn.click();
    await firstAddBtn.click();

    // Thêm 1 phần món thứ hai từ nhà hàng 2
    await gotoHydrated(page, `/restaurant/${secondRestaurant!.id}`);
    const secondAddBtn = addDishButton(page, secondDish.name);
    await secondAddBtn.click();

    // Mở Cart Drawer
    await openDrawer(page);

    const section1 = page.getByTestId(`cart-section-${firstRestaurant!.id}`);
    const section2 = page.getByTestId(`cart-section-${secondRestaurant!.id}`);

    await expect(section1).toBeVisible();
    await expect(section2).toBeVisible();

    // Tên nhà hàng
    await expect(
      page.getByTestId(`cart-restaurant-name-${firstRestaurant!.id}`),
    ).toHaveText(firstRestaurant!.name);
    await expect(
      page.getByTestId(`cart-restaurant-name-${secondRestaurant!.id}`),
    ).toHaveText(secondRestaurant!.name);

    // Món và số lượng
    const dish1Row = page.getByTestId(`cart-dish-${firstDish.id}`);
    await expect(dish1Row).toContainText(firstDish.name);
    await expect(dish1Row).toContainText(formatVnd(firstDish.price));
    await expect(
      page.getByTestId(`cart-quantity-${firstDish.id}`),
    ).toHaveText("2");

    const dish2Row = page.getByTestId(`cart-dish-${secondDish.id}`);
    await expect(dish2Row).toContainText(secondDish.name);
    await expect(dish2Row).toContainText(formatVnd(secondDish.price));
    await expect(
      page.getByTestId(`cart-quantity-${secondDish.id}`),
    ).toHaveText("1");

    // Tạm tính từng section
    await expect(
      page.getByTestId(`cart-section-subtotal-${firstRestaurant!.id}`),
    ).toHaveText(formatVnd(firstDish.price * 2));
    await expect(
      page.getByTestId(`cart-section-subtotal-${secondRestaurant!.id}`),
    ).toHaveText(formatVnd(secondDish.price * 1));

    // Không có tổng cộng toàn bộ giỏ (no grand total)
    const combinedTotal = firstDish.price * 2 + secondDish.price * 1;
    await expect(
      page.getByText(formatVnd(combinedTotal)),
    ).toHaveCount(0);
  });

  test("nút '+' và '−' cập nhật tạm tính và badge ngay lập tức kèm toast", async ({
    page,
  }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addDishButton(page, firstDish.name).click();

    await openDrawer(page);

    const subtotalEl = page.getByTestId(
      `cart-section-subtotal-${firstRestaurant!.id}`,
    );
    await expect(subtotalEl).toHaveText(formatVnd(firstDish.price));

    // Bấm tăng (+)
    const increaseBtn = page.getByTestId(`cart-increase-${firstDish.id}`);
    await increaseBtn.click();

    await expect(
      page.getByTestId(`cart-quantity-${firstDish.id}`),
    ).toHaveText("2");
    await expect(subtotalEl).toHaveText(formatVnd(firstDish.price * 2));
    await expect(page.getByTestId("cart-badge-count")).toHaveText("2");
    await expect(
      page.getByText(`Đã tăng số lượng ${firstDish.name}`),
    ).toBeVisible();

    // Bấm giảm (−)
    const decreaseBtn = page.getByTestId(`cart-decrease-${firstDish.id}`);
    await decreaseBtn.click();

    await expect(
      page.getByTestId(`cart-quantity-${firstDish.id}`),
    ).toHaveText("1");
    await expect(subtotalEl).toHaveText(formatVnd(firstDish.price));
    await expect(page.getByTestId("cart-badge-count")).toHaveText("1");
    await expect(
      page.getByText(`Đã giảm số lượng ${firstDish.name}`),
    ).toBeVisible();
  });

  test("nút '−' ở số lượng 1 sẽ xoá món; xoá món cuối cùng sẽ xoá luôn section của Nhà hàng đó", async ({
    page,
  }) => {
    // Thêm 1 món ở nhà hàng 1, 1 món ở nhà hàng 2
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addDishButton(page, firstDish.name).click();

    await gotoHydrated(page, `/restaurant/${secondRestaurant!.id}`);
    await addDishButton(page, secondDish.name).click();

    await openDrawer(page);

    const section1 = page.getByTestId(`cart-section-${firstRestaurant!.id}`);
    const section2 = page.getByTestId(`cart-section-${secondRestaurant!.id}`);
    await expect(section1).toBeVisible();
    await expect(section2).toBeVisible();

    // Giảm món nhà hàng 1 từ 1 -> xoá món và xoá section 1
    const decreaseBtn1 = page.getByTestId(`cart-decrease-${firstDish.id}`);
    await decreaseBtn1.click();

    await expect(
      page.getByText(`Đã xoá ${firstDish.name} khỏi giỏ hàng`),
    ).toBeVisible();
    await expect(section1).toBeHidden();
    await expect(section2).toBeVisible();
    await expect(page.getByTestId("cart-badge-count")).toHaveText("1");

    // Xoá món ở nhà hàng 2 bằng nút xoá (thùng rác) -> xoá section 2, hiện empty state
    const removeBtn2 = page.getByTestId(`cart-remove-${secondDish.id}`);
    await removeBtn2.click();

    await expect(
      page.getByText(`Đã xoá ${secondDish.name} khỏi giỏ hàng`),
    ).toBeVisible();
    await expect(section2).toBeHidden();
    await expect(page.getByTestId("cart-empty-state")).toBeVisible();
    await expect(page.getByTestId("cart-badge-count")).toBeHidden();
  });

  test("liên kết 'Đặt hàng' trỏ chính xác về /checkout?restaurantId=<id>", async ({
    page,
  }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addDishButton(page, firstDish.name).click();

    await gotoHydrated(page, `/restaurant/${secondRestaurant!.id}`);
    await addDishButton(page, secondDish.name).click();

    await openDrawer(page);

    const checkoutLink1 = page.getByTestId(
      `cart-checkout-link-${firstRestaurant!.id}`,
    );
    const checkoutLink2 = page.getByTestId(
      `cart-checkout-link-${secondRestaurant!.id}`,
    );

    await expect(checkoutLink1).toHaveAttribute(
      "href",
      `/checkout?restaurantId=${firstRestaurant!.id}`,
    );
    await expect(checkoutLink1).toHaveText("Đặt hàng");

    await expect(checkoutLink2).toHaveAttribute(
      "href",
      `/checkout?restaurantId=${secondRestaurant!.id}`,
    );
    await expect(checkoutLink2).toHaveText("Đặt hàng");
  });

  test("phím Esc đóng Cart Drawer", async ({ page }) => {
    await gotoHydrated(page, "/");
    await openDrawer(page);

    await expect(page.getByTestId("cart-drawer")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("cart-drawer")).toBeHidden();
  });

  test("không tràn ngang ở viewport 375px khi Cart Drawer mở", async ({
    page,
  }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addDishButton(page, firstDish.name).click();

    await gotoHydrated(page, `/restaurant/${secondRestaurant!.id}`);
    await addDishButton(page, secondDish.name).click();

    await openDrawer(page);
    await expectNoHorizontalOverflow(page);
  });

  test("không có cảnh báo hydration trong console khi mở và thao tác với Cart Drawer", async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        messages.push(message.text());
      }
    });
    page.on("pageerror", (error) => messages.push(error.message));

    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addDishButton(page, firstDish.name).click();

    await openDrawer(page);
    await page.getByTestId(`cart-increase-${firstDish.id}`).click();

    // Reload with persisted carts and open drawer again
    await page.reload();
    await expect(page.getByTestId("cart-badge")).toHaveAttribute(
      "data-hydrated",
      "true",
    );
    await openDrawer(page);
    await expect(
      page.getByTestId(`cart-section-${firstRestaurant!.id}`),
    ).toBeVisible();

    expect(messages.filter((text) => HYDRATION_PATTERN.test(text))).toEqual([]);
  });
});
