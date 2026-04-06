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

Below are the primary functions used across the project, presented in tabular form.

### 1) Store functions (`store/useFinanceStore.js`)

| Area | Function | Purpose |
|---|---|---|
| Data lifecycle | `fetchTransactions()` | Loads fallback transactions and controls initial loading state. |
| Data lifecycle | `fetchAndSeed()` | Bootstraps transaction data when the app loads. |
| Data lifecycle | `addTransaction(transaction)` | Adds a new transaction with generated `_id`. |
| Data lifecycle | `updateTransaction(id, updates)` | Updates an existing transaction by id. |
| Data lifecycle | `deleteTransaction(id)` | Removes a transaction by id. |
| Navigation/UI | `setActiveTab(tab)` | Switches between dashboard, transactions, and insights tabs. |
| Navigation/UI | `setRole(role)` | Switches role between `admin` and `viewer`. |
| Navigation/UI | `toggleDarkMode()` | Toggles dark/light mode state. |
| Navigation/UI | `toggleSidebar()` / `setMobileSidebarOpen(open)` | Controls desktop/mobile sidebar visibility. |
| Dashboard customization | `toggleEditMode()` | Enables or disables drag-edit mode. |
| Dashboard customization | `toggleWidget(key)` | Toggles widget visibility. |
| Dashboard customization | `addWidget(key)` / `removeWidget(key)` | Adds/removes widget from current layout. |
| Dashboard customization | `reorderWidgets(fromIndex, toIndex)` | Reorders widgets after drag/drop. |
| Dashboard customization | `moveWidgetToEnd(key)` | Appends widget to layout if missing. |
| Dashboard customization | `resetLayout()` | Restores default widget layout. |
| Dashboard customization | `setCustomizerOpen(open)` | Opens/closes widget customizer panel. |
| Month + modal control | `setSelectedMonth(month)` | Sets selected month filter for dashboards/charts. |
| Month + modal control | `openMonthDetail(month)` / `closeMonthDetail()` | Controls month drill-down modal. |
| Month + modal control | `openModal(transaction?)` / `closeModal()` | Controls transaction create/edit modal. |
| Transactions list | `setFilters(filters)` / `resetFilters()` | Applies and clears transaction filters. |
| Transactions list | `setSortConfig(key)` | Toggles sort key + direction. |
| Transactions list | `setCurrentPage(page)` | Updates current pagination page. |
| Derived selectors | `getFilteredTransactions()` | Returns filtered + sorted transactions. |
| Derived selectors | `getPaginatedTransactions()` | Returns current page subset. |
| Derived selectors | `getTotalPages()` | Calculates total pages from filtered results. |

### 2) Utility functions (`utils/helpers.js`)

| Area | Function | Purpose |
|---|---|---|
| Formatting | `formatCurrency(amount)` | Formats amount in USD currency style. |
| Formatting | `formatShortCurrency(amount)` | Short amount format (`K`, `M`) for compact UI. |
| Formatting | `formatDate(dateStr)` | Human-readable date labels like Today/Yesterday. |
| Core analytics | `calculateTotals(transactions)` | Returns `{ income, expenses, balance }`. |
| Core analytics | `getSpendingByCategory(transactions)` | Aggregates expenses by category (descending). |
| Core analytics | `getMonthlyData(transactions)` | Builds monthly grouped income/expense dataset. |
| Core analytics | `getTopSpendingCategory(transactions, categories)` | Finds highest-spend category and percentage share. |
| Core analytics | `generateInsights(transactions, categories)` | Creates insights from trends and spending behavior. |
| Transformations | `filterByMonth(transactions, selectedMonth)` | Restricts transactions to selected month. |
| Transformations | `filterTransactions(transactions, filters)` | Applies search/type/category/date-range filters. |
| Transformations | `sortTransactions(transactions, sortConfig)` | Sorts by date/category/amount with direction. |
| Transformations | `isAfter(dateA, dateB)` | Utility date comparator used in formatting logic. |
| Export | `exportToCSV(transactions)` | Downloads transactions as CSV file. |
| Export | `exportToJSON(transactions)` | Downloads transactions as JSON file. |

### 3) Important UI-level handlers

| File | Function/Handler | Purpose |
|---|---|---|
| `components/dashboard/DashboardGrid.jsx` | `handleDragStart(event)` | Captures currently dragged widget id. |
| `components/dashboard/DashboardGrid.jsx` | `handleDragEnd(event)` | Resolves drop behavior and widget reordering/insertion. |
| `components/dashboard/DashboardGrid.jsx` | `getPairForRow(widgetKey, layout)` | Pairs half-width widgets into row layout logic. |
| `components/transactions/TransactionModal.jsx` | `validate()` | Validates required fields and amount before submit. |
| `components/transactions/TransactionModal.jsx` | `handleSubmit(e)` | Creates or updates transaction based on edit mode. |
| `components/layout/Navbar.jsx` | Export handlers | Triggers `exportToCSV()` and `exportToJSON()` actions. |
| `components/layout/Navbar.jsx` + `components/transactions/TransactionFilters.jsx` | Search/filter handlers | Updates filter state in real-time from search inputs. |
| `components/transactions/TransactionList.jsx` | Sort header handlers | Calls `setSortConfig()` for date/category/amount sorting. |

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

## Assignment Feature Coverage

The following required features are implemented in this project:

| # | Feature | Status | Implementation |
|---|---|---|---|
| 1 | Dashboard Overview with Summary Cards | Implemented | `SummaryCards.jsx`, `HeroBalance.jsx`, `QuickStats.jsx` |
| 2 | Time Based Visualization | Implemented | `BalanceTrendChart.jsx`, `CashFlowChart.jsx`, `SpendingByDayChart.jsx`, `SavingsRateGauge.jsx` |
| 3 | Categorical Visualization | Implemented | `SpendingBreakdown.jsx`, `CategoryRings.jsx` |
| 4 | Transaction List with Details | Implemented | `TransactionList.jsx`, `TransactionModal.jsx`, `RecentActivity.jsx` |
| 5 | Transaction Filtering | Implemented | `TransactionFilters.jsx` - filters by search, type, category, date range |
| 6 | Transaction Sorting & Search | Implemented | `TransactionList.jsx` - sort by date/category/amount (asc/desc) + search bar in `Navbar.jsx` and `TransactionFilters.jsx` |
| 7 | Role Based UI (Viewer/Admin) | Implemented | `Navbar.jsx` + `useFinanceStore.js` - admin (full access) / viewer (read-only) with role switcher |
| 8 | Insights Section | Implemented | `SmartInsights.jsx`, `MonthlyComparison.jsx` - dedicated Insights tab |
| 9 | State Management (Zustand) | Implemented | `useFinanceStore.js` - Zustand store used by 20+ components |
| 10 | Responsive Design | Implemented | All components use responsive Tailwind classes (`sm:`, `md:`, `lg:`), mobile sidebar, and compact mobile layouts |

