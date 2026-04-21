Backend Feature Checklist

 A checklist of what still needs to be built on the backend. Items are grouped by domain. The frontend already has these pages/screens built; they're simply not connected to any real API yet.

---

### 🔐 Authentication & User Management

- [ ] **User Registration endpoint** — `POST /api/auth/register` — accepts username, email, password, role; stores a hashed password; returns a JWT or session token. The frontend has a full Sign Up page; there is no backend endpoint for it.
- [ ] **Login endpoint** — `POST /api/auth/login` — validates credentials, returns a JWT. The LoginPage exists on the frontend but currently does nothing with a real API.
- [ ] **Logout / token invalidation** — invalidate or blacklist the token server-side.
- [ ] **Password change endpoint** — `PUT /api/users/{id}/password` — the Profile → Security tab already has the change-password form; needs a real endpoint.
- [ ] **"Forgot Password" flow** — `POST /api/auth/forgot-password` + `POST /api/auth/reset-password` — the `ForgetPass` component exists on the frontend with no backend counterpart.
- [ ] **Password hashing** — add `spring-security-crypto` or Spring Security and hash all stored passwords (currently stored as plain strings).
- [ ] **JWT / Session security layer** — Spring Security filter chain, `OncePerRequestFilter` for token validation, and proper 401/403 responses. Nothing in the codebase enforces authentication on any endpoint.
- [ ] **Role-based access control (RBAC)** — restrict endpoints by role (`BUSINESS_OWNER`, `ADMIN`, `SUPPORT_STAFF`, `PARTNER_*`). Currently `WebConfig.java` opens `/**` to everyone.
- [ ] **Get current user profile** — `GET /api/users/me` — the Profile page needs to load real user data.
- [ ] **Update user profile** — `PUT /api/users/me` — the Account tab in Profile has a save button with no API call behind it.

---

### 📦 Product Catalog

- [ ] **List all products** — `GET /api/products` — the Catalog page pulls from a local JSON file (`mockdata/product.json`). It needs to pull from the database.
- [ ] **Get single product by ID** — `GET /api/products/{id}`
- [ ] **Create product (Admin only)** — `POST /api/products` — the Admin Products page has an "Add Product" button but no real endpoint.
- [ ] **Update product (Admin only)** — `PUT /api/products/{id}`
- [ ] **Delete product (Admin only)** — `DELETE /api/products/{id}`
- [ ] **Filter/search products** — `GET /api/products?category=&inStock=` — the Catalog page has a category filter and search bar; filtering currently happens client-side on static data.
- [ ] **ProductService and ProductController** — neither exists yet. The `ProductRepository` is defined but nothing sits on top of it.

---

### 🛒 Orders

- [ ] **Place an order** — `POST /api/orders` — the full Cart → Checkout → Review flow exists on the frontend. When the user clicks "Confirm Order", nothing is sent to the backend.
- [ ] **Get orders for current user** — `GET /api/orders/me` — the Profile Order History tab and the Track page read from `mockdata/Orders.json`.
- [ ] **Get all orders (Admin only)** — `GET /api/orders`
- [ ] **Get single order by ID** — `GET /api/orders/{id}`
- [ ] **Update order status (Admin only)** — `PUT /api/orders/{id}/status`
- [ ] **Cancel an order** — `PUT /api/orders/{id}/cancel`
- [ ] **OrderService and OrderController** — the `OrderRepository` exists with several queries defined, but no service or controller is wired up.

---

### 🚚 Shipment / Order Tracking

- [ ] **Get shipment by order ID** — `GET /api/shipments/order/{orderId}` — the Track page currently generates fake tracking numbers from mock data. It needs real shipment records.
- [ ] **Update shipment status (Admin/Partner only)** — `PUT /api/shipments/{id}/status`
- [ ] **Assign shipping partner to shipment** — `PUT /api/shipments/{id}/assign-partner`
- [ ] **ShipmentService and ShipmentController** — `ShipmentRepository` is defined but unused.

---

### 💳 Payment

