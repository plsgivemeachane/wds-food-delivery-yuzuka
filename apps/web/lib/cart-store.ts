import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getDishById } from "./mock-data";
import type { CartLine, Dish } from "./types";

export const MAX_QUANTITY_PER_DISH = 20;
export const CART_STORAGE_KEY = "fd-carts-v1";

export type CartActionStatus = "added" | "capped";

export interface CartState {
  carts: Record<string, CartLine[]>;
  add: (dish: Dish) => CartActionStatus;
  increase: (restaurantId: string, dishId: string) => CartActionStatus;
  decrease: (restaurantId: string, dishId: string) => void;
  remove: (restaurantId: string, dishId: string) => void;
  clearCart: (restaurantId: string) => void;
}

const EMPTY_LINES: CartLine[] = Object.freeze([]) as unknown as CartLine[];

function prunePersistedCarts(persistedState: unknown): Record<string, CartLine[]> {
  if (!persistedState || typeof persistedState !== "object" || Array.isArray(persistedState)) {
    return {};
  }

  const rawCarts = (persistedState as { carts?: unknown }).carts;
  if (!rawCarts || typeof rawCarts !== "object" || Array.isArray(rawCarts)) {
    return {};
  }

  const pruned: Record<string, CartLine[]> = {};

  for (const [restaurantId, rawLines] of Object.entries(rawCarts as Record<string, unknown>)) {
    if (!Array.isArray(rawLines)) {
      continue;
    }

    const validLines: CartLine[] = [];

    for (const rawLine of rawLines) {
      if (!rawLine || typeof rawLine !== "object") {
        continue;
      }

      const candidate = rawLine as Partial<CartLine>;
      if (typeof candidate.dishId !== "string") {
        continue;
      }

      const dish = getDishById(candidate.dishId);
      if (!dish || dish.restaurantId !== restaurantId) {
        continue;
      }

      if (
        typeof candidate.quantity !== "number" ||
        !Number.isFinite(candidate.quantity)
      ) {
        continue;
      }

      const normalizedQuantity = Math.min(
        Math.floor(candidate.quantity),
        MAX_QUANTITY_PER_DISH,
      );
      if (normalizedQuantity <= 0) {
        continue;
      }

      validLines.push({
        dishId: dish.id,
        name: typeof candidate.name === "string" ? candidate.name : dish.name,
        price:
          typeof candidate.price === "number" && Number.isFinite(candidate.price)
            ? candidate.price
            : dish.price,
        imageUrl:
          typeof candidate.imageUrl === "string" ? candidate.imageUrl : dish.imageUrl,
        quantity: normalizedQuantity,
      });
    }

    if (validLines.length > 0) {
      pruned[restaurantId] = validLines;
    }
  }

  return pruned;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},

      add: (dish: Dish): CartActionStatus => {
        const { restaurantId } = dish;
        const currentLines = get().carts[restaurantId] ?? EMPTY_LINES;
        const existingLine = currentLines.find((line) => line.dishId === dish.id);

        if (existingLine) {
          if (existingLine.quantity >= MAX_QUANTITY_PER_DISH) {
            return "capped";
          }

          set((state) => {
            const lines = state.carts[restaurantId] ?? EMPTY_LINES;
            return {
              carts: {
                ...state.carts,
                [restaurantId]: lines.map((line) =>
                  line.dishId === dish.id
                    ? { ...line, quantity: line.quantity + 1 }
                    : line,
                ),
              },
            };
          });
          return "added";
        }

        const nextLine: CartLine = {
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          imageUrl: dish.imageUrl,
          quantity: 1,
        };

        set((state) => {
          const lines = state.carts[restaurantId] ?? EMPTY_LINES;
          return {
            carts: {
              ...state.carts,
              [restaurantId]: [...lines, nextLine],
            },
          };
        });
        return "added";
      },

      increase: (restaurantId: string, dishId: string): CartActionStatus => {
        const currentLines = get().carts[restaurantId];
        if (!currentLines) {
          return "capped";
        }

        const existingLine = currentLines.find((line) => line.dishId === dishId);
        if (!existingLine || existingLine.quantity >= MAX_QUANTITY_PER_DISH) {
          return "capped";
        }

        set((state) => {
          const lines = state.carts[restaurantId];
          if (!lines) {
            return state;
          }

          return {
            carts: {
              ...state.carts,
              [restaurantId]: lines.map((line) =>
                line.dishId === dishId
                  ? { ...line, quantity: line.quantity + 1 }
                  : line,
              ),
            },
          };
        });
        return "added";
      },

      decrease: (restaurantId: string, dishId: string): void => {
        set((state) => {
          const lines = state.carts[restaurantId];
          if (!lines) {
            return state;
          }

          const existingLine = lines.find((line) => line.dishId === dishId);
          if (!existingLine) {
            return state;
          }

          if (existingLine.quantity <= 1) {
            const remainingLines = lines.filter((line) => line.dishId !== dishId);
            if (remainingLines.length === 0) {
              const { [restaurantId]: _, ...restCarts } = state.carts;
              return { carts: restCarts };
            }
            return {
              carts: {
                ...state.carts,
                [restaurantId]: remainingLines,
              },
            };
          }

          return {
            carts: {
              ...state.carts,
              [restaurantId]: lines.map((line) =>
                line.dishId === dishId
                  ? { ...line, quantity: line.quantity - 1 }
                  : line,
              ),
            },
          };
        });
      },

      remove: (restaurantId: string, dishId: string): void => {
        set((state) => {
          const lines = state.carts[restaurantId];
          if (!lines || !lines.some((line) => line.dishId === dishId)) {
            return state;
          }

          const remainingLines = lines.filter((line) => line.dishId !== dishId);
          if (remainingLines.length === 0) {
            const { [restaurantId]: _, ...restCarts } = state.carts;
            return { carts: restCarts };
          }

          return {
            carts: {
              ...state.carts,
              [restaurantId]: remainingLines,
            },
          };
        });
      },

      clearCart: (restaurantId: string): void => {
        set((state) => {
          if (!(restaurantId in state.carts)) {
            return state;
          }
          const { [restaurantId]: _, ...restCarts } = state.carts;
          return { carts: restCarts };
        });
      },
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ carts: s.carts }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        carts: prunePersistedCarts(persistedState),
      }),
    },
  ),
);

/**
 * Returns all non-empty Carts as `{ restaurantId, lines }` entries.
 * Because this selector allocates a new array on every call, UI callers should
 * wrap it in `useShallow` (from `zustand/react/shallow`) or derive from `s.carts`.
 */
export const selectNonEmptyCarts = (
  s: CartState,
): Array<{ restaurantId: string; lines: CartLine[] }> =>
  Object.entries(s.carts)
    .filter(([, lines]) => lines.length > 0)
    .map(([restaurantId, lines]) => ({ restaurantId, lines }));

export const selectCartLines =
  (restaurantId: string) =>
  (s: CartState): CartLine[] =>
    s.carts[restaurantId] ?? EMPTY_LINES;

export const selectCartSubtotal =
  (restaurantId: string) =>
  (s: CartState): number =>
    (s.carts[restaurantId] ?? EMPTY_LINES).reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );

export const selectCartQuantity =
  (restaurantId: string) =>
  (s: CartState): number =>
    (s.carts[restaurantId] ?? EMPTY_LINES).reduce(
      (sum, line) => sum + line.quantity,
      0,
    );

export const selectTotalQuantity = (s: CartState): number =>
  Object.values(s.carts).reduce(
    (total, lines) =>
      total + lines.reduce((sum, line) => sum + line.quantity, 0),
    0,
  );
