# Owner Frontend Specification

Version: 1.0
Date: 2025-11-20
Author: automated-spec (pair-programmer)

Summary
-------
This document defines the Owner-facing frontend features, pages, components, API mappings, acceptance criteria, and UX notes for the owner dashboard and management flows in this project. It maps components to files under `frontend/src/` and lists the backend endpoints the UI will call.

Users & Roles
-------------
- Owner: a user who manages one or more businesses (restaurants). Has access to Owner Dashboard, Business management, Orders, Menu, and Promo codes.
- Assumes authentication is already available via `/api/auth` endpoints.

High-level features
-------------------
- Owner Dashboard (overview, quick stats)
- Business Management (create, view, edit business details)
- Order Management (list new orders, view details, change status)
- Menu / Item Editor (CRUD for menu items)
- Promo Code Management (create, list, delete)
- Role-based navigation (NavBar shows Owner links when user is owner)

Pages & Primary Components
--------------------------
- `OwnerPage.jsx` (new): top-level owner dashboard, quick stats, links to sub-pages.
- `BusinessEditor.jsx` (new): form to create/edit business details (name, type, address, hours, categories, image).
- `OwnerOrders.jsx` (new): list of orders for owner's business(es), filter by status, open detail view to accept/decline/complete.
- `MenuEditor.jsx` (new): list and editor for menu items (add/edit/delete), image upload support.
- `PromoManager.jsx` (new): list and create promo codes; show usage counts.
- `BusinessDetailPage.jsx` (existing): reuse/extend to show owner-editable view.
- `NavBar.jsx` (existing): add owner links and role-based visibility.

Suggested file locations (frontend)
----------------------------------
- `frontend/src/components/OwnerPage.jsx`
- `frontend/src/components/BusinessEditor.jsx`
- `frontend/src/components/OwnerOrders.jsx`
- `frontend/src/components/MenuEditor.jsx`
- `frontend/src/components/PromoManager.jsx`
- `frontend/src/styles/OwnerPage.css`
- `frontend/src/styles/MenuEditor.css`
- `frontend/src/styles/OwnerOrders.css`

Auth & Routing
---------------
- The frontend should rely on the existing auth flow (`/api/auth/login`, `/api/auth/signup`) to identify the owner user and their `user_type` or `business_id`.
- Add routes in `frontend/src/App.js` like:
  - `/owner` -> `OwnerPage`
  - `/owner/business/:id/edit` -> `BusinessEditor`
  - `/owner/orders` -> `OwnerOrders`
  - `/owner/menu` -> `MenuEditor`
  - `/owner/promos` -> `PromoManager`
- Update `NavBar.jsx` to show an "Owner" dropdown or item when the current user has `user_type === 'owner'` or role indicates ownership.

Backend API mappings (existing endpoints discovered)
-------------------------------------------------
These endpoints exist in the backend (`backend/routes/api.py` and blueprints). Paths below are the frontend's expected HTTP calls. Replace `/api` with configured base path if different.

- Authentication
  - POST `/api/auth/login` — login; returns user details
  - POST `/api/auth/signup` — create user (owner may pass `user_type: owner` and `business_id`)
  - GET `/api/auth/user/<user_id>` — get user details

- Businesses / Restaurants
  - GET `/api/businesses` — get list of businesses (general)
  - POST `/api/businesses` — add a business (create)
  - POST `/api/restaurants/save-from-places` — import multiple businesses from Places API
  - GET `/api/restaurants/get-all` — list restaurants
  - GET `/api/restaurants/<business_id>` — get business details
  - GET `/api/restaurants/<business_id>/items` — list items for business
  - NOTE: there is currently no PUT or DELETE for restaurants in `api.py`. If update/delete is required for owner workflows, backend endpoints should be added: PUT `/api/restaurants/<business_id>` and DELETE `/api/restaurants/<business_id>`.

- Items / Menu
  - GET `/api/items` — can pass `business_id` or `google_place_id` to filter
  - POST `/api/items` — create item (fields: `dish_name`, `image_url`, `food_type`, `ingredients`, etc.)
  - NOTE: There is no item update/delete endpoint in `api.py`. If owner needs edit/delete, add PUT `/api/items/<item_id>` and DELETE `/api/items/<item_id>`.

- Orders
  - POST `/api/orders/create` — create order (used by customers)
  - GET `/api/orders/<order_id>` — get a single order
  - GET `/api/orders/user/<user_id>` — list orders belonging to a user
  - NOTE: There is no endpoint to update order status (accept/complete). Backend change required: PATCH `/api/orders/<order_id>/status` or similar.

- Promo Codes
  - GET `/api/promo_codes` — list promo codes
  - POST `/api/promo_codes` — create promo codes

- Other (addresses, reviews)
  - GET `/api/addresses`, POST `/api/addresses`
  - GET `/api/reviews`, POST `/api/reviews`

Data shapes (examples)
----------------------
- Business detail (GET `/api/restaurants/<id>`)
  - { success: true, business: { id, name, type, location, ... } }
- Items (GET `/api/items?business_id=<id>`)
  - { count: n, items: [{ id, dish_name, image_url, food_type, price, ... }] }
