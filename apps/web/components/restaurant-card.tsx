import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Restaurant } from "@/lib/types";

export interface RestaurantCardProps {
  restaurant: Restaurant;
  priority?: boolean;
}

export function RestaurantCard({
  restaurant,
  priority = false,
}: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurant/${restaurant.id}`}
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card className="h-full justify-between overflow-hidden pt-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div>
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 384px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <CardHeader className="pt-5">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
                {restaurant.cuisine}
              </span>
              <span
                className="inline-flex items-center gap-1 font-semibold text-amber-700"
                aria-label={`Đánh giá ${restaurant.rating} trên 5`}
              >
                <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                {restaurant.rating}
              </span>
            </div>
            <CardTitle className="pt-2 text-lg leading-snug transition-colors group-hover:text-primary">
              <h3>{restaurant.name}</h3>
            </CardTitle>
          </CardHeader>

          <CardContent className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/80" aria-hidden="true" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0 text-primary/80" aria-hidden="true" />
              <span>Thời gian giao dự kiến: {restaurant.deliveryMinutes} phút</span>
            </div>
          </CardContent>
        </div>

        <CardFooter className="pt-2">
          <span className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <span>Xem thực đơn quán</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
