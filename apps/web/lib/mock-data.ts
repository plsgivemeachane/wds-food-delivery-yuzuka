import type { Dish, Restaurant } from "./types";

export const RESTAURANTS: readonly Restaurant[] = [
  {
    id: "pho-gia-truyen-bat-dan",
    name: "Phở Gia Truyền Bát Đàn",
    imageUrl: "/images/restaurants/pho-gia-truyen-bat-dan.webp",
    address: "49 Bát Đàn, Quận Hoàn Kiếm",
    cuisine: "Phở & Bún nước",
    rating: 4.9,
    deliveryMinutes: 25,
  },
  {
    id: "com-tam-sai-gon-xua",
    name: "Cơm Tấm Sài Gòn Xưa",
    imageUrl: "/images/restaurants/com-tam-sai-gon-xua.webp",
    address: "112 Nguyễn Tri Phương, Quận 5",
    cuisine: "Cơm tấm nướng than",
    rating: 4.8,
    deliveryMinutes: 30,
  },
  {
    id: "banh-mi-hoi-an-pho-co",
    name: "Bánh Mì Hội An Phố Cổ",
    imageUrl: "/images/restaurants/banh-mi-hoi-an-pho-co.webp",
    address: "28 Trần Phú, Quận 1",
    cuisine: "Bánh mì & Ăn vặt",
    rating: 4.7,
    deliveryMinutes: 20,
  },
];