- [ ] **Save payment result to database** — the Paymob payment flow (`PaymobService`, `PaymentController`) exists and is the most complete part of the backend, but the `processCallback` method needs to actually write a `Payment` record to the `payments` table when Paymob confirms success. Currently the callback handler has no DB write logic.
- [ ] **Get payments for an order** — `GET /api/orders/{id}/payments`
- [ ] **`PaymentRepository` is defined** but never injected into any service. Wire it into `PaymobService` (or a dedicated `PaymentService`) so that transaction results are persisted.

---

### 🗂️ Admin Panel APIs

The entire admin frontend (Dashboard, Orders, Products, Customers, Analytics, Insights) currently runs completely on `mockdata/` JSON files and hardcoded numbers. None of it is real. All of the following need backend counterparts:

- [ ] **Admin dashboard stats** — `GET /api/admin/stats` — total revenue, total orders, active customers, product count.
- [ ] **Admin list customers (all users)** — `GET /api/admin/users`
- [ ] **Admin get single customer** — `GET /api/admin/users/{id}`
- [ ] **Admin delete / deactivate user** — `DELETE /api/admin/users/{id}`
- [ ] **Admin analytics data** — `GET /api/admin/analytics` — revenue over time, orders over time, top products. Used by the Analytics and Insights pages.

---

### 🤝 Partner Management

- [ ] **List packaging partners** — `GET /api/partners/packaging`
- [ ] **List shipping partners** — `GET /api/partners/shipping`
- [ ] **Register a new partner** — `POST /api/partners` — the database model supports both partner types but there's no way to add them via API.
- [ ] **Assign packaging partner to a packaging item** — `PUT /api/packagings/{id}/assign-partner`

---

### 🎨 Packaging & Design

- [ ] **List packagings (catalog-style)** — `GET /api/packagings`
- [ ] **Create / update / delete packaging** — full CRUD for packaging configurations.
- [ ] **Packaging quote calculation** — `POST /api/packagings/quote` — the `PackagingService` interface defines `calculateQuote()` but the implementation just returns `"$0.00"`. Actual pricing logic needs to be built.
- [ ] **List designs** — `GET /api/designs`
- [ ] **Create / upload a design** — `POST /api/designs` — currently `Design.java` stores file paths (`logoFile`, `artworkFile`) but there's no file upload endpoint or storage integration.

---

### 🎫 Support / Ticket System

- [ ] **Submit a support ticket** — `POST /api/support/tickets` — the Support page has a full Contact Us form and a Report Issue form that submit locally and show a success screen, but nothing reaches the server.
- [ ] **Get tickets for current user** — `GET /api/support/tickets/me`
- [ ] **Get all tickets (Admin/Support Staff only)** — `GET /api/support/tickets`
- [ ] **Update ticket status** — `PUT /api/support/tickets/{id}/status`
- [ ] **Support ticket entity and repository** — no `SupportTicket` model or repository exists yet. This domain is entirely missing from the backend.

---

### ⚙️ Infrastructure & Cross-Cutting Concerns

- [ ] **Add Spring Security dependency to `pom.xml`** — no security starter is included yet.
- [ ] **Add JWT library** (`jjwt` or Spring Security OAuth2 resource server) to `pom.xml`.
- [ ] **Global exception handler** — `@ControllerAdvice` with `@ExceptionHandler` to return consistent error responses instead of raw Spring error pages.
- [ ] **Input validation responses** — `@Valid` is imported on the payment endpoint but there's no global handler to format `MethodArgumentNotValidException` errors nicely.
- [ ] **Pagination on list endpoints** — use Spring Data's `Pageable` so large result sets don't load everything at once.
- [ ] **Environment variable security for DB credentials** — `application.properties` currently contains a plain-text password and username. This should come from environment variables or a secret manager.
- [ ] **CORS configuration hardening** — `WebConfig.java` allows `*` headers from `localhost:3000`. This needs to be tightened before production.
- [ ] **Write actual unit and integration tests** — the `test/` directory is currently empty.
- [ ] **API documentation (Swagger/OpenAPI)** — add `springdoc-openapi` to generate interactive docs for the team.

