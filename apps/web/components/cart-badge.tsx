"use client";

import { ShoppingCart } from "lucide-react";
import { selectTotalQuantity, useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export interface CartBadgeProps {
  /** Called when the badge is pressed; #12 wires this to open the Cart Drawer. */
  onClick?: () => void;
  className?: string;
}

/**
 * Floating Cart badge: total quantity of Dishes across all Carts.
 * The count is only rendered after hydration, because the Carts come from
 * LocalStorage and the server cannot know them.
 */
export function CartBadge({ onClick, className }: CartBadgeProps) {
  const hydrated = useHydrated();
  const totalQuantity = useCartStore(selectTotalQuantity);
  const count = hydrated ? totalQuantity : 0;

  return (
    <button
      type="button"
      data-testid="cart-badge"
      data-hydrated={hydrated ? "true" : "false"}
      aria-label={hydrated ? `Giỏ hàng (${count} món)` : "Giỏ hàng"}
      onClick={onClick}
      className={cn(
        "fixed right-4 bottom-4 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform outline-none hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-95 sm:right-6 sm:bottom-6",
        className,
      )}
    >
      <ShoppingCart className="size-6" aria-hidden="true" />
      {hydrated && count > 0 ? (
        <span
          data-testid="cart-badge-count"
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-foreground px-1.5 text-xs font-bold tabular-nums text-background"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