export const DISHES: readonly Dish[] = [
  {
    id: "pho-bo-tai-chin",
    restaurantId: "pho-gia-truyen-bat-dan",
    name: "Phở Bò Tái Chín",
    description:
      "Nước dùng ninh xương bò suốt 12 giờ, bánh phở mềm dai kèm thịt bò tái chín thơm lừng.",
    price: 55000,
    imageUrl: "/images/dishes/pho-bo-tai-chin.webp",
  },
  {
    id: "pho-bo-tai-nam-gau",
    restaurantId: "pho-gia-truyen-bat-dan",
    name: "Phở Bò Tái Nạm Gầu",
    description:
      "Thịt bò tái mềm ngọt kết hợp nạm giòn và gầu béo ngậy trong tô nước phở trong vắt.",
    price: 65000,
    imageUrl: "/images/dishes/pho-bo-tai-nam-gau.webp",
  },
  {
    id: "pho-bo-dac-biet",
    restaurantId: "pho-gia-truyen-bat-dan",
    name: "Phở Bò Đặc Biệt Bát Đàn",
    description:
      "Đầy đủ tái, chín, nạm, gầu và bò viên thủ công ăn kèm hành hoa và rau thơm phố cổ.",
    price: 75000,
    imageUrl: "/images/dishes/pho-bo-dac-biet.webp",
  },
  {
    id: "pho-ga-ta-xe-phay",
    restaurantId: "pho-gia-truyen-bat-dan",
    name: "Phở Gà Ta Xé Phay",
    description:
      "Thịt gà ta da giòn vàng ươm, rắc lá chanh thái chỉ cùng nước dùng thanh ngọt tự nhiên.",
    price: 50000,
    imageUrl: "/images/dishes/pho-ga-ta-xe-phay.webp",
  },
  {
    id: "quay-gion-trung-chan",
    restaurantId: "pho-gia-truyen-bat-dan",
    name: "Quẩy Giòn & Trứng Chần",
    description:
      "Combo quẩy nóng giòn rụm chấm nước phở kèm hai quả trứng gà ta chần lòng đào béo bùi.",
    price: 25000,
    imageUrl: "/images/dishes/quay-gion-trung-chan.webp",
  },
  {
    id: "com-tam-suon-bi-cha",
    restaurantId: "com-tam-sai-gon-xua",
    name: "Cơm Tấm Sườn Bì Chả",
    description:
      "Đĩa cơm tấm truyền thống gồm sườn cốt lết nướng than, bì thính giòn và chả trứng hấp.",
    price: 60000,
    imageUrl: "/images/dishes/com-tam-suon-bi-cha.webp",
  },
  {
    id: "com-tam-suon-nuong-mat-ong",
    restaurantId: "com-tam-sai-gon-xua",
    name: "Cơm Tấm Sườn Nướng Mật Ong",
    description:
      "Miếng sườn cốt lết dày ướp mật ong rừng nướng than hồng, rưới mỡ hành và tóp mỡ giòn.",
    price: 50000,
    imageUrl: "/images/dishes/com-tam-suon-nuong-mat-ong.webp",
  },
  {
    id: "com-tam-ga-nuong-sa-ot",
    restaurantId: "com-tam-sai-gon-xua",
    name: "Cơm Tấm Đùi Gà Nướng Sả Ớt",
    description:
      "Đùi gà góc tư ướp sả ớt thơm cay, da nướng giòn rụm ăn kèm đồ chua và nước mắm kẹo.",
    price: 55000,
    imageUrl: "/images/dishes/com-tam-ga-nuong-sa-ot.webp",
  },
  {
    id: "com-tam-ba-roi-quay-gion",
    restaurantId: "com-tam-sai-gon-xua",
    name: "Cơm Tấm Ba Rọi Quay Giòn",
    description:
      "Thịt ba rọi heo quay da nổ giòn tan, thịt mềm mọng nước dùng kèm dưa leo và cà chua.",
    price: 58000,
    imageUrl: "/images/dishes/com-tam-ba-roi-quay-gion.webp",
  },
  {
    id: "canh-kho-qua-nhoi-thit",
    restaurantId: "com-tam-sai-gon-xua",
    name: "Canh Khổ Qua Nhồi Thịt",
    description:
      "Khổ qua tươi hầm mềm nhồi thịt heo bằm và mộc nhĩ, nước canh thanh mát giải nhiệt.",
    price: 25000,
    imageUrl: "/images/dishes/canh-kho-qua-nhoi-thit.webp",
  },
  {
    id: "banh-mi-thap-cam-hoi-an",
    restaurantId: "banh-mi-hoi-an-pho-co",
    name: "Bánh Mì Thập Cẩm Hội An",
    description:
      "Ổ bánh mì giòn rụm kẹp pate gan, thịt xá xíu, chả lụa, đu đủ chua ngọt và nước sốt đặc trưng.",
    price: 35000,
    imageUrl: "/images/dishes/banh-mi-thap-cam-hoi-an.webp",
  },
  {
    id: "banh-mi-heo-quay-da-gion",
    restaurantId: "banh-mi-hoi-an-pho-co",
    name: "Bánh Mì Heo Quay Da Giòn",
    description:
      "Thịt heo quay da giòn rụm hòa quyện cùng nước sốt ngũ vị đậm đà, dưa góp và rau răm.",
    price: 38000,
    imageUrl: "/images/dishes/banh-mi-heo-quay-da-gion.webp",
  },
  {
    id: "banh-mi-ga-xe-bo-toi",
    restaurantId: "banh-mi-hoi-an-pho-co",
    name: "Bánh Mì Gà Xé Bơ Tỏi",
    description:
      "Thịt gà xé sợi rim đậm vị kết hợp sốt bơ trứng gà béo ngậy, hành phi và ngò rí thơm lừng.",
    price: 32000,
    imageUrl: "/images/dishes/banh-mi-ga-xe-bo-toi.webp",
  },
  {
    id: "banh-mi-xiu-mai-trung-muoi",
    restaurantId: "banh-mi-hoi-an-pho-co",
    name: "Bánh Mì Xíu Mại Trứng Muối",
    description:
      "Viên xíu mại thịt heo bọc trứng muối bùi béo sốt cà chua sánh mịn, ăn kèm bánh mì nóng.",
    price: 40000,
    imageUrl: "/images/dishes/banh-mi-xiu-mai-trung-muoi.webp",
  },
  {
    id: "ca-phe-sua-da-pho-co",
    restaurantId: "banh-mi-hoi-an-pho-co",
    name: "Cà Phê Sữa Đá Phố Cổ",
    description:
      "Cà phê phin rang mộc đậm đà pha cùng sữa đặc ngọt dịu, đánh bông thơm lừng mát lạnh.",
    price: 25000,
    imageUrl: "/images/dishes/ca-phe-sua-da-pho-co.webp",
  },
];

export const restaurants: Restaurant[] = [...RESTAURANTS];
export const dishes: Dish[] = [...DISHES];

export function getAllRestaurants(): Restaurant[] {
  return [...RESTAURANTS];
}

export const getRestaurants = getAllRestaurants;

export function getRestaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((restaurant) => restaurant.id === id);
}

export function getAllDishes(): Dish[] {
  return [...DISHES];
}

export const getDishes = getAllDishes;

export function getDishesByRestaurant(restaurantId: string): Dish[] {
  return DISHES.filter((dish) => dish.restaurantId === restaurantId);
}

export const getDishesByRestaurantId = getDishesByRestaurant;

export function getDishById(id: string): Dish | undefined {
  return DISHES.find((dish) => dish.id === id);
}
