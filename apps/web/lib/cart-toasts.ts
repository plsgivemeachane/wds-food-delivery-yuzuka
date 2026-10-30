import { toast } from "sonner";
import {
  MAX_QUANTITY_PER_DISH,
  useCartStore,
  type CartActionStatus,
} from "./cart-store";
import type { CartLine, Dish } from "./types";

/**
 * UI-side wrappers around the Cart store actions that also fire the
 * Vietnamese Sonner toast for each action. The store itself stays free of
 * toasts; Client Components call these instead of the raw actions.
 */

const CAP_TOAST_ID = "cart-cap";

export const cartToastMessages = {
  added: (dishName: string) => `Đã thêm ${dishName} vào giỏ hàng`,
  increased: (dishName: string) => `Đã tăng số lượng ${dishName}`,
  decreased: (dishName: string) => `Đã giảm số lượng ${dishName}`,
  removed: (dishName: string) => `Đã xoá ${dishName} khỏi giỏ hàng`,
  capped: `Mỗi món tối đa ${MAX_QUANTITY_PER_DISH} phần`,
} as const;

function findLine(restaurantId: string, dishId: string): CartLine | undefined {
  return useCartStore
    .getState()
    .carts[restaurantId]?.find((line) => line.dishId === dishId);
}

function showCapToast() {
  toast.warning(cartToastMessages.capped, { id: CAP_TOAST_ID });
}

export function addDishWithToast(dish: Dish): CartActionStatus {
  const status = useCartStore.getState().add(dish);
  if (status === "capped") {
    showCapToast();
  } else {
    toast.success(cartToastMessages.added(dish.name));
  }
  return status;
}

export function increaseWithToast(
  restaurantId: string,
  dishId: string,
): CartActionStatus {
  const line = findLine(restaurantId, dishId);
  const status = useCartStore.getState().increase(restaurantId, dishId);
  if (status === "capped") {
    if (line) showCapToast();
  } else if (line) {
    toast.success(cartToastMessages.increased(line.name));
  }
  return status;
}

export function decreaseWithToast(restaurantId: string, dishId: string): void {
  const line = findLine(restaurantId, dishId);
  if (!line) return;

  useCartStore.getState().decrease(restaurantId, dishId);
  if (line.quantity <= 1) {
    toast.success(cartToastMessages.removed(line.name));
  } else {
    toast.success(cartToastMessages.decreased(line.name));
  }
}

export function removeWithToast(restaurantId: string, dishId: string): void {
  const line = findLine(restaurantId, dishId);
  if (!line) return;

  useCartStore.getState().remove(restaurantId, dishId);
  toast.success(cartToastMessages.removed(line.name));
}
