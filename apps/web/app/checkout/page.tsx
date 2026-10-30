import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Thanh toán — Bếp Phố Giao Nhanh",
  description:
    "Xác nhận thực đơn và nhập thông tin giao hàng để đặt món giao nhanh tận nơi.",
};

interface CheckoutPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const resolvedParams = await searchParams;
  const rawId = resolvedParams.restaurantId;
  const restaurantId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        </div>
      }
    >
      <CheckoutView initialRestaurantId={restaurantId} />
    </Suspense>
  );
}
