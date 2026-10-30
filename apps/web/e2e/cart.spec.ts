import { expect, test, type Page } from "@playwright/test";
import { getDishesByRestaurant, RESTAURANTS } from "../lib/mock-data";

const [firstRestaurant, secondRestaurant] = RESTAURANTS;
const firstDish = getDishesByRestaurant(firstRestaurant!.id)[0]!;
const secondDish = getDishesByRestaurant(secondRestaurant!.id)[0]!;

/**
 * Hydration problems show up as readable warnings in dev builds and as
 * minified React errors (#418, #419, #423, #425) in the production build the
 * suite runs against, so match both.
 */
const HYDRATION_PATTERN =
  /hydrat|did not match|Minified React error #(418|419|423|425)/i;

/** Navigates and waits until the client has hydrated, so clicks are handled. */
async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByTestId("cart-badge")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
}

function addButton(page: Page, dishName: string) {
  return page.getByRole("button", {
    name: `Thêm ${dishName} vào giỏ hàng`,
  });
}

async function expectBadgeCount(page: Page, count: number) {
  const badge = page.getByTestId("cart-badge");
  await expect(badge).toHaveAccessibleName(`Giỏ hàng (${count} món)`);
  await expect(page.getByTestId("cart-badge-count")).toHaveText(String(count));
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test.describe("Thêm món vào giỏ hàng (Add Dishes to a Cart)", () => {
  test("bấm Thêm làm badge hiện 1 ngay và hiện toast", async ({ page }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await expect(page.getByTestId("cart-badge")).toHaveAccessibleName(
      "Giỏ hàng (0 món)",
    );

    await addButton(page, firstDish.name).click();

    await expectBadgeCount(page, 1);
    await expect(
      page.getByText(`Đã thêm ${firstDish.name} vào giỏ hàng`),
    ).toBeVisible();
  });

  test("giỏ hàng vẫn còn sau khi tải lại trang", async ({ page }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addButton(page, firstDish.name).click();
    await addButton(page, firstDish.name).click();
    await expectBadgeCount(page, 2);

    await page.reload();

    await expect(page.getByTestId("cart-badge")).toHaveAttribute(
      "data-hydrated",
      "true",
    );
    await expectBadgeCount(page, 2);
  });

  test("badge bằng tổng số món của giỏ hàng hai nhà hàng", async ({ page }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addButton(page, firstDish.name).click();
    await addButton(page, firstDish.name).click();
    await expectBadgeCount(page, 2);

    await gotoHydrated(page, `/restaurant/${secondRestaurant!.id}`);
    await addButton(page, secondDish.name).click();

    await expectBadgeCount(page, 3);

    await gotoHydrated(page, "/");
    await expectBadgeCount(page, 3);
  });

  test("lần thêm thứ 21 của một món hiện toast giới hạn và badge giữ 20", async ({
    page,
  }) => {
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    const button = addButton(page, firstDish.name);

    for (let i = 1; i <= 20; i++) {
      await button.click();
    }
    await expectBadgeCount(page, 20);
    await expect(page.getByText("Mỗi món tối đa 20 phần")).toHaveCount(0);

    await button.click();

    await expect(page.getByText("Mỗi món tối đa 20 phần")).toBeVisible();
    await expectBadgeCount(page, 20);
  });

  test("không có cảnh báo hydration trong console khi tải trang và thêm món", async ({
    page,
  }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        messages.push(message.text());
      }
    });
    page.on("pageerror", (error) => messages.push(error.message));

    // Fresh load with an empty Cart, then an add.
    await gotoHydrated(page, `/restaurant/${firstRestaurant!.id}`);
    await addButton(page, firstDish.name).click();
    await expectBadgeCount(page, 1);

    // Full load with a persisted Cart: the risky case for hydration.
    await page.reload();
    await expect(page.getByTestId("cart-badge")).toHaveAttribute(
      "data-hydrated",
      "true",
    );
    await expectBadgeCount(page, 1);
    await gotoHydrated(page, "/");
    await expectBadgeCount(page, 1);

    expect(messages.filter((text) => HYDRATION_PATTERN.test(text))).toEqual(
      [],
    );
  });
});
