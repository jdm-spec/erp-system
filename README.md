# Enterprise Modular & Fully Customizable ERP System

Built with **pure Vanilla JavaScript (ES Modules)**, **Tailwind CSS**, and **Vite** — strictly zero frontend frameworks (No React, Vue, Angular, jQuery, or Alpine).

---

## 1. System Overview & Architecture

This platform is a 100% schema-driven enterprise management system built for high throughput, zero framework dependency lock-in, and runtime field/workflow customization.

### 1.1 Tech Stack

| Layer | Implementation |
|---|---|
| **Markup** | Semantic HTML5, accessible ARIA attributes, keyboard navigation |
| **Styling** | Tailwind CSS utility-first built via Vite & PostCSS (no runtime CDN) |
| **Logic** | Vanilla ES2022+ JavaScript (`import` / `export`) with typed event bus |
| **Routing** | Pure vanilla hash router (`#/finance/invoices`), route guards, lazy `import()` |
| **Data Layer** | Dual Adapter Pattern: In-browser IndexedDB/localStorage default + Swappable REST Adapter |
| **Security** | Strict CSP meta tag, zero unsanitized `innerHTML`, memory-isolated JWT storage |

---

## 2. Directory Structure

```
apps/frontend/ (or erp/)
├─ index.html                     # Semantic application mount & CSP policy
├─ vite.config.js                 # Vite bundler configuration
├─ tailwind.config.js             # Tailwind design tokens & dark-mode CSS variables
├─ postcss.config.js              # PostCSS plugins (Tailwind, Autoprefixer)
├─ .env.example                   # Safe public environment variable templates
├─ .gitignore                     # Ignores all .env files except .env.example
├─ src/
│  ├─ main.js                     # Bootstrap: wires schemas, layout shell, router, command palette
│  ├─ styles/main.css             # Tailwind base & print rules for enterprise invoices/statements
│  ├─ core/
│  │  ├─ router.js                # Vanilla hash router with auth, module & RBAC guards
│  │  ├─ store.js                 # Reactive pub/sub store for global state & dark mode
│  │  ├─ events.js                # Decoupled Pub/Sub event bus for cross-module flows
│  │  ├─ auth.js                  # Session lifecycle, idle auto-logout, in-memory tokens
│  │  ├─ rbac.js                  # RBAC permission matrix & field-level can() evaluator
│  │  ├─ config-engine.js         # Runtime schema customizer, versioning & overrides
│  │  ├─ form-engine.js           # Dynamic form builder, conditional fields & live formulas
│  │  ├─ table-engine.js          # Searchable, sortable, paginated data grids with CSV export
│  │  ├─ workflow-engine.js       # State machine: transitions, role gates, auto-actions
│  │  ├─ report-engine.js         # Groupings, aggregations (SUM/AVG/COUNT) & SVG charts
│  │  ├─ audit.js                 # Immutable, append-only audit trail logger
│  │  ├─ i18n.js                  # Multi-currency (INR ₹, USD $, EUR €), numbers, dates
│  │  ├─ validators.js            # Input validators (required, regex, min, max, email)
│  │  ├─ sanitize.js              # XSS defense helpers (escapeHTML, safe tag templates)
│  │  ├─ entity-view.js           # Universal schema-driven CRUD controller
│  │  └─ integration.js           # Cross-module business orchestrator
│  ├─ data/
│  │  ├─ adapter.js               # DataAdapter abstract interface
│  │  ├─ local-adapter.js         # Standalone IndexedDB/localStorage with rich seed records
│  │  ├─ rest-adapter.js          # Fetch-based REST adapter with Authorization headers
│  │  └─ index.js                 # Adapter selector driven by VITE_DATA_ADAPTER
│  ├─ components/
│  │  ├─ toast.js                 # Accessible global toast notifications
│  │  ├─ modal.js                 # Accessible modal dialog with focus trapping
│  │  ├─ topbar.js                # Header with breadcrumbs, branch switcher, dark toggle
│  │  ├─ sidebar.js               # Collapsible module navigation list
│  │  └─ command-palette.js       # Quick jump & global search modal (Ctrl + K)
│  ├─ config/
│  │  └─ defaults/index.js        # Default JSON schemas for all entities
│  └─ modules/
│     ├─ auth/                    # Login screen & quick demo profile switcher
│     ├─ dashboard/               # Executive overview KPIs and interactive SVG charts
│     ├─ admin/                   # Customization Studio, Roles & RBAC, Audit Trail, Settings
│     ├─ finance/                 # Invoices, Chart of Accounts, Journals, Statements
│     ├─ inventory/               # Items SKU master, Warehouses, FIFO valuation
│     ├─ procurement/             # Purchase Orders, Vendor Directory, 3-Way Matching
│     ├─ sales/                   # Sales Orders, Customer 360
│     ├─ crm/                     # Leads & Opportunities, Support Tickets with SLA
│     ├─ hrms/                    # Employee Master, Payroll with GL journal auto-post
│     ├─ manufacturing/           # Work Orders, Multi-level Bills of Materials (BOM)
│     ├─ scm/                     # Logistics Shipments, Demand Forecasting
│     ├─ projects/                # Capital Projects & Milestone Costing
│     ├─ quality/                 # Material Inspections & Defect Tracking
│     ├─ assets/                  # Fixed Asset Register & Preventive Maintenance
│     └─ bi/                      # Executive Intelligence & Ad-Hoc Report Builder
└─ README.md
```

---

## 3. All 12 Business Modules

