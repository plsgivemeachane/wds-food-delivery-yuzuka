# Food Delivery

A web app where people browse Restaurants, choose Dishes, and place delivery orders.

## Language

**Restaurant**:
A place that offers Dishes for delivery.
_Avoid_: Store, shop, vendor, merchant

**Dish**:
One food item that a Restaurant offers, with a name, a price, and an image. Every Dish belongs to exactly one Restaurant.
_Avoid_: MenuItem, Food, Product, Item

**Cart**:
The Dishes, with quantities, that a Customer has chosen from one Restaurant and not yet ordered. There is at most one Cart per Restaurant, and Carts for different Restaurants exist side by side.
_Avoid_: Basket, bag

**Order**:
A Cart that a Customer has submitted with delivery details. An Order belongs to exactly one Restaurant and never changes back into a Cart.
_Avoid_: Purchase, checkout, transaction

**Order Code**:
The short code that identifies an Order to the Customer, such as `FD-7K3Q9P`.
_Avoid_: Order ID, order number, mã đơn (in code)

**Customer**:
The person who builds Carts and places Orders.
_Avoid_: User, buyer, client

**Customer Profile**:
A Customer's personal details: full name, phone, address, and optionally email and avatar.
_Avoid_: User Profile, account
