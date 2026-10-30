import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DishCard } from "@/components/dish-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { formatVnd } from "@/lib/format-vnd";
import { DISHES, RESTAURANTS } from "@/lib/mock-data";

describe("RestaurantCard", () => {
  it("renders restaurant details and links to /restaurant/<id>", () => {
    const restaurant = RESTAURANTS[0]!;
    const html = renderToStaticMarkup(
      createElement(RestaurantCard, { restaurant, priority: true })
    );

    expect(html).toContain(`href="/restaurant/${restaurant.id}"`);
    expect(html).toContain(restaurant.name);
    expect(html).toContain(restaurant.cuisine.replace("&", "&amp;"));
    expect(html).toContain(String(restaurant.rating));
    expect(html).toContain(restaurant.address);
    expect(html).toContain(`${restaurant.deliveryMinutes} phút`);
    expect(html).toContain(`alt="${restaurant.name}"`);
  });
});

describe("DishCard", () => {
  it("renders dish image, name, description, and formatted VND price without action slot", () => {
    const dish = DISHES[0]!;
    const html = renderToStaticMarkup(createElement(DishCard, { dish }));

    expect(html).toContain(dish.name);
    expect(html).toContain(dish.description);
    expect(html).toContain(formatVnd(dish.price));
    expect(html).toContain(`alt="${dish.name}"`);
  });

  it("renders the optional action slot when provided", () => {
    const dish = DISHES[0]!;
    const html = renderToStaticMarkup(
      createElement(DishCard, {
        dish,
        action: createElement(
          "button",
          { type: "button" },
          "Thêm vào giỏ"
        ),
      })
    );

    expect(html).toContain("Thêm vào giỏ");
  });
});

describe("Route boundary components", () => {
  it("renders Loading status and Vietnamese copy", async () => {
    const { default: Loading } = await import("@/app/loading");
    const html = renderToStaticMarkup(createElement(Loading));

    expect(html).toContain('role="status"');
    expect(html).toContain("Đang tải dữ liệu");
  });

  it("renders NotFound with Vietnamese copy and link to Home", async () => {
    const { default: NotFound } = await import("@/app/not-found");
    const html = renderToStaticMarkup(createElement(NotFound));

    expect(html).toContain("Không tìm thấy nhà hàng");
    expect(html).toContain('href="/"');
    expect(html).toContain("Về trang chủ");
  });

  it("renders ErrorPage with retry button and link to Home", async () => {
    const { default: ErrorPage } = await import("@/app/error");
    const html = renderToStaticMarkup(
      createElement(ErrorPage, {
        error: new Error("Boom"),
        reset: () => {},
      })
    );

    expect(html).toContain("Đã xảy ra lỗi khi tải trang");
    expect(html).toContain("Thử lại");
    expect(html).toContain('href="/"');
  });
});

