import { ArrowLeft, Clock, MapPin, Star, Utensils } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DishCard } from "@/components/dish-card";
import {
  getDishesByRestaurant,
  getRestaurantById,
  RESTAURANTS,
} from "@/lib/mock-data";

interface RestaurantPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return RESTAURANTS.map((restaurant) => ({
    id: restaurant.id,
  }));
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { id } = await params;
  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return {
      title: "Không tìm thấy nhà hàng — Bếp Phố Giao Nhanh",
    };
  }

  return {
    title: `${restaurant.name} — Thực đơn & Đặt món | Bếp Phố Giao Nhanh`,
    description: `Thưởng thức thực đơn ${restaurant.cuisine} tại ${restaurant.name} (${restaurant.address}). Giao nhanh trong khoảng ${restaurant.deliveryMinutes} phút.`,
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { id } = await params;
  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  const dishes = getDishesByRestaurant(restaurant.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Quay lại danh sách nhà hàng</span>
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="relative aspect-[16/10] w-full bg-muted md:col-span-5 md:aspect-auto md:min-h-[260px]">
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center space-y-4 p-6 sm:p-8 md:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                <Utensils className="size-3.5" aria-hidden="true" />
                {restaurant.cuisine}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 font-semibold text-amber-700"
                aria-label={`Đánh giá ${restaurant.rating} trên 5`}
              >
                <Star
                  className="size-3.5 fill-amber-500 text-amber-500"
                  aria-hidden="true"
                />
                {restaurant.rating} / 5.0
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {restaurant.name}
            </h1>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>Địa chỉ: {restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Thời gian giao dự kiến: {restaurant.deliveryMinutes} phút
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="thuc-don-nha-hang" className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            id="thuc-don-nha-hang"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Thực đơn nhà hàng
          </h2>
          <p className="text-sm text-muted-foreground">
            Hiển thị {dishes.length} món ăn chính hãng từ bếp quán
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </section>
    </div>
  );
}
