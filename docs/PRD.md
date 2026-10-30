# Product Requirements Document (PRD): Food Delivery (Buổi 1–3)

## 1. Problem Statement

A hungry **Customer** wants to browse nearby **Restaurants**, select **Dishes** from one or more of them, and place a delivery **Order** from a phone or desktop browser without creating an account and without losing their selections if they reload or close the tab.

Most food delivery apps keep a single **Cart** and force the **Customer** to clear it before adding a **Dish** from another **Restaurant**. In addition, for the WDS Food Delivery course (Frontend sessions Buổi 1–3), the repository must provide a complete, mobile-first Vietnamese-language frontend inside a `pnpm` + Turborepo monorepo that passes the automated course checker, Vitest, Playwright, and Lighthouse performance thresholds.

## 2. Customers

- **Primary persona — Hungry Customer (mobile & desktop):**
  - Browses on a 375px mobile screen (one-handed) or a 1280px desktop screen.
  - Reads Vietnamese UI copy and expects prices formatted in integer Vietnamese đồng (e.g. `45.000 ₫`).
  - Wants to compare **Restaurants** at a glance and build **Carts** across multiple **Restaurants** side by side before deciding which **Cart** to submit as an **Order**.
  - Wants immediate visual feedback (toasts, badge updates, inline Vietnamese validation messages, and an **Order Code** confirmation) without signing in.

## 3. Scope (Buổi 1–3)

### 3.1 Browsing Restaurants and Dishes

- **Home (`/`)**: Lists 3 Vietnamese **Restaurants** from typed mock data (`id` slug, `name`, `imageUrl`, `address`, `cuisine`, `rating`, `deliveryMinutes`).
- **Restaurant page (`/restaurant/[id]`)**: Shows the **Restaurant** header and its 5 **Dishes** (`id`, `restaurantId`, `name`, `description`, `price` in integer VND, `imageUrl`). Unknown `id`s trigger Next.js `notFound()`.
- **App shell & route states**: Shared Header and Footer on every page, plus dedicated `loading`, `error` (with retry), and `not-found` boundaries.
- **Responsive & fast**: No horizontal overflow at 375px or 1280px; local compressed WebP images served through `next/image`; Lighthouse Home Performance ≥ 0.85.

### 3.2 Multi-Restaurant Carts

- **One Cart per Restaurant (ADR 0001)**: Adding a **Dish** places it into the **Cart** for that **Dish**'s **Restaurant**. **Carts** for different **Restaurants** exist side by side.
- **Line operations & invariants**:
  - Add a **Dish**, increase/decrease quantity (decreasing from `1` removes the line), remove a line, or clear one **Cart**.
  - Quantity per **Dish** is capped at `1..20` (exceeding `20` shows an explanatory toast).
  - An emptied **Cart** is removed immediately so empty **Carts** never exist.
  - Each action triggers a Sonner toast from the UI layer.
- **Persistence**: **Carts** are persisted to `localStorage` via Zustand `persist` under a versioned key. On hydration, any saved line whose **Dish** no longer exists in the catalog is quietly dropped.
- **Cart Badge & Cart Drawer**:
  - A floating badge displays the total quantity of **Dishes** across all non-empty **Carts**.
  - Tapping the badge opens the **Cart** Drawer (shadcn Sheet/Drawer), which renders one independent section per **Cart** (with **Restaurant** name, lines, quantity controls, subtotal, and a dedicated checkout link to `/checkout?restaurantId=<id>`) or an empty state when no **Carts** exist.

### 3.3 Checkout, Validation, and Order Placement

- **Single-Cart checkout (`/checkout?restaurantId=<id>`)**:
  - Displays the selected **Restaurant**, the **Dishes** and quantities in that **Cart**, and the **Cart** subtotal.
  - If `restaurantId` is missing, unknown, or refers to an empty **Cart**, redirects the **Customer** to Home with a toast.
- **Delivery details & validation (Zod + React Hook Form)**:
  - `fullName`: trimmed, 2–50 characters, Vietnamese letters and spaces.
  - `phone`: Vietnamese mobile format `^0[35789]\d{8}$` (e.g. `0901234567`).
  - `address`: trimmed, 10–200 characters.
  - `note`: optional, up to 200 characters.
  - Each invalid field displays a single clear Vietnamese error message directly underneath.
- **Customer Profile schema**:
  - Reuses the shared `fullName`, `phone`, and `address` rules and adds optional `email` and optional `avatarUrl` validation with Vietnamese error messages (schema-only in Buổi 1–3).
- **Order submission (`POST /api/orders` via MSW — ADR 0003)**:
  - Submitting disables the button and shows a loading spinner (`isSubmitting`).
  - The MSW handler re-validates the **Restaurant**, **Dishes**, and current catalog prices against the mock data, then returns `201` with a generated **Order Code** (`FD-` followed by 6 unambiguous uppercase alphanumeric characters, e.g. `FD-7K3Q9P`) or a `4xx` rejection reason (`UNKNOWN_RESTAURANT`, `UNKNOWN_DISH`, `PRICE_CHANGED`, `INVALID_CUSTOMER`, `EMPTY_ORDER`) mapped to Vietnamese UI copy.
  - On success, the page transitions in place to a confirmation view showing the **Order Code**, and clears **only** the submitted **Restaurant**'s **Cart** while leaving other **Carts** intact. Reloading the confirmation view returns the **Customer** to Home.

### 3.4 Infrastructure & Quality Gates

- `pnpm` workspaces + Turborepo monorepo (`apps/web`, `apps/backend` placeholder) per ADR 0002.
- Docker Compose starting `web` (production Next.js build) and `postgres` (ready for Buổi 4).
- Automated tests: Vitest (validation schemas, **Cart** store actions/selectors, and `POST /api/orders` HTTP contract via `msw/node`) and Playwright end-to-end specs at 375px and 1280px.

## 4. Out of Scope (Buổi 1–3)

- Login, authentication, and accounts.
- A **Customer Profile** page or persisting **Customer Profile** data (only the Zod validation schema is in scope).
- Search, category filtering, or sorting of **Restaurants** and **Dishes**.
- Online payment, delivery fees, promo discounts, or taxes.
- **Order** history, live **Order** tracking, or an `/orders` route (**Orders** are not persisted in Buổi 1–3).
- International `+84` phone number formatting.
- Real backend endpoints, database schemas, and migrations in `apps/backend` (deferred to Buổi 4; PostgreSQL only starts in Docker Compose).
- Admin or **Restaurant**-owner management portals.
- Multi-language support / i18n libraries (UI copy is Vietnamese; code and documentation are English).
- Component-level React Testing Library tests (covered by Playwright browser tests and Vitest unit/contract seams).
