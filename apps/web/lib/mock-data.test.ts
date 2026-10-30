import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DISHES,
  getAllDishes,
  getAllRestaurants,
  getDishById,
  getDishesByRestaurant,
  getDishesByRestaurantId,
  getRestaurantById,
  type CartLine,
  type Dish,
  type OrderRejection,
  type OrderRequest,
  type OrderSuccess,
  type Restaurant,
} from "@/lib";

describe("domain model & catalog invariants", () => {
  it("provides 3 Restaurants with unique slug ids, positive ratings/deliveryMinutes, and local WebP images", () => {
    const restaurants: Restaurant[] = getAllRestaurants();
    expect(restaurants).toHaveLength(3);

    const ids = new Set<string>();
    for (const restaurant of restaurants) {
      expect(restaurant.id).toMatch(/^[a-z0-9-]+$/);
      expect(ids.has(restaurant.id)).toBe(false);
      ids.add(restaurant.id);

      expect(restaurant.name.length).toBeGreaterThan(0);
      expect(restaurant.address.length).toBeGreaterThan(0);
      expect(restaurant.cuisine.length).toBeGreaterThan(0);
      expect(restaurant.rating).toBeGreaterThan(0);
      expect(restaurant.rating).toBeLessThanOrEqual(5);
      expect(Number.isInteger(restaurant.deliveryMinutes)).toBe(true);
      expect(restaurant.deliveryMinutes).toBeGreaterThan(0);
      expect(restaurant.imageUrl).toMatch(/^\/images\/restaurants\/[a-z0-9-]+\.webp$/);

      const diskPath = join(__dirname, "..", "public", restaurant.imageUrl);
      expect(existsSync(diskPath)).toBe(true);
    }
  });

  it("provides 15 Dishes (5 per Restaurant) with unique ids, valid restaurantId references, positive integer VND prices, and local WebP images", () => {
    const restaurants = getAllRestaurants();
    const restaurantIds = new Set(restaurants.map((r) => r.id));
    const dishes = getAllDishes();

    expect(dishes).toHaveLength(15);
    expect(DISHES).toHaveLength(15);

    const dishIds = new Set<string>();
    for (const dish of dishes) {
      expect(dish.id).toMatch(/^[a-z0-9-]+$/);
      expect(dishIds.has(dish.id)).toBe(false);
      dishIds.add(dish.id);

      expect(restaurantIds.has(dish.restaurantId)).toBe(true);
      expect(dish.name.length).toBeGreaterThan(0);
      expect(dish.description.length).toBeGreaterThan(0);
      expect(Number.isInteger(dish.price)).toBe(true);
      expect(dish.price).toBeGreaterThan(0);
      expect(dish.imageUrl).toMatch(/^\/images\/dishes\/[a-z0-9-]+\.webp$/);

      const diskPath = join(__dirname, "..", "public", dish.imageUrl);
      expect(existsSync(diskPath)).toBe(true);
    }

    for (const restaurant of restaurants) {
      const byRestaurant = getDishesByRestaurant(restaurant.id);
      const byRestaurantId = getDishesByRestaurantId(restaurant.id);
      expect(byRestaurant).toHaveLength(5);
      expect(byRestaurantId).toEqual(byRestaurant);
      for (const dish of byRestaurant) {
        expect(dish.restaurantId).toBe(restaurant.id);
      }
    }
  });

  it("lookups return the matching Restaurant/Dish and undefined (not a throw) for unknown ids", () => {
    const restaurants = getAllRestaurants();
    const firstRestaurant = restaurants[0];
    expect(getRestaurantById(firstRestaurant.id)).toEqual(firstRestaurant);
    expect(getRestaurantById("khong-ton-tai")).toBeUndefined();

    const dishes = getAllDishes();
    const firstDish = dishes[0];
    expect(getDishById(firstDish.id)).toEqual(firstDish);
    expect(getDishById("mon-khong-ton-tai")).toBeUndefined();

    expect(getDishesByRestaurant("khong-ton-tai")).toEqual([]);
  });

  it("exports complete domain types for Dish, CartLine, OrderRequest, OrderSuccess, and OrderRejection", () => {
    const sampleDish: Dish = {
      id: "pho-bo-tai-chin",
      restaurantId: "pho-gia-truyen-bat-dan",
      name: "Phở Bò Tái Chín",
      description: "Bánh phở mềm cùng thịt bò tái chín",
      price: 55000,
      imageUrl: "/images/dishes/pho-bo-tai-chin.webp",
    };
    const sampleCartLine: CartLine = {
      dishId: sampleDish.id,
      name: sampleDish.name,
      price: sampleDish.price,
      imageUrl: sampleDish.imageUrl,
      quantity: 2,
    };
    const sampleOrderRequest: OrderRequest = {
      restaurantId: sampleDish.restaurantId,
      lines: [
        {
          dishId: sampleCartLine.dishId,
          quantity: sampleCartLine.quantity,
          price: sampleCartLine.price,
        },
      ],
      customer: {
        fullName: "Nguyễn Văn An",
        phone: "0901234567",
        address: "123 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
        note: "Giao giờ hành chính",
      },
    };
    const sampleSuccess: OrderSuccess = {
      orderCode: "FD-7K3Q9P",
    };
    const sampleRejections: OrderRejection[] = [
      { reason: "UNKNOWN_RESTAURANT" },
      { reason: "UNKNOWN_DISH" },
      { reason: "PRICE_CHANGED" },
      { reason: "INVALID_CUSTOMER" },
      { reason: "EMPTY_ORDER" },
    ];

    expect(sampleOrderRequest.lines[0].price).toBe(55000);
    expect(sampleSuccess.orderCode).toBe("FD-7K3Q9P");
    expect(sampleRejections).toHaveLength(5);
  });
});
