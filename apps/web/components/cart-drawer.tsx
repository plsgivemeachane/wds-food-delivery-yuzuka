"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { CartBadge } from "@/components/cart-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCartSections } from "@/lib/cart-sections";
import { useCartStore } from "@/lib/cart-store";
import {
  decreaseWithToast,
  increaseWithToast,
  removeWithToast,
} from "@/lib/cart-toasts";
import { formatVnd } from "@/lib/format-vnd";
import { useHydrated } from "@/lib/use-hydrated";

export interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Cart Drawer: displays one section per non-empty Cart.
 * Each section lists the Restaurant name, Dish lines with + / − / remove controls,
 * the section subtotal (no grand total), and a checkout link to `/checkout?restaurantId=<id>`.
 * Shows an empty state with a link back to browsing when there are no Carts.
 */
export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const hydrated = useHydrated();
  const carts = useCartStore((state) => state.carts);

  const sections = React.useMemo(() => {
    if (!hydrated) return [];
    return getCartSections(carts);
  }, [hydrated, carts]);

  const isEmpty = sections.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="cart-drawer"
        className="flex h-full w-full max-w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-4 py-4 sm:px-6">
          <SheetTitle className="text-lg font-bold">Giỏ hàng</SheetTitle>
          <SheetDescription className="sr-only">
            Danh sách món ăn theo từng nhà hàng trong giỏ hàng
          </SheetDescription>
        </SheetHeader>

        {isEmpty ? (
          <div
            data-testid="cart-empty-state"
            className="flex flex-1 flex-col items-center justify-center p-6 text-center"
          >
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-8" aria-hidden="true" />
            </div>
            <p className="mb-1 text-base font-semibold text-foreground">
              Giỏ hàng trống
            </p>
            <p className="mb-6 max-w-[240px] text-sm text-muted-foreground">
              Bạn chưa chọn món nào. Khám phá các món ngon từ các quán ăn ngay!
            </p>
            <Link
              href="/"
              data-testid="cart-empty-browse-link"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Khám phá quán ăn
            </Link>
          </div>
        ) : (
          <div
            data-testid="cart-drawer-sections"
            className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
          >
            {sections.map((section) => (
              <section
                key={section.restaurantId}
                data-testid={`cart-section-${section.restaurantId}`}
                aria-label={`Giỏ hàng ${section.restaurantName}`}
                className="rounded-lg border bg-card p-4 shadow-xs"
              >
                <div className="mb-3 flex items-center justify-between border-b pb-2">
                  <h3
                    data-testid={`cart-restaurant-name-${section.restaurantId}`}
                    className="font-semibold text-foreground truncate"
                  >
                    {section.restaurantName}
                  </h3>
                </div>

                <ul role="list" className="divide-y">
                  {section.lines.map((line) => (
                    <li
                      key={line.dishId}
                      data-testid={`cart-dish-${line.dishId}`}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {line.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatVnd(line.price)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Giảm số lượng ${line.name}`}
                          data-testid={`cart-decrease-${line.dishId}`}
                          onClick={() =>
                            decreaseWithToast(section.restaurantId, line.dishId)
                          }
                          className="inline-flex size-7 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>

                        <span
                          data-testid={`cart-quantity-${line.dishId}`}
                          className="w-6 text-center text-sm font-medium tabular-nums"
                        >
                          {line.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Tăng số lượng ${line.name}`}
                          data-testid={`cart-increase-${line.dishId}`}
                          onClick={() =>
                            increaseWithToast(section.restaurantId, line.dishId)
                          }
                          className="inline-flex size-7 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          aria-label={`Xoá ${line.name} khỏi giỏ hàng`}
                          data-testid={`cart-remove-${line.dishId}`}
                          onClick={() =>
                            removeWithToast(section.restaurantId, line.dishId)
                          }
                          className="ml-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-dashed pt-3 text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span
                    data-testid={`cart-section-subtotal-${section.restaurantId}`}
                    className="font-semibold text-foreground"
                  >
                    {formatVnd(section.subtotal)}
                  </span>
                </div>

                <div className="mt-3">
                  <Link
                    href={`/checkout?restaurantId=${section.restaurantId}`}
                    data-testid={`cart-checkout-link-${section.restaurantId}`}
                    onClick={() => onOpenChange(false)}
                    className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Đặt hàng
                  </Link>
                </div>
              </section>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Client wrapper component mounted in RootLayout.
 * Owns the open state for CartDrawer and renders the floating CartBadge.
 */
export function CartDrawerWrapper() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <CartBadge onClick={() => setOpen(true)} />
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
