export interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  cuisine: string;
  rating: number;
  deliveryMinutes: number;
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CartLine {
  dishId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface OrderRequestLine {
  dishId: string;
  quantity: number;
  price: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface OrderRequest {
  restaurantId: string;
  lines: OrderRequestLine[];
  customer: OrderCustomer;
}

export interface OrderSuccess {
  orderCode: string;
}

export type OrderRejectionReason =
  | "UNKNOWN_RESTAURANT"
  | "UNKNOWN_DISH"
  | "PRICE_CHANGED"
  | "INVALID_CUSTOMER"
  | "EMPTY_ORDER";

export interface OrderRejection {
  reason: OrderRejectionReason;
}