1. **Finance & Accounting (`#/finance/invoices`)**
   - Chart of Accounts with double-entry general ledger
   - Balanced Journal Entries with Debit/Credit validation
   - Sales Invoices, Purchase Bills, Payment tracking
   - Real-time Balance Sheet and Profit & Loss (P&L) statements

2. **Inventory & Warehouses (`#/inventory/items`)**
   - Item SKU master catalog with units of measure
   - Multi-warehouse locations and bin tracking
   - Real-time inventory valuation under FIFO and Weighted Average

3. **Procurement & Purchasing (`#/procurement/orders`)**
   - Supplier / Vendor directory with ratings and GSTIN
   - Purchase requisition & Purchase Order approval workflow
   - Interactive Three-Way Matching (PO vs GRN vs Vendor Bill)

4. **Sales & Distribution (`#/sales/orders`)**
   - Quotation to Sales Order confirmation
   - Customer 360 view with credit limits and outstanding balances
   - Automated delivery scheduling and billing triggers

5. **CRM (`#/crm/leads`)**
   - Leads and Opportunities pipeline tracking
   - Customer support tickets with SLA resolution timers

6. **HRMS & Payroll (`#/hrms/employees`)**
   - Employee master records, departments, and leave balances
   - Monthly payroll processing with automated journal entry posting to Finance

7. **Manufacturing & Production (`#/manufacturing/work-orders`)**
   - Shop-floor Work Orders with target vs completed units
   - Multi-level Bills of Materials (BOM) explosion with batch sizes

8. **Supply Chain Management (`#/scm/shipments`)**
   - Carrier waybills, docket numbers, and transit ETA tracking
   - Demand forecasting engine with Simple Moving Average (SMA)

9. **Project Management (`#/projects/list`)**
   - Capex project budgeting, actual expenses incurred, and progress meters

10. **Quality Management (`#/quality/inspections`)**
    - Incoming goods inspection, in-process calibration, and defect audits

11. **Asset & Maintenance (`#/assets/register`)**
    - Fixed machinery asset register, historical cost, and net book value
    - Preventive maintenance schedules and service logs

12. **Business Intelligence & Reporting (`#/bi/dashboard`)**
    - Executive KPI cards and responsive SVG charts
    - Interactive Ad-Hoc Report Builder with custom dimensions and aggregations

---

## 4. Customization Engine (Zero Code)

Navigate to **Customization Studio (`#/admin/studio`)** to configure:

1. **Module Toggles:** Deactivate any business module; sidebar and routes update instantly.
2. **Custom Fields:** Add text, number, currency, date, select, or checkbox fields to any entity at runtime.
3. **Document Numbering:** Customize prefixes (`SO-`, `PO-`, `INV-`) and digit padding.
4. **Config Versioning:** Export full configuration as JSON, import presets, or reset to factory defaults.
5. **RBAC Security:** Inspect role permissions and assign privileges.

---

## 5. Cross-Module Integration Flows

Cross-module interactions communicate **strictly via the typed event bus (`events.js`) and data adapters**:

1. **Order-to-Cash (O2C):**
   `sales.order.confirmed` ➔ checks inventory stock ➔ if shortage, emits `inventory.stock.shortage` which auto-creates a Purchase Requisition ➔ dispatch creates draft invoice & shipping waybill ➔ invoice posting creates General Ledger entries.
2. **Procure-to-Pay (P2P):**
   `purchase_order.approved` ➔ `inventory.grn.received` increases physical stock ➔ 3-Way match correlates PO, GRN, and Vendor Bill.
3. **Payroll to Finance:**
   Approving monthly payroll in HRMS posts a balanced journal entry:
   - Debit: Staff Salaries & Wages (`#5030`)
   - Credit: Bank Current Account (`#1020`) & Statutory Deductions (`#2020`).
4. **Maintenance to Inventory:**
   Spare parts consumed during equipment maintenance reduce warehouse stock and capitalize maintenance costs.

---

## 6. Security Model & Defense-in-Depth

> [!IMPORTANT]
> **Client-Side Permission Notice**: In a client-side architecture, UI permission checks (`can(user, action, entity)`) and route guards are for **user convenience and interface guidance only**. A production backend must always independently enforce authentication, authorization tokens, business validations, and immutable audit logs on every request.

- **Environment Variables**: Only `VITE_`-prefixed variables reach the client bundle. Real secrets (database passwords, private keys) are never placed in frontend `.env` files.
- **XSS Prevention**: Zero unsanitized `innerHTML`. All string interpolations pass through `escapeHTML()`, `escapeAttr()`, or safe tagged templates in `sanitize.js`.
- **Token Storage**: Auth tokens are kept in memory (`auth.js`), preventing local storage token theft vulnerabilities.
- **Audit Logging**: All record creations, updates, deletions, and workflow state transitions are recorded into an append-only audit trail (`audit.js`).

---

## 7. Connecting a Real Backend (REST Adapter)

To connect a production REST backend:

1. Edit `.env` in `apps/frontend/`:
   ```bash
   VITE_DATA_ADAPTER=rest
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
2. The `RestAdapter` will immediately activate, transmitting standard REST requests (`GET`, `POST`, `PUT`, `DELETE`) with `Authorization: Bearer <token>` headers.

---

## 8. Installation & Verification

### Run Development Server
```bash
# In project root or apps/frontend
npm run dev --workspace=@erp/frontend
# or inside apps/frontend:
cd apps/frontend
npm run dev
```

### Production Build
```bash
npm run build --workspace=@erp/frontend
# or inside apps/frontend:
cd apps/frontend
npm run build
```

### Quick Keyboard Shortcuts
- `Ctrl + K` or `Cmd + K`: Open Global Command Palette & Navigation
- `Esc`: Close any open dialog or modal
