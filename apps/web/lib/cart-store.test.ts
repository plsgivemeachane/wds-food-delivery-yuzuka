import { beforeEach, describe, expect, it, vi } from "vitest";
import { DISHES } from "./mock-data";

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

const memoryStorage = createMemoryStorage();
vi.stubGlobal("localStorage", memoryStorage);

const {
  CART_STORAGE_KEY,
  MAX_QUANTITY_PER_DISH,
  selectCartLines,
  selectCartQuantity,
  selectCartSubtotal,
  selectNonEmptyCarts,
  selectTotalQuantity,
  useCartStore,
} = await import("./cart-store");

// Phở Gia Truyền Bát Đàn dishes:
// pho-bo-tai-chin: 55_000, pho-bo-dac-biet: 75_000
const phoTaiChin = DISHES.find((d) => d.id === "pho-bo-tai-chin")!;
const phoDacBiet = DISHES.find((d) => d.id === "pho-bo-dac-biet")!;
// Cơm Tấm Sài Gòn Xưa dish:
// com-tam-suon-bi-cha: 60_000
const comTamSuon = DISHES.find((d) => d.id === "com-tam-suon-bi-cha")!;
// Bánh Mì Hội An Phố Cổ dish:
// banh-mi-thap-cam-hoi-an: 35_000
const banhMiHoiAn = DISHES.find((d) => d.id === "banh-mi-thap-cam-hoi-an")!;