- Orders (GET `/api/orders/<id>`)
  - { success: true, order: { id, userID, businessID, items: [...], total_amount, status, created_at } }

Owner UI flows & acceptance criteria
-----------------------------------
1) Owner Dashboard
   - Shows quick stats: number of active orders, pending orders, today's revenue (optional), number of active menu items, active promo codes.
   - Quick links to Manage Business, Menu, Orders, Promos.
   - Acceptance: Owner navigates to `/owner` and sees at least order count and link cards.

2) Business Management
   - Owner can view business details and edit core fields.
   - If backend lacks update endpoints, the UI should show a note and allow edits only when backend supports them.
   - Acceptance: Edit form validates required fields (name, type, address). On submit, frontend calls appropriate endpoint and shows success message.

3) Order Management
   - Owner sees list of orders for their business. Each order shows id, items summary, total, status, time.
   - Owner can open an order to change status to Accepted / Preparing / Completed / Declined (requires backend support).
   - Acceptance: Owner can see new orders appear after refresh and change status (or get a clear error if backend lacks endpoint).

4) Menu Editor
   - Owner can add an item (dish_name required), edit item fields, remove items.
   - Image upload: until a dedicated image upload endpoint exists, allow `image_url` input or client-side upload placeholder.
   - Acceptance: Adding an item calls POST `/api/items` with correct payload, and item shows in menu list on success.

5) Promo Codes
   - Owner can create a promo code with `name` and `description` (backing fields on backend).
   - Acceptance: Creating a promo shows it in the list (GET `/api/promo_codes`).

UX & Accessibility Notes
------------------------
- Use consistent structure to match existing UI (components under `frontend/src/components/`, styles under `frontend/src/styles/`).
- Mobile-first: ensure pages reflow properly; owner tasks are commonly done on tablet or desktop.
- Use ARIA attributes for critical controls (e.g., order status buttons) and ensure keyboard accessibility.
- Confirm color contrast for status badges (Pending, Accepted, Completed).

State Management & Props
------------------------
- Use existing `CartContext.jsx` for cart-based flows; create a separate `AuthContext` (if not present) or expand `CartContext` to provide `currentUser` and `userType`.
- Components should be controlled and accept props where possible:
  - `OwnerPage` — reads `currentUser`, fetches overview endpoints, no props required.
  - `OwnerOrders` — props: `businessId` (optional), internal state: `orders`, `filterStatus`, `isLoading`.
  - `MenuEditor` — props: `businessId`, internal: `items`, `editingItem`, `isSaving`.

Testing & QA
------------
- Unit tests for components: `OwnerPage`, `MenuEditor`, `OwnerOrders` using React Testing Library (`frontend/src/setupTests.js` already present).
- Integration tests: simulate owner flows (login → open /owner → create item) in CI if feasible.

Implementation notes & backend gaps
---------------------------------
- Backend currently exposes list and create endpoints for businesses, items, promo codes, and orders retrieval, but lacks update/delete for businesses, items, and order status updates. To provide full owner CRUD and order status management, add the following backend endpoints (suggested):
  - PUT `/api/restaurants/<business_id>` — update business
  - PUT `/api/items/<item_id>` — update item
  - DELETE `/api/items/<item_id>` — delete item
  - PATCH `/api/orders/<order_id>/status` — update order status
- If adding endpoints is not possible now, the UI should degrade gracefully: allow form edits locally, but show a message that changes require a backend update.

Acceptance checklist (developer)
--------------------------------
- [ ] `OwnerPage.jsx` created and route added.
- [ ] NavBar shows Owner links for owner users.
- [ ] `MenuEditor.jsx` supports add (POST `/api/items`) and displays created item.
- [ ] `OwnerOrders.jsx` lists orders for owner's business and shows details.
- [ ] `PromoManager.jsx` can create and list promo codes.
- [ ] Tests added for main owner components.

Next steps (recommended)
------------------------
1. Add `AuthContext` or expand current context to expose `currentUser` and `isOwner`.
2. Implement `OwnerPage` skeleton and add route in `App.js`.
3. Implement `MenuEditor` add-item flow (POST `/api/items`) — easiest to validate and useful.
4. Work with backend owner to add missing endpoints for update/delete and order status updates.
5. Add tests and styles.

Appendix: Quick API summary
--------------------------
- GET `/api/health`
- POST `/api/auth/login`, POST `/api/auth/signup`, GET `/api/auth/user/<id>`
- GET `/api/restaurants/get-all`, POST `/api/restaurants/save-from-places`, GET `/api/restaurants/<id>`, GET `/api/restaurants/<id>/items`
- GET `/api/items`, POST `/api/items`
- POST `/api/orders/create`, GET `/api/orders/<id>`, GET `/api/orders/user/<id>`
- GET `/api/promo_codes`, POST `/api/promo_codes`

If you want, I can:
- scaffold `OwnerPage.jsx` and `MenuEditor.jsx` now, or
- open GitHub issues for each checklist item, or
- add tests for the simplest flow (add item).

---
End of spec
