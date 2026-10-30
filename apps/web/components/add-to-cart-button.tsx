"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDishWithToast } from "@/lib/cart-toasts";
import type { Dish } from "@/lib/types";

export interface AddToCartButtonProps {
  dish: Dish;
}

/** Adds one of the Dish to its Restaurant's Cart and shows a toast. */
export function AddToCartButton({ dish }: AddToCartButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      aria-label={`Thêm ${dish.name} vào giỏ hàng`}
      onClick={() => addDishWithToast(dish)}
    >
      <Plus aria-hidden="true" />
      Thêm
    </Button>
  );
}
