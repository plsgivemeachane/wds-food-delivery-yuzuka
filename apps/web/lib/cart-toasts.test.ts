import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISHES } from "./mock-data";

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: toastMock }));

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

vi.stubGlobal("localStorage", createMemoryStorage());

const { useCartStore, selectCartQuantity } = await import("./cart-store");
const {
  addDishWithToast,
  increaseWithToast,
  decreaseWithToast,
  removeWithToast,
} = await import("./cart-toasts");

const dish = DISHES[0]!;

function allToastCalls() {
  return [
    ...toastMock.success.mock.calls,
    ...toastMock.warning.mock.calls,
    ...toastMock.info.mock.calls,
    ...toastMock.error.mock.calls,
  ].map((call) => call[0] as string);
}

function quantityOfDish() {
  return selectCartQuantity(dish.restaurantId)(useCartStore.getState());
}

beforeEach(() => {
  useCartStore.setState({ carts: {} });
  vi.clearAllMocks();
});

describe("addDishWithToast", () => {
  it("adds the Dish to its Restaurant's Cart and shows a success toast naming the Dish", () => {
    const status = addDishWithToast(dish);

    expect(status).toBe("added");
    expect(quantityOfDish()).toBe(1);
    expect(toastMock.success).toHaveBeenCalledTimes(1);
    expect(toastMock.success.mock.calls[0]![0]).toBe(
      `Đã thêm ${dish.name} vào giỏ hàng`,
    );
  });

  it("shows the 20-per-Dish cap toast instead of adding on the 21st add", () => {
    for (let i = 0; i < 20; i++) addDishWithToast(dish);
    vi.clearAllMocks();

    const status = addDishWithToast(dish);

    expect(status).toBe("capped");
    expect(quantityOfDish()).toBe(20);
    expect(toastMock.success).not.toHaveBeenCalled();
    expect(toastMock.warning).toHaveBeenCalledTimes(1);
    expect(toastMock.warning.mock.calls[0]![0]).toBe("Mỗi món tối đa 20 phần");
  });
});

describe("increaseWithToast", () => {
  it("increases the quantity and shows the increase toast", () => {
    addDishWithToast(dish);
    vi.clearAllMocks();

    const status = increaseWithToast(dish.restaurantId, dish.id);

    expect(status).toBe("added");
    expect(quantityOfDish()).toBe(2);
    expect(toastMock.success).toHaveBeenCalledTimes(1);
    expect(toastMock.success.mock.calls[0]![0]).toContain("Đã tăng số lượng");
  });

  it("shows the cap toast when the Dish is already at 20", () => {
    for (let i = 0; i < 20; i++) addDishWithToast(dish);
    vi.clearAllMocks();

    const status = increaseWithToast(dish.restaurantId, dish.id);

    expect(status).toBe("capped");
    expect(quantityOfDish()).toBe(20);
    expect(allToastCalls()).toEqual(["Mỗi món tối đa 20 phần"]);
  });
});

describe("decreaseWithToast", () => {
  it("decreases the quantity and shows the decrease toast", () => {
    addDishWithToast(dish);
    addDishWithToast(dish);
    vi.clearAllMocks();

    decreaseWithToast(dish.restaurantId, dish.id);

    expect(quantityOfDish()).toBe(1);
    expect(allToastCalls()).toHaveLength(1);
    expect(allToastCalls()[0]).toContain("Đã giảm số lượng");
  });

  it("shows the remove toast when decreasing a Dish at quantity 1 removes it", () => {
    addDishWithToast(dish);
    vi.clearAllMocks();

    decreaseWithToast(dish.restaurantId, dish.id);

    expect(useCartStore.getState().carts[dish.restaurantId]).toBeUndefined();
    expect(allToastCalls()).toEqual([`Đã xoá ${dish.name} khỏi giỏ hàng`]);
  });

  it("does nothing and shows no toast when the Dish is not in the Cart", () => {
    decreaseWithToast(dish.restaurantId, dish.id);

    expect(allToastCalls()).toEqual([]);
  });
});

describe("removeWithToast", () => {
  it("removes the line and shows the remove toast naming the Dish", () => {
    addDishWithToast(dish);
    addDishWithToast(dish);
    vi.clearAllMocks();

    removeWithToast(dish.restaurantId, dish.id);

    expect(quantityOfDish()).toBe(0);
    expect(allToastCalls()).toEqual([`Đã xoá ${dish.name} khỏi giỏ hàng`]);
  });

  it("does nothing and shows no toast when the Dish is not in the Cart", () => {
    removeWithToast(dish.restaurantId, dish.id);

    expect(allToastCalls()).toEqual([]);
  });
});
