# FinTrack Finance Dashboard

A modern finance dashboard built with Next.js App Router, Zustand, Tailwind CSS, Framer Motion, and Recharts.

It provides:
- A widget-based dashboard with drag-and-drop customization
- Transaction management with filtering, sorting, pagination, and exports
- Insights and monthly comparison analytics generated from local data

## Setup

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install and run
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Production build
```bash
npm run build
npm run start
```

### Lint
```bash
npm run lint
```

## Scripts

- `npm run dev` starts local development server
- `npm run build` creates production build
- `npm run start` serves production build
- `npm run lint` runs ESLint

## Project Structure

```text
app/
  layout.tsx                # Root layout + fonts + metadata
  page.tsx                  # Main shell (Sidebar, Navbar, tab content)
  globals.css               # Design tokens + global styles

components/
  layout/                   # Sidebar + top Navbar
  dashboard/                # Widget system + dashboard modules + month detail modal
  transactions/             # Filters, list, and add/edit modal
  insigths/                 # Insights tab components (folder name in repo is "insigths")
  ui/                       # Reusable shadcn-style primitives

store/
  useFinanceStore.js        # Global Zustand store + persisted UI preferences

data/
  categories.js             # Category metadata + fallback transaction dataset
  mockData.js               # Additional mock data reference

utils/
  helpers.js                # Filtering, sorting, totals, monthly data, exports, insights logic
```

## Overview of Approach

The project follows a simple, practical flow: build the shell first, keep state centralized, move all calculations into helpers, and then layer interactive features on top.

### 1) Build one clear app shell
We used `app/page.tsx` as the main shell and divided the product into three tabs:
- Dashboard
- Transactions
- Insights

This keeps navigation simple and makes each section easy to maintain independently.

### 2) Keep all shared state in one store
`store/useFinanceStore.js` is the single source of truth for:
- Transactions and loading status
- Active tab and selected month
- Widget visibility/layout/edit mode
- UI preferences like dark mode and role

State changes happen through store actions, which keeps component logic predictable.

### 3) Move business logic to utilities
All data calculations live in `utils/helpers.js` (totals, filtering, sorting, monthly grouping, insights, exports).  
This avoids duplicating logic across components and makes behavior easier to test or update later.

### 4) Build features in layers
After state + helpers were in place, features were added incrementally:
- Dashboard widgets and drag/drop customization
- Transaction CRUD + filters + pagination + export
- Insights and month-level drill-down modal

This layering helped keep each feature focused without breaking existing flows.

### 5) Polish UX after core behavior
Once functionality was stable, we added:
- Smooth motion transitions (Framer Motion)
- Responsive layout behavior
- A consistent visual system in `app/globals.css`

That order made sure the app worked first, then looked and felt polished.

## Detailed Overview Approach

This project is designed with a "separate concerns clearly" mindset. The idea is to avoid mixing UI rendering, data/state control, and financial calculations in the same place.

### End-to-end flow
1. `app/page.tsx` mounts the main app shell.
2. On load, `fetchAndSeed()` initializes transaction data in the store.
3. UI components subscribe to store state and render only what they need.
4. Charts/cards/insights call helper functions to derive analytics from the same transaction source.
5. User actions (search/filter/sort/add/edit/delete/reorder/export) trigger store actions and update derived UI instantly.

### Why this approach works well
- Predictable data flow: one store controls all important app state.
- Easier maintenance: financial logic is centralized in reusable helpers.
- Faster feature work: new widgets or analytics can reuse the same utility layer.
- Better UI consistency: all tabs consume a shared state model and formatting helpers.

### Architecture choices
- **State layer**: Zustand + persist middleware for UI preferences and dashboard layout memory.
- **Computation layer**: pure utility functions for totals, monthly grouping, spending categories, and insights.
- **Presentation layer**: modular components for dashboard, transactions, and insights, with Framer Motion transitions.
- **Interaction layer**: drag-and-drop with DnD Kit for dashboard customization.

### Practical implementation strategy used
- Built the global store first so all modules could rely on common actions/selectors.
- Added utilities for formatting + analytics before building charts.
- Implemented core transaction lifecycle (create/edit/delete/filter/sort/paginate).
- Implemented dashboard widget editing only after base widgets were stable.
- Added insights generation and monthly drill-down once data transformations were verified.

### Scalability readiness
Even though this project is local-data based right now, the structure is API-ready:
- Store actions can be swapped from fallback data to async API calls.
- Utility functions remain reusable regardless of data source.
- UI components already consume normalized transaction objects and derived outputs.

## Main Functions Used

Below are the primary functions used across the project, grouped by layer.

### 1) Store functions (`store/useFinanceStore.js`)

#### Data lifecycle
- `fetchTransactions()`  
  Loads fallback transactions and controls initial loading state.
- `fetchAndSeed()`  
  Wrapper used on app boot to seed data.
- `addTransaction(transaction)`  
  Adds a new transaction with generated `_id`.
- `updateTransaction(id, updates)`  
  Updates an existing transaction by id.
- `deleteTransaction(id)`  
  Removes a transaction by id.

#### Navigation and UI state
- `setActiveTab(tab)`  
  Switches between `dashboard`, `transactions`, and `insights`.
- `setRole(role)`  
  Switches role (`admin`/`viewer`) for write-access behavior.
- `toggleDarkMode()`  
  Toggles dark/light mode state.
- `toggleSidebar()` / `setMobileSidebarOpen(open)`  
  Controls sidebar visibility states.

