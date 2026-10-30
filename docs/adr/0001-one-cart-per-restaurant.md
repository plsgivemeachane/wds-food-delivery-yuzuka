# One Cart per Restaurant

Most delivery apps keep a single Cart and ask the user to clear it before adding a Dish from another Restaurant. We keep a separate Cart for each Restaurant instead, so people can fill several Carts side by side without losing anything. Each checkout turns exactly one Cart into one order.

## Consequences

- The floating badge counts Dishes across all Carts. The Cart Drawer shows one section per non-empty Cart, each with its own subtotal and checkout button, and no grand total.
- `/checkout` takes the Cart to check out from `?restaurantId=`, because the course checker requires the page at exactly `app/checkout/page.tsx`.
- A successful order clears only the Cart it came from.
- The Buổi 4 schema must keep an order tied to a single Restaurant.
