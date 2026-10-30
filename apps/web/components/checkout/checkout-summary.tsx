import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatVnd } from "@/lib/format-vnd";
import type { CartLine, Restaurant } from "@/lib/types";

export interface CheckoutSummaryProps {
  restaurant: Restaurant;
  lines: CartLine[];
  subtotal: number;
}

export function CheckoutSummary({
  restaurant,
  lines,
  subtotal,
}: CheckoutSummaryProps) {
  const totalCount = lines.reduce((acc, line) => acc + line.quantity, 0);

  return (
    <Card data-testid="checkout-summary" className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-bold">Đơn hàng của bạn</CardTitle>
          <span
            data-testid="checkout-restaurant-badge"
            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            {restaurant.cuisine}
          </span>
        </div>
        <CardDescription
          data-testid="checkout-restaurant-name"
          className="text-sm font-medium text-foreground"
        >
          Nhà hàng: {restaurant.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <ul
          data-testid="checkout-dish-list"
          className="divide-y divide-border"
          role="list"
        >
          {lines.map((line) => {
            const lineTotal = line.price * line.quantity;
            return (
              <li
                key={line.dishId}
                data-testid={`checkout-line-${line.dishId}`}
                className="flex items-center justify-between gap-3 px-6 py-3.5 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {line.imageUrl ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <p
                      data-testid="checkout-dish-name"
                      className="truncate font-medium text-foreground"
                    >
                      {line.name}
                    </p>
                    <p
                      data-testid="checkout-dish-quantity"
                      className="text-xs text-muted-foreground"
                    >
                      Số lượng:{" "}
                      <span className="font-semibold text-foreground">
                        {line.quantity}
                      </span>{" "}
                      × {formatVnd(line.price)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    data-testid="checkout-dish-total"
                    className="font-semibold text-foreground"
                  >
                    {formatVnd(lineTotal)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 p-6">
        <div className="flex w-full items-center justify-between text-base font-bold">
          <span>Tạm tính ({totalCount} món)</span>
          <span
            data-testid="checkout-subtotal"
            className="text-lg text-primary"
          >
            {formatVnd(subtotal)}
          </span>
        </div>
        <p className="w-full text-left text-xs text-muted-foreground">
          * Đơn giá đã bao gồm thuế và phí đóng gói theo từng món của nhà hàng.
        </p>
      </CardFooter>
    </Card>
  );
}