describe("useCartStore", () => {
  beforeEach(() => {
    memoryStorage.clear();
    useCartStore.setState({ carts: {} });
  });

  it("creates two independent Carts when adding Dishes from two Restaurants", () => {
    const status1 = useCartStore.getState().add(phoTaiChin);
    const status2 = useCartStore.getState().add(comTamSuon);
    const status3 = useCartStore.getState().add(phoTaiChin);

    expect(status1).toBe("added");
    expect(status2).toBe("added");
    expect(status3).toBe("added");

    const state = useCartStore.getState();
    expect(selectCartLines(phoTaiChin.restaurantId)(state)).toEqual([
      {
        dishId: "pho-bo-tai-chin",
        name: "Phở Bò Tái Chín",
        price: 55000,
        imageUrl: "/images/dishes/pho-bo-tai-chin.webp",
        quantity: 2,
      },
    ]);
    expect(selectCartLines(comTamSuon.restaurantId)(state)).toEqual([
      {
        dishId: "com-tam-suon-bi-cha",
        name: "Cơm Tấm Sườn Bì Chả",
        price: 60000,
        imageUrl: "/images/dishes/com-tam-suon-bi-cha.webp",
        quantity: 1,
      },
    ]);
    expect(selectNonEmptyCarts(state)).toHaveLength(2);
  });

  it("returns a stable frozen empty array from selectCartLines when a Cart is absent", () => {
    const state = useCartStore.getState();
    const first = selectCartLines("pho-gia-truyen-bat-dan")(state);
    const second = selectCartLines("com-tam-sai-gon-xua")(state);

    expect(first).toEqual([]);
    expect(first).toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("decreases quantity above 1, removes the line at quantity 1, and deletes an emptied Cart", () => {
    const { add, decrease } = useCartStore.getState();
    add(phoTaiChin);
    add(phoTaiChin);
    add(phoDacBiet);

    // Decrease phoTaiChin from 2 -> 1: line remains with quantity 1
    decrease(phoTaiChin.restaurantId, phoTaiChin.id);
    expect(
      selectCartLines(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toEqual([
      expect.objectContaining({ dishId: phoTaiChin.id, quantity: 1 }),
      expect.objectContaining({ dishId: phoDacBiet.id, quantity: 1 }),
    ]);

    // Decrease phoTaiChin at 1: removes phoTaiChin line, phoDacBiet remains
    decrease(phoTaiChin.restaurantId, phoTaiChin.id);
    expect(
      selectCartLines(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toEqual([expect.objectContaining({ dishId: phoDacBiet.id, quantity: 1 })]);

    // Decrease phoDacBiet at 1: removes last line and deletes the Cart key altogether
    decrease(phoDacBiet.restaurantId, phoDacBiet.id);
    const finalState = useCartStore.getState();
    expect(finalState.carts).toEqual({});
    expect(phoDacBiet.restaurantId in finalState.carts).toBe(false);
    expect(selectNonEmptyCarts(finalState)).toEqual([]);
    expect(selectCartLines(phoDacBiet.restaurantId)(finalState)).toEqual([]);
  });

  it("removes a single line via remove and deletes the Cart when the last line is removed", () => {
    const { add, remove } = useCartStore.getState();
    add(phoTaiChin);
    add(phoDacBiet);
    add(comTamSuon);

    remove(phoTaiChin.restaurantId, phoTaiChin.id);
    expect(
      selectCartLines(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toEqual([expect.objectContaining({ dishId: phoDacBiet.id, quantity: 1 })]);

    remove(phoDacBiet.restaurantId, phoDacBiet.id);
    const stateAfterLastRemoved = useCartStore.getState();
    expect(phoDacBiet.restaurantId in stateAfterLastRemoved.carts).toBe(false);
    expect(selectNonEmptyCarts(stateAfterLastRemoved)).toEqual([
      {
        restaurantId: comTamSuon.restaurantId,
        lines: [expect.objectContaining({ dishId: comTamSuon.id, quantity: 1 })],
      },
    ]);
  });

  it("caps quantity at 20 per Dish for both add and increase and returns 'capped'", () => {
    expect(MAX_QUANTITY_PER_DISH).toBe(20);

    const { add, increase } = useCartStore.getState();

    for (let i = 1; i <= 19; i += 1) {
      expect(add(phoTaiChin)).toBe("added");
    }
    expect(
      selectCartQuantity(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toBe(19);

    // 20th unit via increase succeeds with "added"
    expect(increase(phoTaiChin.restaurantId, phoTaiChin.id)).toBe("added");
    expect(
      selectCartQuantity(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toBe(20);

    // 21st attempt via add or increase is blocked and returns "capped"
    expect(add(phoTaiChin)).toBe("capped");
    expect(increase(phoTaiChin.restaurantId, phoTaiChin.id)).toBe("capped");
    expect(
      selectCartQuantity(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toBe(20);

    // Calling increase on an unknown line or unknown Restaurant returns "capped" without mutating state
    expect(increase(phoTaiChin.restaurantId, "unknown-dish")).toBe("capped");
    expect(increase("unknown-restaurant", phoTaiChin.id)).toBe("capped");
    expect(
      selectCartQuantity(phoTaiChin.restaurantId)(useCartStore.getState()),
    ).toBe(20);
  });

  it("computes per-Cart subtotal, per-Cart quantity, and total quantity across several Carts", () => {
    const { add } = useCartStore.getState();
    // Restaurant 1 (Phở Bát Đàn): 2 × 55.000 + 1 × 75.000 = 185.000, qty = 3
    add(phoTaiChin);
    add(phoTaiChin);
    add(phoDacBiet);

    // Restaurant 2 (Cơm Tấm Sài Gòn Xưa): 3 × 60.000 = 180.000, qty = 3
    add(comTamSuon);
    add(comTamSuon);
    add(comTamSuon);

    // Restaurant 3 (Bánh Mì Hội An): 1 × 35.000 = 35.000, qty = 1
    add(banhMiHoiAn);

    const state = useCartStore.getState();

    expect(selectCartSubtotal("pho-gia-truyen-bat-dan")(state)).toBe(185000);
    expect(selectCartQuantity("pho-gia-truyen-bat-dan")(state)).toBe(3);

    expect(selectCartSubtotal("com-tam-sai-gon-xua")(state)).toBe(180000);
    expect(selectCartQuantity("com-tam-sai-gon-xua")(state)).toBe(3);

    expect(selectCartSubtotal("banh-mi-hoi-an-pho-co")(state)).toBe(35000);
    expect(selectCartQuantity("banh-mi-hoi-an-pho-co")(state)).toBe(1);

    expect(selectCartSubtotal("unknown-restaurant")(state)).toBe(0);
    expect(selectCartQuantity("unknown-restaurant")(state)).toBe(0);

    expect(selectTotalQuantity(state)).toBe(7);
  });

  it("clears only the targeted Restaurant Cart and leaves other Carts untouched", () => {
    const { add, clearCart } = useCartStore.getState();
    add(phoTaiChin);
    add(comTamSuon);
    add(banhMiHoiAn);

    clearCart(phoTaiChin.restaurantId);

    const state = useCartStore.getState();
    expect(phoTaiChin.restaurantId in state.carts).toBe(false);
    expect(selectCartLines(phoTaiChin.restaurantId)(state)).toEqual([]);
    expect(selectCartLines(comTamSuon.restaurantId)(state)).toHaveLength(1);
    expect(selectCartLines(banhMiHoiAn.restaurantId)(state)).toHaveLength(1);
    expect(selectTotalQuantity(state)).toBe(2);
  });

  it("persists under CART_STORAGE_KEY with version 1 and only carts state", () => {
    expect(CART_STORAGE_KEY).toBe("fd-carts-v1");
    useCartStore.getState().add(phoTaiChin);

    const raw = memoryStorage.getItem(CART_STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(Object.keys(parsed.state)).toEqual(["carts"]);
    expect(parsed.state.carts[phoTaiChin.restaurantId]).toEqual([
      {
        dishId: phoTaiChin.id,
        name: phoTaiChin.name,
        price: phoTaiChin.price,
        imageUrl: phoTaiChin.imageUrl,
        quantity: 1,
      },
    ]);
  });

  it("drops stale Dishes, mismatched-Restaurant lines, non-positive quantities, and emptied Carts on rehydrate", async () => {
    memoryStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          carts: {
            [phoTaiChin.restaurantId]: [
              {
                dishId: phoTaiChin.id,
                name: phoTaiChin.name,
                price: phoTaiChin.price,
                imageUrl: phoTaiChin.imageUrl,
                quantity: 2,
              },
              {
                dishId: "deleted-dish-id",
                name: "Món Đã Xóa",
                price: 40000,
                imageUrl: "/images/dishes/deleted.webp",
                quantity: 1,
              },
              {
                // Belongs to com-tam-sai-gon-xua, not pho-gia-truyen-bat-dan
                dishId: comTamSuon.id,
                name: comTamSuon.name,
                price: comTamSuon.price,
                imageUrl: comTamSuon.imageUrl,
                quantity: 1,
              },
              {
                dishId: phoDacBiet.id,
                name: phoDacBiet.name,
                price: phoDacBiet.price,
                imageUrl: phoDacBiet.imageUrl,
                quantity: 0,
              },
            ],
            [comTamSuon.restaurantId]: [
              {
                dishId: "another-removed-dish",
                name: "Món Không Còn",
                price: 50000,
                imageUrl: "/images/dishes/none.webp",
                quantity: 3,
              },
            ],
          },
        },
      }),
    );

    await useCartStore.persist.rehydrate();

    const state = useCartStore.getState();
    expect(selectCartLines(phoTaiChin.restaurantId)(state)).toEqual([
      {
        dishId: phoTaiChin.id,
        name: phoTaiChin.name,
        price: phoTaiChin.price,
        imageUrl: phoTaiChin.imageUrl,
        quantity: 2,
      },
    ]);
    // comTamSuon's Cart had only an invalid dish, so the empty Cart must be dropped
    expect(comTamSuon.restaurantId in state.carts).toBe(false);
    expect(selectNonEmptyCarts(state)).toEqual([
      {
        restaurantId: phoTaiChin.restaurantId,
        lines: [
          {
            dishId: phoTaiChin.id,
            name: phoTaiChin.name,
            price: phoTaiChin.price,
            imageUrl: phoTaiChin.imageUrl,
            quantity: 2,
          },
        ],
      },
    ]);
  });

  it("guards against malformed persisted data on rehydrate", async () => {
    useCartStore.getState().add(phoTaiChin);

    memoryStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          carts: "not-an-object",
        },
      }),
    );

    await useCartStore.persist.rehydrate();

    const state = useCartStore.getState();
    expect(state.carts).toEqual({});
    expect(selectTotalQuantity(state)).toBe(0);
  });
});
