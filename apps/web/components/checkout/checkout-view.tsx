"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validateCheckoutSession } from "@/lib/checkout";
import {
  selectCartLines,
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart-store";
import { ensureOrderWorkerReady } from "@/lib/msw-client";
import { buildOrderRequest, placeOrder } from "@/lib/order";
import { getRestaurantById } from "@/lib/mock-data";
import type { CheckoutInput } from "@/lib/schemas";
import { useHydrated } from "@/lib/use-hydrated";

export type CheckoutViewMode = "form" | "confirmation";

export interface CheckoutViewProps {
  initialRestaurantId?: string;
}

export function CheckoutView({ initialRestaurantId }: CheckoutViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();
  const initialCheckDone = useRef(false);

  const clearCart = useCartStore((state) => state.clearCart);

  const effectiveRestaurantId =
    initialRestaurantId ?? (searchParams.get("restaurantId") || undefined);

  const restaurant = effectiveRestaurantId
    ? getRestaurantById(effectiveRestaurantId)
    : undefined;

  const cartLines = useCartStore(
    selectCartLines(effectiveRestaurantId ?? ""),
  );
  const subtotal = useCartStore(
    selectCartSubtotal(effectiveRestaurantId ?? ""),
  );

  // State to switch between form and confirmation view
  const [view, setView] = useState<CheckoutViewMode>("form");
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  // Lazily start the MSW browser service worker on checkout view mount
  useEffect(() => {
    let active = true;
    ensureOrderWorkerReady().then(() => {
      if (active) {
        setIsWorkerReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Initial hydrated check: missing, unknown, or empty cart -> redirect to / with toast
  // Ref guard guarantees this check runs exactly once on initial hydrated load.
  // When #14 clears the cart on order placement, this guard prevents redirecting away.
  useEffect(() => {
    if (!isHydrated) return;
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    const result = validateCheckoutSession(
      effectiveRestaurantId,
      useCartStore.getState().carts,
    );

    if (!result.valid) {
      toast.error(result.message);
      router.replace("/");
    }
  }, [isHydrated, effectiveRestaurantId, router]);

  // Named onSubmit handler for order submission:
  // Submits to POST /api/orders MSW endpoint, shows spinner during submission (isSubmitting),
  // clears submitted Restaurant Cart via clearCart(restaurant.id), and switches in place to confirmation.
  const onSubmit = async (values: CheckoutInput): Promise<void> => {
    if (!restaurant) return;

    // Await worker readiness if still starting
    await ensureOrderWorkerReady();

    const orderRequest = buildOrderRequest(
      restaurant.id,
      cartLines,
      values,
    );

    const result = await placeOrder(orderRequest);

    if (result.success) {
      setOrderCode(result.orderCode);
      setView("confirmation");
      clearCart(restaurant.id);
    } else {
      toast.error(result.errorMessage);
    }
  };

  // While hydrating or if redirecting before navigation completes, render an accessible loading placeholder.
  if (!isHydrated || !restaurant || (cartLines.length === 0 && view === "form")) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div
          data-testid="checkout-loading-skeleton"
          className="animate-pulse space-y-6"
        >
          <div className="h-6 w-40 rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-md bg-muted" />
            <div className="h-4 w-96 rounded-md bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="h-96 rounded-xl bg-muted lg:col-span-7" />
            <div className="h-72 rounded-xl bg-muted lg:col-span-5" />
          </div>
        </div>
      </div>
    );
  }

  // Confirmation view showing simulated Order Code (FD-XXXXXX)
  if (view === "confirmation" && orderCode) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <Card data-testid="order-confirmation" className="p-8">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Đặt hàng thành công!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cảm ơn bạn đã đặt món tại <strong>{restaurant.name}</strong>.
          </p>
          <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mã đơn hàng
            </p>
            <p
              data-testid="order-code"
              className="mt-1 font-mono text-2xl font-extrabold tracking-widest text-primary"
            >
              {orderCode}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link href="/">Quay về trang chủ</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Back to menu link */}
      <div className="mb-6">
        <Link
          href={`/restaurant/${restaurant.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Quay lại thực đơn {restaurant.name}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Thanh toán đơn hàng
        </h1>
        <p className="text-sm text-muted-foreground">
          Vui lòng kiểm tra lại món ăn và điền thông tin giao hàng để quán chuẩn bị món nhanh chóng.
        </p>
      </div>

      {/* Responsive two-column grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Form on mobile first / left on desktop */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg font-bold">
                Thông tin giao hàng
              </CardTitle>
              <CardDescription>
                Điền chính xác địa chỉ và số điện thoại người nhận để quán giao món nóng hổi.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CheckoutForm onSubmit={onSubmit} isReady={isWorkerReady} />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary on right on desktop */}
        <div className="lg:col-span-5">
          <CheckoutSummary
            restaurant={restaurant}
            lines={cartLines}
            subtotal={subtotal}
          />
        </div>
      </div>
    </div>
  );
}
