import Image from "next/image";
import type * as React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatVnd } from "@/lib/format-vnd";
import type { Dish } from "@/lib/types";

export interface DishCardProps {
  dish: Dish;
  action?: React.ReactNode;
}

export function DishCard({ dish, action }: DishCardProps) {
  return (
    <Card
      data-testid={`dish-card-${dish.id}`}
      className="h-full justify-between overflow-hidden pt-0 transition-shadow hover:shadow-md"
    >
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            className="object-cover"
          />
        </div>

        <CardHeader className="pt-5">
          <CardTitle className="text-base leading-snug sm:text-lg">
            <h3>{dish.name}</h3>
          </CardTitle>
          <CardDescription className="pt-1 text-sm leading-relaxed">
            {dish.description}
          </CardDescription>
        </CardHeader>
      </div>

      <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t [.border-t]:pt-4">
        <span className="text-base font-bold tracking-tight text-primary sm:text-lg">
          {formatVnd(dish.price)}
        </span>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardFooter>
    </Card>
  );
}
