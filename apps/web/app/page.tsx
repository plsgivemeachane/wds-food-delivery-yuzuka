import { Utensils } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant-card";
import { Button } from "@/components/ui/button";
import { RESTAURANTS } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="rounded-2xl border bg-gradient-to-br from-orange-50 via-amber-50/60 to-background p-6 sm:p-10">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Utensils className="size-3.5" aria-hidden="true" />
            Giao nhanh tận cửa trong 30 phút
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Món ngon chuẩn vị Việt, giao nóng hổi đến tận bàn ăn
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Chọn món từ những quán ăn địa phương được yêu thích nhất. Thực đơn
            rõ ràng, giỏ hàng riêng theo từng quán, đặt đơn nhanh gọn không cần
            đăng nhập.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <a href="#nha-hang-noi-bat">Khám phá quán ngon</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#uu-diem-dich-vu">Tìm hiểu cách đặt món</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="nha-hang-noi-bat" className="mt-10 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Quán ngon nổi bật hôm nay
          </h2>
          <p className="text-sm text-muted-foreground">
            Các quán ăn tiêu biểu phục vụ món Việt truyền thống được đặt nhiều
            nhất trong ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {RESTAURANTS.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              priority={index === 0}
            />
          ))}
        </div>
      </section>

      <section
        id="uu-diem-dich-vu"
        className="mt-12 grid grid-cols-1 gap-4 rounded-xl border bg-muted/30 p-6 sm:grid-cols-3"
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            1. Chọn quán yêu thích
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Duyệt danh sách nhà hàng tuyển chọn với giá niêm yết rõ ràng bằng
            đồng Việt Nam.
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            2. Thêm món vào giỏ riêng
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Mỗi nhà hàng có một giỏ hàng độc lập giúp món ăn luôn được giao
            nóng và đúng hẹn.
          </p>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            3. Xác nhận đơn tức thì
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Điền thông tin nhận hàng và nhận ngay mã đơn xác nhận chỉ sau vài
            giây.
          </p>
        </div>
      </section>
    </div>
  );
}