#### Dashboard customization
- `toggleEditMode()`  
  Enables/disables drag-edit mode.
- `toggleWidget(key)`  
  Toggles a widget on/off.
- `addWidget(key)` / `removeWidget(key)`  
  Adds or removes widgets from layout.
- `reorderWidgets(fromIndex, toIndex)`  
  Reorders widgets after drag/drop.
- `moveWidgetToEnd(key)`  
  Appends widget to layout if not present.
- `resetLayout()`  
  Restores default dashboard widget configuration.
- `setCustomizerOpen(open)`  
  Opens/closes dashboard customizer panel.

#### Month detail and modal control
- `setSelectedMonth(month)`  
  Sets selected month for filtered view.
- `openMonthDetail(month)` / `closeMonthDetail()`  
  Controls month drill-down modal.
- `openModal(transaction?)` / `closeModal()`  
  Controls transaction create/edit modal.

#### Transaction list behavior
- `setFilters(filters)` / `resetFilters()`  
  Applies and clears filter state.
- `setSortConfig(key)`  
  Toggles sort direction and active sort key.
- `setCurrentPage(page)`  
  Updates pagination page.

#### Derived selectors in store
- `getFilteredTransactions()`  
  Returns filtered + sorted transactions.
- `getPaginatedTransactions()`  
  Returns current page subset.
- `getTotalPages()`  
  Calculates total pages from current filter set.

### 2) Utility functions (`utils/helpers.js`)

#### Formatting utilities
- `formatCurrency(amount)`  
  Formats value in USD.
- `formatShortCurrency(amount)`  
  Abbreviated currency format (`K`/`M`).
- `formatDate(dateStr)`  
  Human-friendly date text (`Today`, `Yesterday`, etc.).

#### Core analytics
- `calculateTotals(transactions)`  
  Returns `{ income, expenses, balance }`.
- `getSpendingByCategory(transactions)`  
  Aggregates and sorts expense totals by category.
- `getMonthlyData(transactions)`  
  Builds monthly grouped income/expense dataset.
- `getTopSpendingCategory(transactions, categories)`  
  Returns highest-spend category with percentage share.
- `generateInsights(transactions, categories)`  
  Produces insight cards from trends + totals.

#### Data transformation helpers
- `filterByMonth(transactions, selectedMonth)`  
  Narrows data to selected month.
- `filterTransactions(transactions, filters)`  
  Applies search/type/category/date filtering.
- `sortTransactions(transactions, sortConfig)`  
  Sorts by selected key and direction.
- `isAfter(dateA, dateB)`  
  Date comparison utility used in formatting logic.

#### Export utilities
- `exportToCSV(transactions)`  
  Downloads transactions as CSV.
- `exportToJSON(transactions)`  
  Downloads transactions as JSON.

### 3) Important UI-level functions

#### Dashboard drag logic (`components/dashboard/DashboardGrid.jsx`)
- `handleDragStart(event)`  
  Tracks currently dragged widget id.
- `handleDragEnd(event)`  
  Handles drop result and reorders/inserts widgets.
- `getPairForRow(widgetKey, layout)`  
  Computes how half-width widgets are paired in rows.

#### Transaction form logic (`components/transactions/TransactionModal.jsx`)
- `validate()`  
  Runs required-field and amount checks.
- `handleSubmit(e)`  
  Creates or updates transaction based on edit mode.

#### Interaction helpers in navbar and lists
- Transaction export buttons call `exportToCSV()` and `exportToJSON()`.
- Search input updates `setFilters()` in real-time.
- Sort headers call `setSortConfig()`.

## Feature Explanation

### 1) Dashboard
- Drag-and-drop widget ordering using `@dnd-kit` (`DashboardGrid`, `DraggableWidget`, `WidgetSidebar`).
- Add/remove/reset widget layout in edit mode.
- Widget set includes:
  - Balance overview with month bubbles and drill-down
  - Quick stats
  - Cash flow chart
  - Savings rate gauge
  - Balance trend chart
  - Recent activity
  - Category breakdown rings
  - Financial health score

### 2) Month drill-down
- Selecting a month from the hero widget sets `selectedMonth` and opens `MonthDetailModal`.
- Modal shows:
  - Income vs expenses comparison
  - Category donut breakdown
  - Daily spending bars
  - Top expense transactions

### 3) Transactions
- Full transaction list with:
  - Text search
  - Type/category/date-range filters
  - Sort by date/category/amount
  - Pagination
- Create/edit transaction modal with basic validation.
- Delete transaction action.
- Export all transactions as CSV or JSON from navbar.

### 4) Insights
- Monthly comparison chart for income/expenses/net.
- Smart insight cards generated from behavior patterns:
  - Top spending category
  - Month-over-month spending and income changes
  - Savings-rate evaluation
  - Daily average spend projection

### 5) UX and styling
- Dark mode toggle and responsive layout.
- Animated transitions across tabs/cards/modals via Framer Motion.
- Custom "zenith" glassmorphism theme system in `app/globals.css`.

## Data Model

Transactions follow this shape:

```ts
{
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: "YYYY-MM-DD";
}
```

Current data source is local fallback data (`FALLBACK_TRANSACTIONS`) loaded into client state.

## Notes and Limitations

- No backend/API integration yet (all data is local in client state).
- No server-side auth/authorization (role toggle is UI-level behavior).
- Build uses Google `next/font` (Geist); internet access may be required during build/font fetch.
