import { expect, test } from "@playwright/test";
import { formatVnd } from "../lib/format-vnd";
import { getDishesByRestaurant, RESTAURANTS } from "../lib/mock-data";

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page
) {
  const hasOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });
  expect(hasOverflow).toBe(false);
}

test.describe("Duyệt nhà hàng và thực đơn (Browse Restaurants and Dishes)", () => {
  test("Trang chủ hiển thị đủ 3 nhà hàng kèm ảnh, thông tin và bấm vào từng nhà hàng mở đúng /restaurant/<slug>", async ({
    page,
  }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);

    for (const restaurant of RESTAURANTS) {
      const cardLink = page.getByRole("link", {
        name: new RegExp(restaurant.name),
      });
      await expect(cardLink).toBeVisible();
      await expect(cardLink).toContainText(restaurant.cuisine);
      await expect(cardLink).toContainText(String(restaurant.rating));
      await expect(cardLink).toContainText(restaurant.address);
      await expect(cardLink).toContainText(`${restaurant.deliveryMinutes} phút`);

      const img = cardLink.locator("img");
      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute("alt", restaurant.name);
    }

    for (const restaurant of RESTAURANTS) {
      await page.goto("/");
      await page
        .getByRole("link", { name: new RegExp(restaurant.name) })
        .click();
      await expect(page).toHaveURL(new RegExp(`/restaurant/${restaurant.id}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: restaurant.name })
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  for (const restaurant of RESTAURANTS) {
    test(`Trang nhà hàng ${restaurant.name} (/restaurant/${restaurant.id}) hiển thị đủ 5 món ăn với ảnh và giá VND đã định dạng, không tràn ngang`, async ({
      page,
    }) => {
      await page.goto(`/restaurant/${restaurant.id}`);
      await expectNoHorizontalOverflow(page);

      await expect(
        page.getByRole("heading", { level: 1, name: restaurant.name })
      ).toBeVisible();

      const dishes = getDishesByRestaurant(restaurant.id);
      expect(dishes).toHaveLength(5);

      for (const dish of dishes) {
        const dishCard = page.getByTestId(`dish-card-${dish.id}`);
        await expect(dishCard).toBeVisible();
        await expect(
          dishCard.getByRole("heading", { name: dish.name })
        ).toBeVisible();
        await expect(dishCard).toContainText(dish.description);
        await expect(dishCard).toContainText(formatVnd(dish.price));

        const dishImage = dishCard.locator("img");
        await expect(dishImage).toBeVisible();
        await expect(dishImage).toHaveAttribute("alt", dish.name);
      }
    });
  }

  test("Đường dẫn /restaurant/khong-ton-tai hiển thị trang not-found với liên kết quay về Trang chủ và không tràn ngang", async ({
    page,
  }) => {
    const response = await page.goto("/restaurant/khong-ton-tai");
    expect(response?.status()).toBe(404);
    await expectNoHorizontalOverflow(page);

    await expect(
      page.getByRole("heading", { name: /Không tìm thấy/i })
    ).toBeVisible();

    const homeLink = page.getByRole("link", { name: /Về trang chủ/i });
    await expect(homeLink).toBeVisible();
    await homeLink.click();

    await expect(page).toHaveURL(/\/$/);
  });
});
