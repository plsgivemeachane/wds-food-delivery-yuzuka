import { Clock, MapPin, Star, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featuredRestaurants = [
  {
    id: "pho-gia-truyen-bat-dan",
    name: "Phở Gia Truyền Bát Đàn",
    cuisine: "Phở & Bún nước",
    rating: "4.9",
    deliveryTime: "20–30 phút",
    address: "49 Bát Đàn, Quận Hoàn Kiếm",
    description:
      "Nước dùng ninh xương bò suốt 12 giờ, bánh phở mềm dai kèm thịt bò tái chín thơm lừng.",
  },
  {
    id: "com-tam-sai-gon-xua",
    name: "Cơm Tấm Sài Gòn Xưa",
    cuisine: "Cơm tấm nướng than",
    rating: "4.8",
    deliveryTime: "25–35 phút",
    address: "112 Nguyễn Tri Phương, Quận 5",
    description:
      "Sườn cốt lết nướng mật ong vàng ươm, bì thính nhà làm, chả trứng hấp nóng hổi.",
  },
  {
    id: "banh-mi-hoi-an-pho-co",
    name: "Bánh Mì Hội An Phố Cổ",
    cuisine: "Bánh mì & Ăn vặt",
    rating: "4.7",
    deliveryTime: "15–25 phút",
    address: "28 Trần Phú, Quận 1",
    description:
      "Vỏ bánh giòn rụm, nhân pate gan béo ngậy, thịt xá xíu đậm đà cùng rau thơm tươi mát.",
  },
];

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
          {featuredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    {restaurant.cuisine}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="size-3.5 fill-current" aria-hidden="true" />
                    {restaurant.rating}
                  </span>
                </div>
                <CardTitle className="pt-2 text-lg">{restaurant.name}</CardTitle>
                <CardDescription>{restaurant.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>Thời gian giao dự kiến: {restaurant.deliveryTime}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  Xem thực đơn quán
                </Button>
              </CardFooter>
            </Card>
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
