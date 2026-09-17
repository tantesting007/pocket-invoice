# Pocket Invoice App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Pocket Invoice demo front-end: an invoice list page and an invoice detail page with Print and Export PDF. All data comes from TypeScript mocks, and the code matches the curated Retask board.

**Architecture:** A Vite + React 19 SPA using a React Router data router. Pages read data only through `src/services/invoiceService.ts`, which reads from `src/mocks/`. Pure logic (money math, formatting, pagination, summary lines, PDF drawing) lives in `src/lib/`. UI is built from small components with CSS Modules.

**Tech Stack:** Vite 8, React 19, TypeScript 6 (template pin), React Router 8, jsPDF 4 + jspdf-autotable 5, Vitest 5 + jsdom + Testing Library, ESLint 10.

**Spec:** `docs/superpowers/specs/2026-09-17-pocket-invoice-app-design.md`

## Global Constraints

- Sender company is **NWEB Studio**, `120 Market Street, Suite 400`, `San Francisco, CA 94105`, `billing@nweb.example`.
- All mock emails use the `.example` domain. All amounts are USD.
- Brand colour `#7C3AED` (dark `#6528D7`, light `#F3EEFF`).
- **PI-1 seed:** `calculateTotal()` returns `subtotal + tax` and ignores `discount`. `src/lib/invoice.test.ts` contains the one failing test, "applies the discount to the total". No other test may assert a discounted total. Expected `npm test` result: **exactly 1 failing test**.
- Do not build PI-2 (empty state), PI-3 (overdue badge), PI-4 (customer search), PI-5 (date-fns), PI-9 or PI-10. No moment.js.
- Pages and components never import from `src/mocks/`.
- Code style follows the Vite template: no semicolons, single quotes, 2-space indent, named exports (except config files).
- Retask CLI is read-only for this work; always pass `--profile demo`.
- Tests run with `TZ=America/New_York`.

## Refinements to the spec (decided while planning)

- Added `components/Card.tsx`, `components/icons.tsx`, `styles/table.module.css` (shared table look) and `test/renderRoute.tsx` (route-level test helper).
- `lib/summary.ts` → `getSummaryLines(invoice)` builds the formatted summary shared by the UI and the PDF. The Discount line is shown only when `discount > 0`.
- `lib/format.ts` also exports `formatStatus(status)`, so the status labels live outside component files.
- `lib/pdf.ts` is split into `buildInvoicePdf()` (returns the jsPDF document, testable through `doc.output()`) and `exportInvoicePdf()` (builds the document and saves it). jsPDF methods are attached per instance, so tests replace `jsPDF` with a subclass to capture `save`.

## File Map

| File | Responsibility |
|------|----------------|
| `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `public/favicon.svg`, `.gitignore` | Tooling (from the `react-ts` template) |
| `src/main.tsx` | Mounts `<App/>` and imports global CSS |
| `src/App.tsx` | Browser router + `RouterProvider` |
| `src/routes.tsx` | Route objects shared by the app and the tests |
| `src/types/invoice.ts` | Domain types |
| `src/mocks/{index,company,customers,invoices}.ts` | All mock data |
| `src/services/invoiceService.ts` | Data access (`getInvoices`, `getInvoiceById`, `getCompany`) |
| `src/lib/invoice.ts` | Money math (PI-1 seed) |
| `src/lib/format.ts` | Currency / date / percent / status formatting |
| `src/lib/pagination.ts` | `paginate()` |
| `src/lib/summary.ts` | Formatted summary lines (UI + PDF) |
| `src/lib/pdf.ts` | `buildInvoicePdf`, `exportInvoicePdf` |
| `src/components/*` | `Layout`, `PageHeader`, `Button`, `Card`, `StatusChip`, `Pagination`, `InvoiceTable`, `InvoiceDocument`, `LineItemsTable`, `InvoiceSummary`, `icons` |
| `src/pages/*` | `InvoiceListPage`, `InvoiceDetailPage`, `NotFoundPage` |
| `src/styles/global.css`, `src/styles/table.module.css` | Tokens, base styles, print rules; shared table styles |
| `src/test/setup.ts`, `src/test/renderRoute.tsx` | Test setup and helper |
| `.github/workflows/ci.yml` | PI-7 CI |
| `CLAUDE.md`, `README.md` | Project docs and Retask notes |

---

### Task 1: Scaffold the project and tooling

**Files:**
- Create: `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `index.html`, `vite.config.ts`, `public/favicon.svg`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`, `src/test/setup.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `npm run dev|build|typecheck|lint|test|test:watch|preview`, and a global CSS class `.no-print` that hides elements when printing. CSS tokens: `--color-brand`, `--color-brand-dark`, `--color-brand-light`, `--color-text`, `--color-muted`, `--color-border`, `--color-surface`, `--color-surface-alt`, `--color-bg`, `--color-danger`, `--radius`, `--radius-sm`.

- [ ] **Step 1: Generate the template into the scratchpad**

```bash
TPL="$SCRATCHPAD/pocket-invoice-template"   # use the session scratchpad dir
rm -rf "$TPL" && npx -y create-vite@9.2.1 "$TPL" --template react-ts --eslint --no-immediate --no-interactive
```

- [ ] **Step 2: Copy the tooling files into the repo** (do not copy the template's `src/`, `README.md`, `public/icons.svg` or `.gitignore`)

```bash
cp "$TPL"/{package.json,tsconfig.json,tsconfig.app.json,tsconfig.node.json,eslint.config.js,index.html} .
```

- [ ] **Step 3: Set the package name and scripts** in `package.json`: set `"name": "pocket-invoice"` and replace `"scripts"` with:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "typecheck": "tsc -b",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "preview": "vite preview"
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
npm install react-router jspdf jspdf-autotable
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 5: Write `vite.config.ts`**

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // A time zone behind UTC catches ISO dates that shift by a day
    env: { TZ: 'America/New_York' },
    clearMocks: true,
    restoreMocks: true,
  },
})
```

- [ ] **Step 6: Write `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
```

- [ ] **Step 7: Replace `.gitignore`** with the template's list plus the brainstorm folder:

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Brainstorm companion mockups
.superpowers/
```

- [ ] **Step 8: Set the page title** in `index.html`: replace `<title>…</title>` with `<title>Pocket Invoice</title>`.

- [ ] **Step 9: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7C3AED"/><text x="16" y="21" fill="#fff" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">PI</text></svg>
```

- [ ] **Step 10: Write `src/styles/global.css`**

```css
:root {
  --color-brand: #7c3aed;
  --color-brand-dark: #6528d7;
  --color-brand-light: #f3eeff;
  --color-text: #1f2937;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-surface: #ffffff;
  --color-surface-alt: #fafafc;
  --color-bg: #f7f7fb;
  --color-danger: #b91c1c;
  --radius: 12px;
  --radius-sm: 8px;

  color: var(--color-text);
  background: var(--color-bg);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

h1,
h2,
h3,
p {
  margin: 0;
}

a {
  color: var(--color-brand);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@page {
  margin: 16mm;
}

@media print {
  :root {
    background: #fff;
  }

  .no-print {
    display: none !important;
  }
}
```

- [ ] **Step 11: Write `src/App.tsx`** (a placeholder; Task 5 replaces it)

```tsx
export function App() {
  return <h1>Pocket Invoice</h1>
}
```

- [ ] **Step 12: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 13: Verify the tooling**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all three succeed, and `dist/` is produced.

- [ ] **Step 14: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json eslint.config.js index.html vite.config.ts public src
git commit -m "chore: scaffold Vite React TypeScript app with Vitest"
```

---

### Task 2: Domain types and money math (with the PI-1 seed)

**Files:**
- Create: `src/types/invoice.ts`, `src/lib/invoice.ts`
- Test: `src/lib/invoice.test.ts`

**Interfaces:**
- Produces (types): `InvoiceStatus = 'draft' | 'sent' | 'paid'`; `Company { name; addressLines: string[]; email }`; `Customer { id; name; contact?; addressLines: string[]; email }`; `LineItem { id; description; quantity: number; unitPrice: number }`; `Invoice { id; number; customer: Customer; issueDate; dueDate; status; items: LineItem[]; discount: number; taxRate: number; notes? }`
- Produces (functions): `roundMoney(n: number): number`, `calculateLineAmount(item: LineItem): number`, `calculateSubtotal(items: LineItem[]): number`, `calculateTax(invoice: Invoice): number`, `calculateTotal(invoice: Invoice): number`, `getInvoiceTotals(invoice: Invoice): InvoiceTotals` where `InvoiceTotals { subtotal; discount; tax; total }` (all numbers)

- [ ] **Step 1: Write `src/types/invoice.ts`**

```ts
export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface Company {
  name: string
  addressLines: string[]
  email: string
}

export interface Customer {
  id: string
  name: string
  contact?: string
  addressLines: string[]
  email: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  /** URL id, e.g. "inv-0022" */
  id: string
  /** Display number, e.g. "INV-0022" */
  number: string
  customer: Customer
  /** ISO date, "YYYY-MM-DD" */
  issueDate: string
  /** ISO date, "YYYY-MM-DD" */
  dueDate: string
  status: InvoiceStatus
  items: LineItem[]
  /** Flat USD amount, subtracted before tax */
  discount: number
  /** Fraction, e.g. 0.1 for 10% */
  taxRate: number
  notes?: string
}
```

- [ ] **Step 2: Write the tests in `src/lib/invoice.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import type { Invoice } from '../types/invoice'
import {
  calculateLineAmount,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  getInvoiceTotals,
  roundMoney,
} from './invoice'

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-test',
    number: 'INV-TEST',
    customer: { id: 'test', name: 'Test Customer', addressLines: [], email: 'test@customer.example' },
    issueDate: '2026-09-01',
    dueDate: '2026-10-01',
    status: 'sent',
    items: [
      { id: 'li-1', description: 'Design', quantity: 2, unitPrice: 400 },
      { id: 'li-2', description: 'Hosting', quantity: 1, unitPrice: 200 },
    ],
    discount: 0,
    taxRate: 0.1,
    ...overrides,
  }
}

describe('roundMoney', () => {
  it('rounds to cents', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
    expect(roundMoney(12.3456)).toBe(12.35)
  })
})

describe('calculateLineAmount', () => {
  it('multiplies quantity by unit price', () => {
    expect(calculateLineAmount({ id: 'x', description: 'Hours', quantity: 3, unitPrice: 12.5 })).toBe(37.5)
  })
})

describe('calculateSubtotal', () => {
  it('sums all line amounts', () => {
    expect(calculateSubtotal(makeInvoice().items)).toBe(1000)
  })

  it('is zero when there are no items', () => {
    expect(calculateSubtotal([])).toBe(0)
  })
})

describe('calculateTax', () => {
  it('applies the tax rate to the subtotal', () => {
    expect(calculateTax(makeInvoice())).toBe(100)
  })

  it('taxes the amount after the discount', () => {
    expect(calculateTax(makeInvoice({ discount: 100 }))).toBe(90)
  })
})

describe('calculateTotal', () => {
  it('adds tax to the subtotal', () => {
    expect(calculateTotal(makeInvoice())).toBe(1100)
  })

  it('applies the discount to the total', () => {
    // subtotal 1000 - discount 100 + tax 90
    expect(calculateTotal(makeInvoice({ discount: 100 }))).toBe(990)
  })
})

describe('getInvoiceTotals', () => {
  it('returns every summary figure', () => {
    expect(getInvoiceTotals(makeInvoice())).toEqual({ subtotal: 1000, discount: 0, tax: 100, total: 1100 })
  })
})
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npx vitest run src/lib/invoice.test.ts`
Expected: FAIL, because `./invoice` cannot be resolved.

- [ ] **Step 4: Write `src/lib/invoice.ts`** (the PI-1 seed: `calculateTotal` does not subtract the discount; add no comment pointing at it)

```ts
import type { Invoice, LineItem } from '../types/invoice'

export interface InvoiceTotals {
  subtotal: number
  discount: number
  tax: number
  total: number
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function calculateLineAmount(item: LineItem): number {
  return roundMoney(item.quantity * item.unitPrice)
}

export function calculateSubtotal(items: LineItem[]): number {
  return roundMoney(items.reduce((sum, item) => sum + calculateLineAmount(item), 0))
}

export function calculateTax(invoice: Invoice): number {
  const taxable = calculateSubtotal(invoice.items) - invoice.discount
  return roundMoney(taxable * invoice.taxRate)
}

export function calculateTotal(invoice: Invoice): number {
  const subtotal = calculateSubtotal(invoice.items)
  return roundMoney(subtotal + calculateTax(invoice))
}

export function getInvoiceTotals(invoice: Invoice): InvoiceTotals {
  return {
    subtotal: calculateSubtotal(invoice.items),
    discount: invoice.discount,
    tax: calculateTax(invoice),
    total: calculateTotal(invoice),
  }
}
```

- [ ] **Step 5: Run the tests and confirm exactly the seeded failure**

Run: `npx vitest run src/lib/invoice.test.ts`
Expected: 8 passed, 1 failed. The failure is `calculateTotal > applies the discount to the total` (expected 990, received 1090).

- [ ] **Step 6: Commit**

```bash
git add src/types src/lib/invoice.ts src/lib/invoice.test.ts
git commit -m "feat: add invoice types and money calculations"
```

---

### Task 3: Formatting and pagination helpers

**Files:**
- Create: `src/lib/format.ts`, `src/lib/pagination.ts`
- Test: `src/lib/format.test.ts`, `src/lib/pagination.test.ts`

**Interfaces:**
- Consumes: `InvoiceStatus` from `src/types/invoice.ts`
- Produces: `formatCurrency(amount: number): string`, `formatDate(isoDate: string): string`, `formatPercent(rate: number): string`, `formatStatus(status: InvoiceStatus): string`; `paginate<T>(items: T[], requestedPage: number, pageSize: number): Page<T>` where `Page<T> { items: T[]; page; totalPages; totalItems; firstItem; lastItem }` (numbers; `firstItem`/`lastItem` are 1-based, and 0 when the list is empty)

- [ ] **Step 1: Write `src/lib/format.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatPercent, formatStatus } from './format'

describe('formatCurrency', () => {
  it('formats USD with separators and two decimals', () => {
    expect(formatCurrency(3300)).toBe('$3,300.00')
    expect(formatCurrency(12.5)).toBe('$12.50')
  })

  it('formats negative amounts', () => {
    expect(formatCurrency(-300)).toBe('-$300.00')
  })
})

describe('formatDate', () => {
  it('formats an ISO date as a short US date', () => {
    expect(formatDate('2026-09-08')).toBe('Sep 8, 2026')
  })

  it('does not shift the day in time zones behind UTC', () => {
    // Tests run with TZ=America/New_York (see vite.config.ts)
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026')
  })
})

describe('formatPercent', () => {
  it('formats a fraction as a percentage', () => {
    expect(formatPercent(0.1)).toBe('10%')
    expect(formatPercent(0.085)).toBe('8.5%')
  })
})

describe('formatStatus', () => {
  it('returns a readable label', () => {
    expect(formatStatus('draft')).toBe('Draft')
    expect(formatStatus('sent')).toBe('Sent')
    expect(formatStatus('paid')).toBe('Paid')
  })
})
```

- [ ] **Step 2: Write `src/lib/pagination.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { paginate } from './pagination'

const items = Array.from({ length: 24 }, (_, index) => index + 1)

describe('paginate', () => {
  it('returns the first page', () => {
    const result = paginate(items, 1, 10)
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result).toMatchObject({ page: 1, totalPages: 3, totalItems: 24, firstItem: 1, lastItem: 10 })
  })

  it('returns a partial last page', () => {
    const result = paginate(items, 3, 10)
    expect(result.items).toEqual([21, 22, 23, 24])
    expect(result).toMatchObject({ page: 3, firstItem: 21, lastItem: 24 })
  })

  it('clamps pages outside the range', () => {
    expect(paginate(items, 99, 10).page).toBe(3)
    expect(paginate(items, 0, 10).page).toBe(1)
    expect(paginate(items, -2, 10).page).toBe(1)
  })

  it('falls back to page 1 for non-integer input', () => {
    expect(paginate(items, Number.NaN, 10).page).toBe(1)
    expect(paginate(items, 1.5, 10).page).toBe(1)
  })

  it('handles an empty list', () => {
    expect(paginate([], 1, 10)).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
      totalItems: 0,
      firstItem: 0,
      lastItem: 0,
    })
  })
})
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npx vitest run src/lib/format.test.ts src/lib/pagination.test.ts`
Expected: FAIL, because the modules cannot be resolved.

- [ ] **Step 4: Write `src/lib/format.ts`**

```ts
import type { InvoiceStatus } from '../types/invoice'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

/** Formats an ISO "YYYY-MM-DD" date in local time, e.g. "Sep 8, 2026". */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 1000) / 10}%`
}

export function formatStatus(status: InvoiceStatus): string {
  return statusLabels[status]
}
```

- [ ] **Step 5: Write `src/lib/pagination.ts`**

```ts
export interface Page<T> {
  items: T[]
  /** 1-based page number, clamped to the available range */
  page: number
  totalPages: number
  totalItems: number
  /** 1-based position of the first item on the page (0 when empty) */
  firstItem: number
  /** 1-based position of the last item on the page (0 when empty) */
  lastItem: number
}

export function paginate<T>(items: T[], requestedPage: number, pageSize: number): Page<T> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), totalPages) : 1
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    items: pageItems,
    page,
    totalPages,
    totalItems,
    firstItem: pageItems.length > 0 ? start + 1 : 0,
    lastItem: start + pageItems.length,
  }
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `npx vitest run src/lib/format.test.ts src/lib/pagination.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 7: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts src/lib/pagination.ts src/lib/pagination.test.ts
git commit -m "feat: add formatting and pagination helpers"
```

---

### Task 4: Mock data and the invoice service

**Files:**
- Create: `src/mocks/company.ts`, `src/mocks/customers.ts`, `src/mocks/invoices.ts`, `src/mocks/index.ts`, `src/services/invoiceService.ts`
- Test: `src/services/invoiceService.test.ts`

**Interfaces:**
- Consumes: the types from Task 2
- Produces: `company: Company`, `customers` (a record keyed `northwind | contoso | fabrikam | tailspin | adventureWorks | wideWorld | blueYonder`), `invoices: Invoice[]` (24 items, `inv-0001`…`inv-0024`); `getInvoices(): Invoice[]` (newest first, new array each call), `getInvoiceById(id: string): Invoice | undefined`, `getCompany(): Company`

- [ ] **Step 1: Write `src/services/invoiceService.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { getCompany, getInvoiceById, getInvoices } from './invoiceService'

describe('invoiceService', () => {
  it('returns invoices newest first', () => {
    const dates = getInvoices().map((invoice) => invoice.issueDate)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(getInvoices()[0].number).toBe('INV-0024')
  })

  it('returns a new array on each call', () => {
    expect(getInvoices()).not.toBe(getInvoices())
  })

  it('finds an invoice by id', () => {
    expect(getInvoiceById('inv-0022')?.number).toBe('INV-0022')
  })

  it('returns undefined for an unknown id', () => {
    expect(getInvoiceById('does-not-exist')).toBeUndefined()
  })

  it('returns the sender company', () => {
    expect(getCompany().name).toBe('NWEB Studio')
  })
})

describe('mock data', () => {
  const invoices = getInvoices()

  it('has 24 invoices with unique ids and numbers', () => {
    expect(invoices).toHaveLength(24)
    expect(new Set(invoices.map((invoice) => invoice.id)).size).toBe(invoices.length)
    expect(new Set(invoices.map((invoice) => invoice.number)).size).toBe(invoices.length)
  })

  it('has at least one line item on every invoice', () => {
    for (const invoice of invoices) {
      expect(invoice.items.length).toBeGreaterThan(0)
    }
  })

  it('uses ISO dates with the due date on or after the issue date', () => {
    for (const invoice of invoices) {
      expect(invoice.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(invoice.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(invoice.dueDate >= invoice.issueDate).toBe(true)
    }
  })

  it('includes the discounted invoice used in the demo', () => {
    expect(getInvoiceById('inv-0022')).toMatchObject({ discount: 300, taxRate: 0.1 })
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/services/invoiceService.test.ts`
Expected: FAIL, because `./invoiceService` cannot be resolved.

- [ ] **Step 3: Write `src/mocks/company.ts`**

```ts
import type { Company } from '../types/invoice'

export const company: Company = {
  name: 'NWEB Studio',
  addressLines: ['120 Market Street, Suite 400', 'San Francisco, CA 94105'],
  email: 'billing@nweb.example',
}
```

- [ ] **Step 4: Write `src/mocks/customers.ts`**

```ts
import type { Customer } from '../types/invoice'

export const customers = {
  northwind: {
    id: 'northwind',
    name: 'Northwind Traders',
    contact: 'Accounts Payable',
    addressLines: ['500 Pine Street', 'Portland, OR 97204'],
    email: 'ap@northwind.example',
  },
  contoso: {
    id: 'contoso',
    name: 'Contoso Ltd',
    contact: 'Finance Team',
    addressLines: ['1 Contoso Way', 'Redmond, WA 98052'],
    email: 'finance@contoso.example',
  },
  fabrikam: {
    id: 'fabrikam',
    name: 'Fabrikam Inc.',
    contact: 'Accounts Payable',
    addressLines: ['88 Harbor Road', 'Seattle, WA 98101'],
    email: 'ap@fabrikam.example',
  },
  tailspin: {
    id: 'tailspin',
    name: 'Tailspin Toys',
    contact: 'Purchasing',
    addressLines: ['42 Toy Lane', 'Austin, TX 78701'],
    email: 'purchasing@tailspin.example',
  },
  adventureWorks: {
    id: 'adventure-works',
    name: 'Adventure Works',
    contact: 'Billing Department',
    addressLines: ['9 Summit Avenue', 'Denver, CO 80202'],
    email: 'billing@adventureworks.example',
  },
  wideWorld: {
    id: 'wide-world',
    name: 'Wide World Importers',
    contact: 'Accounts Payable',
    addressLines: ['300 Dock Street', 'Boston, MA 02110'],
    email: 'ap@wideworld.example',
  },
  blueYonder: {
    id: 'blue-yonder',
    name: 'Blue Yonder Airlines',
    contact: 'Vendor Payments',
    addressLines: ['7 Runway Drive', 'Chicago, IL 60666'],
    email: 'vendors@blueyonder.example',
  },
} satisfies Record<string, Customer>
```

- [ ] **Step 5: Write `src/mocks/invoices.ts`**

```ts
import type { Invoice } from '../types/invoice'
import { customers } from './customers'

export const invoices: Invoice[] = [
  {
    id: 'inv-0001', number: 'INV-0001', customer: customers.fabrikam,
    issueDate: '2026-01-14', dueDate: '2026-02-13', status: 'paid',
    items: [
      { id: 'li-1', description: 'Brand guidelines', quantity: 1, unitPrice: 1100 },
      { id: 'li-2', description: 'Logo refresh', quantity: 1, unitPrice: 600 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0002', number: 'INV-0002', customer: customers.contoso,
    issueDate: '2026-02-18', dueDate: '2026-03-20', status: 'paid',
    items: [
      { id: 'li-1', description: 'UX audit', quantity: 1, unitPrice: 1500 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0003', number: 'INV-0003', customer: customers.northwind,
    issueDate: '2026-03-20', dueDate: '2026-04-19', status: 'paid',
    items: [
      { id: 'li-1', description: 'Landing page build', quantity: 1, unitPrice: 1800 },
      { id: 'li-2', description: 'Content writing (pages)', quantity: 4, unitPrice: 150 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0004', number: 'INV-0004', customer: customers.blueYonder,
    issueDate: '2026-04-09', dueDate: '2026-05-09', status: 'paid',
    items: [
      { id: 'li-1', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-2', description: 'Analytics setup', quantity: 1, unitPrice: 500 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0005', number: 'INV-0005', customer: customers.wideWorld,
    issueDate: '2026-04-24', dueDate: '2026-05-24', status: 'paid',
    items: [
      { id: 'li-1', description: 'E-commerce integration', quantity: 1, unitPrice: 2200 },
      { id: 'li-2', description: 'Hosting setup (months)', quantity: 6, unitPrice: 100 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0006', number: 'INV-0006', customer: customers.adventureWorks,
    issueDate: '2026-05-08', dueDate: '2026-06-07', status: 'paid',
    items: [
      { id: 'li-1', description: 'Photography (half day)', quantity: 2, unitPrice: 650 },
      { id: 'li-2', description: 'Social media kit', quantity: 1, unitPrice: 450 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0007', number: 'INV-0007', customer: customers.tailspin,
    issueDate: '2026-05-21', dueDate: '2026-06-20', status: 'paid',
    items: [
      { id: 'li-1', description: 'Illustration pack', quantity: 1, unitPrice: 750 },
      { id: 'li-2', description: 'Newsletter template', quantity: 1, unitPrice: 350 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0008', number: 'INV-0008', customer: customers.fabrikam,
    issueDate: '2026-06-02', dueDate: '2026-07-02', status: 'paid',
    items: [
      { id: 'li-1', description: 'Maintenance retainer (hours)', quantity: 20, unitPrice: 85 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0009', number: 'INV-0009', customer: customers.contoso,
    issueDate: '2026-06-12', dueDate: '2026-07-12', status: 'paid',
    items: [
      { id: 'li-1', description: 'Website redesign', quantity: 1, unitPrice: 2400 },
      { id: 'li-2', description: 'Copy review (hours)', quantity: 5, unitPrice: 60 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0010', number: 'INV-0010', customer: customers.northwind,
    issueDate: '2026-06-22', dueDate: '2026-07-22', status: 'paid',
    items: [
      { id: 'li-1', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-2', description: 'Content writing (pages)', quantity: 6, unitPrice: 150 },
    ],
    discount: 100, taxRate: 0.1,
    notes: 'Returning-customer discount applied.',
  },
  {
    id: 'inv-0011', number: 'INV-0011', customer: customers.blueYonder,
    issueDate: '2026-06-30', dueDate: '2026-07-30', status: 'paid',
    items: [
      { id: 'li-1', description: 'Landing page build', quantity: 1, unitPrice: 1800 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0012', number: 'INV-0012', customer: customers.wideWorld,
    issueDate: '2026-07-08', dueDate: '2026-08-07', status: 'paid',
    items: [
      { id: 'li-1', description: 'Maintenance retainer (hours)', quantity: 12, unitPrice: 85 },
      { id: 'li-2', description: 'Analytics setup', quantity: 1, unitPrice: 500 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0013', number: 'INV-0013', customer: customers.adventureWorks,
    issueDate: '2026-07-15', dueDate: '2026-08-14', status: 'paid',
    items: [
      { id: 'li-1', description: 'UX audit', quantity: 1, unitPrice: 1500 },
      { id: 'li-2', description: 'Brand guidelines', quantity: 1, unitPrice: 1100 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0014', number: 'INV-0014', customer: customers.tailspin,
    issueDate: '2026-07-22', dueDate: '2026-08-21', status: 'paid',
    items: [
      { id: 'li-1', description: 'Social media kit', quantity: 2, unitPrice: 450 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0015', number: 'INV-0015', customer: customers.fabrikam,
    issueDate: '2026-07-29', dueDate: '2026-08-28', status: 'paid',
    items: [
      { id: 'li-1', description: 'E-commerce integration', quantity: 1, unitPrice: 2200 },
      { id: 'li-2', description: 'Photography (half day)', quantity: 2, unitPrice: 650 },
      { id: 'li-3', description: 'Copy review (hours)', quantity: 10, unitPrice: 60 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0016', number: 'INV-0016', customer: customers.contoso,
    issueDate: '2026-08-04', dueDate: '2026-09-03', status: 'paid',
    items: [
      { id: 'li-1', description: 'Newsletter template', quantity: 1, unitPrice: 350 },
      { id: 'li-2', description: 'Copy review (hours)', quantity: 9, unitPrice: 60 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0017', number: 'INV-0017', customer: customers.blueYonder,
    issueDate: '2026-08-10', dueDate: '2026-09-09', status: 'sent',
    items: [
      { id: 'li-1', description: 'Illustration pack', quantity: 1, unitPrice: 750 },
      { id: 'li-2', description: 'Photography (half day)', quantity: 1, unitPrice: 650 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0018', number: 'INV-0018', customer: customers.northwind,
    issueDate: '2026-08-15', dueDate: '2026-09-14', status: 'paid',
    items: [
      { id: 'li-1', description: 'Maintenance retainer (hours)', quantity: 16, unitPrice: 85 },
      { id: 'li-2', description: 'Hosting setup (months)', quantity: 6, unitPrice: 100 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0019', number: 'INV-0019', customer: customers.wideWorld,
    issueDate: '2026-08-22', dueDate: '2026-09-21', status: 'paid',
    items: [
      { id: 'li-1', description: 'E-commerce integration', quantity: 1, unitPrice: 2200 },
      { id: 'li-2', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-3', description: 'Analytics setup', quantity: 1, unitPrice: 500 },
    ],
    discount: 250, taxRate: 0.085,
    notes: 'Bundle discount for the launch package.',
  },
  {
    id: 'inv-0020', number: 'INV-0020', customer: customers.adventureWorks,
    issueDate: '2026-08-28', dueDate: '2026-09-11', status: 'sent',
    items: [
      { id: 'li-1', description: 'Landing page build', quantity: 1, unitPrice: 1800 },
      { id: 'li-2', description: 'Content writing (pages)', quantity: 8, unitPrice: 150 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0021', number: 'INV-0021', customer: customers.tailspin,
    issueDate: '2026-09-03', dueDate: '2026-10-03', status: 'paid',
    items: [
      { id: 'li-1', description: 'Social media kit', quantity: 1, unitPrice: 450 },
      { id: 'li-2', description: 'Newsletter template', quantity: 1, unitPrice: 350 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0022', number: 'INV-0022', customer: customers.fabrikam,
    issueDate: '2026-09-08', dueDate: '2026-09-22', status: 'sent',
    items: [
      { id: 'li-1', description: 'Website redesign', quantity: 1, unitPrice: 2400 },
      { id: 'li-2', description: 'Logo refresh', quantity: 1, unitPrice: 600 },
      { id: 'li-3', description: 'Hosting setup (months)', quantity: 3, unitPrice: 100 },
    ],
    discount: 300, taxRate: 0.1,
    notes: '10% loyalty discount on design work.',
  },
  {
    id: 'inv-0023', number: 'INV-0023', customer: customers.contoso,
    issueDate: '2026-09-12', dueDate: '2026-10-12', status: 'draft',
    items: [
      { id: 'li-1', description: 'UX audit', quantity: 1, unitPrice: 1500 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0024', number: 'INV-0024', customer: customers.northwind,
    issueDate: '2026-09-15', dueDate: '2026-10-15', status: 'sent',
    items: [
      { id: 'li-1', description: 'Website redesign', quantity: 1, unitPrice: 2400 },
      { id: 'li-2', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-3', description: 'Content writing (pages)', quantity: 4, unitPrice: 150 },
    ],
    discount: 0, taxRate: 0.1,
    notes: 'Payment by bank transfer within 30 days.',
  },
]
```

- [ ] **Step 6: Write `src/mocks/index.ts`**

```ts
export { company } from './company'
export { customers } from './customers'
export { invoices } from './invoices'
```

- [ ] **Step 7: Write `src/services/invoiceService.ts`**

```ts
import { company, invoices } from '../mocks'
import type { Company, Invoice } from '../types/invoice'

/** All invoices, newest first. */
export function getInvoices(): Invoice[] {
  return [...invoices].sort(
    (a, b) => b.issueDate.localeCompare(a.issueDate) || b.number.localeCompare(a.number),
  )
}

export function getInvoiceById(id: string): Invoice | undefined {
  return invoices.find((invoice) => invoice.id === id)
}

export function getCompany(): Company {
  return company
}
```

- [ ] **Step 8: Run the test and confirm it passes**

Run: `npx vitest run src/services/invoiceService.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 9: Commit**

```bash
git add src/mocks src/services
git commit -m "feat: add mock invoice data and invoice service"
```

---

### Task 5: App shell (shared components, routes, not-found page)

**Files:**
- Create: `src/components/Layout.tsx` + `.module.css`, `src/components/PageHeader.tsx` + `.module.css`, `src/components/Button.tsx` + `.module.css`, `src/components/Card.tsx` + `.module.css`, `src/components/StatusChip.tsx` + `.module.css`, `src/components/Pagination.tsx` + `.module.css`, `src/components/icons.tsx`, `src/pages/NotFoundPage.tsx` + `.module.css`, `src/routes.tsx`, `src/test/renderRoute.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/Pagination.test.tsx`, `src/routes.test.tsx`

**Interfaces:**
- Consumes: `getCompany()`, `formatStatus()`, `InvoiceStatus`
- Produces:
  - `Layout()`: header plus `<Outlet/>`.
  - `PageHeader({ title: string; badge?: ReactNode; subtitle?: ReactNode; actions?: ReactNode })`: `actions` is wrapped in `.no-print`.
  - `Button({ variant?: 'primary' | 'secondary', ...buttonProps })`: `type` defaults to `'button'`.
  - `Card({ children, className? })`
  - `StatusChip({ status })`
  - `Pagination({ page, totalPages, onPageChange(page) })`: button names are "Previous page", "Next page" and "Page N"; the current page has `aria-current="page"`.
  - `PrinterIcon()`, `DownloadIcon()`
  - `NotFoundPage({ title?, message? })`
  - `routes: RouteObject[]`: `/` is a layout route with an index redirect to `/invoices` and a `*` catch-all.
  - `renderRoute(path)`: returns `{ router, ...renderResult }`.
  - `App()`

- [ ] **Step 1: Write `src/components/Pagination.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('marks the current page', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current')
  })

  it('disables Previous on the first page and Next on the last page', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()

    rerender(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('reports the requested page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange.mock.calls).toEqual([[3], [1], [3]])
  })
})
```

- [ ] **Step 2: Write `src/routes.test.tsx`**

```tsx
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from './test/renderRoute'

describe('routes', () => {
  it('redirects / to /invoices', async () => {
    const { router } = renderRoute('/')
    await waitFor(() => expect(router.state.location.pathname).toBe('/invoices'))
  })

  it('shows the not found page for unknown paths', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to invoices' })).toHaveAttribute('href', '/invoices')
  })

  it('renders the app header with the brand and company', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('link', { name: 'Pocket Invoice' })).toHaveAttribute('href', '/invoices')
    expect(screen.getByText('NWEB Studio')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write `src/test/renderRoute.tsx`**

```tsx
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../routes'

/** Renders the full app (layout and pages) at the given URL. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { router, ...render(<RouterProvider router={router} />) }
}
```

- [ ] **Step 4: Run the tests and confirm they fail**

Run: `npx vitest run src/components/Pagination.test.tsx src/routes.test.tsx`
Expected: FAIL, because `./Pagination` and `../routes` cannot be resolved.

- [ ] **Step 5: Write `src/components/Button.tsx` and `Button.module.css`**

```tsx
import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'secondary', type = 'button', className, ...props }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button type={type} className={classes} {...props} />
}
```

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.secondary {
  background: var(--color-surface);
  color: var(--color-text);
}

.secondary:hover:not(:disabled) {
  background: var(--color-surface-alt);
}

.primary {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: #fff;
}

.primary:hover:not(:disabled) {
  border-color: var(--color-brand-dark);
  background: var(--color-brand-dark);
}
```

- [ ] **Step 6: Write `src/components/Card.tsx` and `Card.module.css`**

```tsx
import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <section className={className ? `${styles.card} ${className}` : styles.card}>{children}</section>
}
```

```css
.card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

@media print {
  .card {
    border: none;
    border-radius: 0;
  }
}
```

- [ ] **Step 7: Write `src/components/StatusChip.tsx` and `StatusChip.module.css`**

```tsx
import { formatStatus } from '../lib/format'
import type { InvoiceStatus } from '../types/invoice'
import styles from './StatusChip.module.css'

export function StatusChip({ status }: { status: InvoiceStatus }) {
  return <span className={`${styles.chip} ${styles[status]}`}>{formatStatus(status)}</span>
}
```

```css
.chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.draft {
  background: #f3f4f6;
  color: #4b5563;
}

.sent {
  background: #eaf1ff;
  color: #2d5bd7;
}

.paid {
  background: #dcfce7;
  color: #15803d;
}

@media print {
  .chip {
    border: 1px solid currentColor;
  }
}
```

- [ ] **Step 8: Write `src/components/Pagination.tsx` and `Pagination.module.css`**

```tsx
import { Button } from './Button'
import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Button aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ‹ Prev
      </Button>
      {pages.map((pageNumber) => (
        <Button
          key={pageNumber}
          aria-label={`Page ${pageNumber}`}
          aria-current={pageNumber === page ? 'page' : undefined}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      <Button aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next ›
      </Button>
    </nav>
  )
}
```

```css
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pagination button[aria-current='page'] {
  border-color: var(--color-brand);
  background: var(--color-brand-light);
  color: var(--color-brand-dark);
}
```

- [ ] **Step 9: Write `src/components/PageHeader.tsx` and `PageHeader.module.css`**

```tsx
import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  badge?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, badge, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          {badge}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={`${styles.actions} no-print`}>{actions}</div>}
    </div>
  )
}
```

```css
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 22px;
  font-weight: 700;
}

.subtitle {
  margin-top: 2px;
  color: var(--color-muted);
}

.actions {
  display: flex;
  gap: 8px;
}
```

- [ ] **Step 10: Write `src/components/icons.tsx`**

```tsx
import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

export function PrinterIcon() {
  return (
    <Icon>
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </Icon>
  )
}

export function DownloadIcon() {
  return (
    <Icon>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </Icon>
  )
}
```

- [ ] **Step 11: Write `src/components/Layout.tsx` and `Layout.module.css`**

```tsx
import { Link, NavLink, Outlet } from 'react-router'
import { getCompany } from '../services/invoiceService'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <>
      <header className={`${styles.header} no-print`}>
        <Link to="/invoices" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            PI
          </span>
          Pocket Invoice
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/invoices" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Invoices
          </NavLink>
          <span className={styles.company}>{getCompany().name}</span>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
```

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
}

.brand:hover {
  text-decoration: none;
}

.logo {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-brand);
  color: #fff;
  font-size: 13px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--color-muted);
}

.nav a {
  color: inherit;
}

.nav a.active {
  color: var(--color-brand);
  font-weight: 600;
}

.company {
  font-size: 13px;
}

.main {
  max-width: 1040px;
  margin: 0 auto;
  padding: 28px 24px 40px;
}

@media screen and (max-width: 600px) {
  .company {
    display: none;
  }

  .main {
    padding: 20px 16px 32px;
  }
}

@media print {
  .main {
    max-width: none;
    padding: 0;
  }
}
```

- [ ] **Step 12: Write `src/pages/NotFoundPage.tsx` and `NotFoundPage.module.css`**

```tsx
import { Link } from 'react-router'
import styles from './NotFoundPage.module.css'

interface NotFoundPageProps {
  title?: string
  message?: string
}

export function NotFoundPage({
  title = 'Page not found',
  message = 'The page you are looking for does not exist.',
}: NotFoundPageProps) {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Link to="/invoices">Back to invoices</Link>
    </div>
  )
}
```

```css
.notFound {
  padding: 64px 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  text-align: center;
}

.title {
  margin-bottom: 8px;
  font-size: 20px;
}

.message {
  margin-bottom: 16px;
  color: var(--color-muted);
}
```

- [ ] **Step 13: Write `src/routes.tsx`**

```tsx
import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/invoices" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
```

- [ ] **Step 14: Replace `src/App.tsx`**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 15: Run the tests and confirm they pass**

Run: `npx vitest run src/components/Pagination.test.tsx src/routes.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 16: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 17: Commit**

```bash
git add src/components src/pages src/routes.tsx src/routes.test.tsx src/test/renderRoute.tsx src/App.tsx
git commit -m "feat: add app shell, shared components and routing"
```

---

### Task 6: Invoice list page (PI-8)

**Files:**
- Create: `src/styles/table.module.css`, `src/components/InvoiceTable.tsx` + `.module.css`, `src/pages/InvoiceListPage.tsx` + `.module.css`
- Modify: `src/routes.tsx` (add the `invoices` route)
- Test: `src/pages/InvoiceListPage.test.tsx`

**Interfaces:**
- Consumes: `getInvoices()`, `paginate()`, `calculateTotal()`, `formatCurrency()`, `formatDate()`, `Card`, `PageHeader`, `Pagination`, `StatusChip`, `renderRoute()`
- Produces:
  - `InvoiceTable({ invoices: Invoice[] })`: the invoice number is a link to `/invoices/:id`, and clicking a row navigates there.
  - `InvoiceListPage()`: 10 items per page, with the page number in `?page`.
  - `table.module.css` classes: `table`, `numeric`.

- [ ] **Step 1: Write `src/pages/InvoiceListPage.test.tsx`**

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/renderRoute'

function bodyRows() {
  const [, body] = screen.getAllByRole('rowgroup')
  return within(body).getAllByRole('row')
}

describe('InvoiceListPage', () => {
  it('shows the first 10 invoices, newest first', () => {
    renderRoute('/invoices')
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByText('24 invoices')).toBeInTheDocument()

    const rows = bodyRows()
    expect(rows).toHaveLength(10)
    expect(rows[0]).toHaveTextContent('INV-0024')
    expect(rows[0]).toHaveTextContent('Northwind Traders')
    expect(rows[0]).toHaveTextContent('Sep 15, 2026')
    expect(rows[0]).toHaveTextContent('Oct 15, 2026')
    expect(rows[0]).toHaveTextContent('$4,290.00')
    expect(rows[0]).toHaveTextContent('Sent')
    expect(rows[9]).toHaveTextContent('INV-0015')
    expect(screen.getByText('Showing 1–10 of 24')).toBeInTheDocument()
  })

  it('links each invoice number to its detail page', () => {
    renderRoute('/invoices')
    expect(within(bodyRows()[0]).getByRole('link', { name: 'INV-0024' })).toHaveAttribute(
      'href',
      '/invoices/inv-0024',
    )
  })

  it('moves to the next page', async () => {
    const { router } = renderRoute('/invoices')
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(router.state.location.search).toBe('?page=2')
    expect(bodyRows()[0]).toHaveTextContent('INV-0014')
    expect(screen.getByText('Showing 11–20 of 24')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('reads the page from the URL and clamps it to the last page', () => {
    renderRoute('/invoices?page=99')
    expect(bodyRows()).toHaveLength(4)
    expect(screen.getByText('Showing 21–24 of 24')).toBeInTheDocument()
  })

  it('falls back to the first page for an invalid page', () => {
    renderRoute('/invoices?page=abc')
    expect(screen.getByText('Showing 1–10 of 24')).toBeInTheDocument()
  })

  it('opens an invoice when its row is clicked', async () => {
    const { router } = renderRoute('/invoices')
    await userEvent.click(within(bodyRows()[2]).getByText('Fabrikam Inc.'))
    expect(router.state.location.pathname).toBe('/invoices/inv-0022')
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/pages/InvoiceListPage.test.tsx`
Expected: FAIL, because `/invoices` still renders "Page not found".

- [ ] **Step 3: Write `src/styles/table.module.css`**

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.table .numeric {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
```

- [ ] **Step 4: Write `src/components/InvoiceTable.tsx` and `InvoiceTable.module.css`**

```tsx
import { Link, useNavigate } from 'react-router'
import { formatCurrency, formatDate } from '../lib/format'
import { calculateTotal } from '../lib/invoice'
import tableStyles from '../styles/table.module.css'
import type { Invoice } from '../types/invoice'
import styles from './InvoiceTable.module.css'
import { StatusChip } from './StatusChip'

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const navigate = useNavigate()

  return (
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <th scope="col">Invoice</th>
          <th scope="col">Customer</th>
          <th scope="col">Issued</th>
          <th scope="col">Due</th>
          <th scope="col" className={tableStyles.numeric}>
            Total
          </th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => {
          const href = `/invoices/${invoice.id}`
          return (
            <tr key={invoice.id} className={styles.row} onClick={() => navigate(href)}>
              <td>
                <Link to={href} className={styles.number} onClick={(event) => event.stopPropagation()}>
                  {invoice.number}
                </Link>
              </td>
              <td>{invoice.customer.name}</td>
              <td>{formatDate(invoice.issueDate)}</td>
              <td>{formatDate(invoice.dueDate)}</td>
              <td className={tableStyles.numeric}>{formatCurrency(calculateTotal(invoice))}</td>
              <td>
                <StatusChip status={invoice.status} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

```css
.row {
  cursor: pointer;
}

.row:hover {
  background: #faf8ff;
}

.number {
  font-weight: 600;
  white-space: nowrap;
}
```

- [ ] **Step 5: Write `src/pages/InvoiceListPage.tsx` and `InvoiceListPage.module.css`**

```tsx
import { useSearchParams } from 'react-router'
import { Card } from '../components/Card'
import { InvoiceTable } from '../components/InvoiceTable'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { paginate } from '../lib/pagination'
import { getInvoices } from '../services/invoiceService'
import styles from './InvoiceListPage.module.css'

const PAGE_SIZE = 10

export function InvoiceListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const current = paginate(getInvoices(), Number(searchParams.get('page') ?? 1), PAGE_SIZE)

  const goToPage = (page: number) => setSearchParams({ page: String(page) })

  return (
    <>
      <PageHeader title="Invoices" subtitle={`${current.totalItems} invoices`} />
      <Card>
        <div className={styles.tableScroll}>
          <InvoiceTable invoices={current.items} />
        </div>
        <div className={styles.footer}>
          <span>
            Showing {current.firstItem}–{current.lastItem} of {current.totalItems}
          </span>
          <Pagination page={current.page} totalPages={current.totalPages} onPageChange={goToPage} />
        </div>
      </Card>
    </>
  )
}
```

```css
.tableScroll {
  overflow-x: auto;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  color: var(--color-muted);
}
```

- [ ] **Step 6: Add the route** in `src/routes.tsx`. Import the page and add it before the `*` route:

```tsx
import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/invoices" replace /> },
      { path: 'invoices', element: <InvoiceListPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npx vitest run src/pages/InvoiceListPage.test.tsx src/routes.test.tsx`
Expected: PASS (9 tests).

- [ ] **Step 8: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/styles/table.module.css src/components/InvoiceTable.tsx src/components/InvoiceTable.module.css src/pages/InvoiceListPage.tsx src/pages/InvoiceListPage.module.css src/pages/InvoiceListPage.test.tsx src/routes.tsx
git commit -m "feat: add paginated invoice list page (PI-8)"
```

---

### Task 7: Summary lines and PDF export (PI-6)

**Files:**
- Create: `src/lib/summary.ts`, `src/lib/pdf.ts`
- Test: `src/lib/summary.test.ts`, `src/lib/pdf.test.ts`

**Interfaces:**
- Consumes: `getInvoiceTotals()`, `calculateLineAmount()`, `formatCurrency()`, `formatDate()`, `formatPercent()`, `formatStatus()`, `getInvoiceById()`, `getCompany()`
- Produces:
  - `getSummaryLines(invoice: Invoice): InvoiceSummaryLines`, where `InvoiceSummaryLines { lines: SummaryLine[]; total: string }` and `SummaryLine { label: string; value: string }`.
  - `buildInvoicePdf(invoice: Invoice, company: Company): Promise<jsPDF>`
  - `exportInvoicePdf(invoice: Invoice, company: Company): Promise<void>`: saves the file as `${invoice.number}.pdf`.

- [ ] **Step 1: Write `src/lib/summary.test.ts`** (it must not assert a discounted total)

```ts
import { describe, expect, it } from 'vitest'
import type { Invoice } from '../types/invoice'
import { getSummaryLines } from './summary'

const invoice: Invoice = {
  id: 'inv-test',
  number: 'INV-TEST',
  customer: { id: 'test', name: 'Test Customer', addressLines: [], email: 'test@customer.example' },
  issueDate: '2026-09-01',
  dueDate: '2026-10-01',
  status: 'sent',
  items: [{ id: 'li-1', description: 'Design', quantity: 1, unitPrice: 1000 }],
  discount: 0,
  taxRate: 0.1,
}

describe('getSummaryLines', () => {
  it('lists subtotal and tax, then the total', () => {
    expect(getSummaryLines(invoice)).toEqual({
      lines: [
        { label: 'Subtotal', value: '$1,000.00' },
        { label: 'Tax (10%)', value: '$100.00' },
      ],
      total: '$1,100.00',
    })
  })

  it('adds a discount line when the invoice has a discount', () => {
    const { lines } = getSummaryLines({ ...invoice, discount: 100 })
    expect(lines).toEqual([
      { label: 'Subtotal', value: '$1,000.00' },
      { label: 'Discount', value: '-$100.00' },
      { label: 'Tax (10%)', value: '$90.00' },
    ])
  })
})
```

- [ ] **Step 2: Write `src/lib/pdf.test.ts`** (it must not assert a discounted total)

```ts
import { autoTable } from 'jspdf-autotable'
import { describe, expect, it, vi } from 'vitest'
import { getCompany, getInvoiceById } from '../services/invoiceService'
import { buildInvoicePdf, exportInvoicePdf } from './pdf'

const savedFiles = vi.hoisted(() => [] as string[])

// jsPDF attaches methods per instance, so replace the class with a subclass that records save()
vi.mock('jspdf', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jspdf')>()
  class RecordingPdf extends actual.jsPDF {
    constructor(...args: ConstructorParameters<typeof actual.jsPDF>) {
      super(...args)
      this.save = ((filename: string) => {
        savedFiles.push(filename)
      }) as typeof this.save
    }
  }
  return { ...actual, jsPDF: RecordingPdf }
})
vi.mock('jspdf-autotable', { spy: true })

const invoice = getInvoiceById('inv-0022')!
const company = getCompany()

describe('buildInvoicePdf', () => {
  it('writes the branded header, parties, summary and footer', async () => {
    const output = (await buildInvoicePdf(invoice, company)).output()
    for (const text of [
      'Pocket Invoice',
      'INVOICE',
      'INV-0022',
      'NWEB Studio',
      'Fabrikam Inc.',
      'Sep 8, 2026',
      'Sep 22, 2026',
      'Subtotal',
      '$3,300.00',
      'Discount',
      '-$300.00',
      '10% loyalty discount on design work.',
      'Thank you for your business!',
    ]) {
      expect(output).toContain(text)
    }
  })

  it('renders every line item in the table', async () => {
    await buildInvoicePdf(invoice, company)
    const options = vi.mocked(autoTable).mock.calls[0][1]
    expect(options.head).toEqual([['Description', 'Qty', 'Unit price', 'Amount']])
    expect(options.body).toEqual([
      ['Website redesign', '1', '$2,400.00', '$2,400.00'],
      ['Logo refresh', '1', '$600.00', '$600.00'],
      ['Hosting setup (months)', '3', '$100.00', '$300.00'],
    ])
  })
})

describe('exportInvoicePdf', () => {
  it('saves the PDF named after the invoice number', async () => {
    savedFiles.length = 0
    await exportInvoicePdf(invoice, company)
    expect(savedFiles).toEqual(['INV-0022.pdf'])
  })
})
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npx vitest run src/lib/summary.test.ts src/lib/pdf.test.ts`
Expected: FAIL, because `./summary` and `./pdf` cannot be resolved.

- [ ] **Step 4: Write `src/lib/summary.ts`**

```ts
import type { Invoice } from '../types/invoice'
import { formatCurrency, formatPercent } from './format'
import { getInvoiceTotals } from './invoice'

export interface SummaryLine {
  label: string
  value: string
}

export interface InvoiceSummaryLines {
  lines: SummaryLine[]
  total: string
}

/** Formatted figures shown under the line items, shared by the page and the PDF. */
export function getSummaryLines(invoice: Invoice): InvoiceSummaryLines {
  const totals = getInvoiceTotals(invoice)
  const lines: SummaryLine[] = [{ label: 'Subtotal', value: formatCurrency(totals.subtotal) }]
  if (totals.discount > 0) {
    lines.push({ label: 'Discount', value: formatCurrency(-totals.discount) })
  }
  lines.push({ label: `Tax (${formatPercent(invoice.taxRate)})`, value: formatCurrency(totals.tax) })
  return { lines, total: formatCurrency(totals.total) }
}
```

- [ ] **Step 5: Write `src/lib/pdf.ts`**

```ts
import type { jsPDF } from 'jspdf'
import type { Company, Invoice } from '../types/invoice'
import { formatCurrency, formatDate, formatStatus } from './format'
import { calculateLineAmount } from './invoice'
import { getSummaryLines } from './summary'

type Rgb = [number, number, number]

const BRAND: Rgb = [124, 58, 237]
const TEXT: Rgb = [31, 41, 55]
const MUTED: Rgb = [107, 114, 128]
const BORDER: Rgb = [229, 231, 235]
const ZEBRA: Rgb = [247, 245, 253]
const WHITE: Rgb = [255, 255, 255]
const MARGIN = 40
const SUMMARY_WIDTH = 190

/** Draws the invoice as a branded A4 PDF. jsPDF is loaded on first use. */
export async function buildInvoicePdf(invoice: Invoice, company: Company): Promise<jsPDF> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const right = pageWidth - MARGIN
  const { customer } = invoice

  // Header band
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Pocket Invoice', MARGIN, 52)
  doc.setFontSize(14)
  doc.text('INVOICE', right, 44, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(invoice.number, right, 62, { align: 'right' })

  // Parties and dates
  drawBlock(doc, 'From', [company.name, ...company.addressLines, company.email], MARGIN, 130)
  drawBlock(
    doc,
    'Bill to',
    [
      customer.name,
      ...(customer.contact ? [`Attn: ${customer.contact}`] : []),
      ...customer.addressLines,
      customer.email,
    ],
    MARGIN + 190,
    130,
  )
  drawBlock(
    doc,
    'Details',
    [
      `Issued: ${formatDate(invoice.issueDate)}`,
      `Due: ${formatDate(invoice.dueDate)}`,
      `Status: ${formatStatus(invoice.status)}`,
    ],
    right,
    130,
    'right',
  )

  // Line items
  autoTable(doc, {
    startY: 230,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Description', 'Qty', 'Unit price', 'Amount']],
    body: invoice.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(calculateLineAmount(item)),
    ]),
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, textColor: TEXT, cellPadding: 6 },
    headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: ZEBRA },
    didParseCell: ({ column, cell }) => {
      if (column.index > 0) cell.styles.halign = 'right'
    },
  })
  const tableBottom = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  // Notes (left) and summary (right)
  let y = tableBottom + 28
  if (invoice.notes) {
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text(invoice.notes, MARGIN, y, { maxWidth: right - SUMMARY_WIDTH - MARGIN - 30 })
  }

  const summary = getSummaryLines(invoice)
  const labelX = right - SUMMARY_WIDTH
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  for (const line of summary.lines) {
    doc.setTextColor(...MUTED)
    doc.text(line.label, labelX, y)
    doc.setTextColor(...TEXT)
    doc.text(line.value, right, y, { align: 'right' })
    y += 18
  }
  doc.setDrawColor(...BORDER)
  doc.line(labelX, y - 8, right, y - 8)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...TEXT)
  doc.text('Total', labelX, y)
  doc.text(summary.total, right, y, { align: 'right' })

  // Footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 40, { align: 'center' })

  return doc
}

/** Builds the invoice PDF and downloads it as "<number>.pdf". */
export async function exportInvoicePdf(invoice: Invoice, company: Company): Promise<void> {
  const doc = await buildInvoicePdf(invoice, company)
  doc.save(`${invoice.number}.pdf`)
}

function drawBlock(
  doc: jsPDF,
  label: string,
  lines: string[],
  x: number,
  y: number,
  align: 'left' | 'right' = 'left',
) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(label.toUpperCase(), x, y, { align })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...TEXT)
  lines.forEach((line, index) => doc.text(line, x, y + 18 + index * 14, { align }))
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `npx vitest run src/lib/summary.test.ts src/lib/pdf.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors. (The jsPDF bundle split is checked in Task 8, once a page imports `pdf.ts`.)

- [ ] **Step 8: Commit**

```bash
git add src/lib/summary.ts src/lib/summary.test.ts src/lib/pdf.ts src/lib/pdf.test.ts
git commit -m "feat: add branded invoice PDF export (PI-6)"
```

---

### Task 8: Invoice detail page with Print and Export PDF

**Files:**
- Create: `src/components/LineItemsTable.tsx`, `src/components/InvoiceSummary.tsx` + `.module.css`, `src/components/InvoiceDocument.tsx` + `.module.css`, `src/pages/InvoiceDetailPage.tsx` + `.module.css`
- Modify: `src/routes.tsx` (add the `invoices/:invoiceId` route)
- Test: `src/pages/InvoiceDetailPage.test.tsx`

**Interfaces:**
- Consumes: `getInvoiceById()`, `getCompany()`, `exportInvoicePdf()`, `getSummaryLines()`, `calculateLineAmount()`, `formatCurrency()`, `formatDate()`, `Button`, `Card`, `PageHeader`, `StatusChip`, `PrinterIcon`, `DownloadIcon`, `NotFoundPage`, `renderRoute()`
- Produces:
  - `LineItemsTable({ items })`
  - `InvoiceSummary({ invoice })`: a `<dl aria-label="Invoice summary">`.
  - `InvoiceDocument({ invoice, company })`: section headings are "From" and "Bill to".
  - `InvoiceDetailPage()`

- [ ] **Step 1: Write `src/pages/InvoiceDetailPage.test.tsx`** (it must not assert the total)

```tsx
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { exportInvoicePdf } from '../lib/pdf'
import { getCompany, getInvoiceById } from '../services/invoiceService'
import { renderRoute } from '../test/renderRoute'

vi.mock('../lib/pdf', () => ({ exportInvoicePdf: vi.fn() }))

function sectionOf(heading: string) {
  return screen.getByRole('heading', { name: heading }).parentElement!
}

describe('InvoiceDetailPage', () => {
  it('shows the invoice header, parties and dates', () => {
    renderRoute('/invoices/inv-0022')
    expect(screen.getByRole('heading', { level: 1, name: 'INV-0022' })).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
    expect(sectionOf('From')).toHaveTextContent('NWEB Studio')
    expect(sectionOf('From')).toHaveTextContent('billing@nweb.example')
    expect(sectionOf('Bill to')).toHaveTextContent('Fabrikam Inc.')
    expect(sectionOf('Bill to')).toHaveTextContent('Attn: Accounts Payable')
    expect(screen.getByText('Sep 8, 2026')).toBeInTheDocument()
    expect(screen.getByText('Sep 22, 2026')).toBeInTheDocument()
    expect(screen.getByText('10% loyalty discount on design work.')).toBeInTheDocument()
  })

  it('shows the line items and summary figures', () => {
    renderRoute('/invoices/inv-0022')
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(rows[1]).toHaveTextContent('Website redesign1$2,400.00$2,400.00')
    expect(rows[3]).toHaveTextContent('Hosting setup (months)3$100.00$300.00')

    const summary = screen.getByLabelText('Invoice summary')
    expect(summary).toHaveTextContent('Subtotal$3,300.00')
    expect(summary).toHaveTextContent('Discount-$300.00')
    expect(summary).toHaveTextContent('Tax (10%)$300.00')
    expect(summary).toHaveTextContent('Total')
  })

  it('links back to the invoice list', () => {
    renderRoute('/invoices/inv-0022')
    expect(screen.getByRole('link', { name: 'Back to invoices' })).toHaveAttribute('href', '/invoices')
  })

  it('prints the page', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(print).toHaveBeenCalledOnce()
  })

  it('exports the invoice as a PDF', async () => {
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    expect(exportInvoicePdf).toHaveBeenCalledExactlyOnceWith(getInvoiceById('inv-0022'), getCompany())
    expect(await screen.findByRole('button', { name: 'Export PDF' })).toBeEnabled()
  })

  it('disables the export button while exporting', async () => {
    let finish!: () => void
    vi.mocked(exportInvoicePdf).mockImplementationOnce(
      () => new Promise<void>((resolve) => (finish = resolve)),
    )
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    expect(screen.getByRole('button', { name: 'Exporting…' })).toBeDisabled()

    await act(async () => finish())
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeEnabled()
  })

  it('shows an error when the export fails', async () => {
    vi.mocked(exportInvoicePdf).mockRejectedValueOnce(new Error('boom'))
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not export the PDF. Please try again.')
  })

  it('shows not found for an unknown invoice', () => {
    renderRoute('/invoices/inv-9999')
    expect(screen.getByRole('heading', { name: 'Invoice not found' })).toBeInTheDocument()
    expect(screen.getByText('We could not find invoice "inv-9999".')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Print' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run src/pages/InvoiceDetailPage.test.tsx`
Expected: FAIL, because the detail route renders "Page not found".

- [ ] **Step 3: Write `src/components/LineItemsTable.tsx`**

```tsx
import { formatCurrency } from '../lib/format'
import { calculateLineAmount } from '../lib/invoice'
import tableStyles from '../styles/table.module.css'
import type { LineItem } from '../types/invoice'

export function LineItemsTable({ items }: { items: LineItem[] }) {
  return (
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col" className={tableStyles.numeric}>
            Qty
          </th>
          <th scope="col" className={tableStyles.numeric}>
            Unit price
          </th>
          <th scope="col" className={tableStyles.numeric}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.description}</td>
            <td className={tableStyles.numeric}>{item.quantity}</td>
            <td className={tableStyles.numeric}>{formatCurrency(item.unitPrice)}</td>
            <td className={tableStyles.numeric}>{formatCurrency(calculateLineAmount(item))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 4: Write `src/components/InvoiceSummary.tsx` and `InvoiceSummary.module.css`**

```tsx
import { getSummaryLines } from '../lib/summary'
import type { Invoice } from '../types/invoice'
import styles from './InvoiceSummary.module.css'

export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  const { lines, total } = getSummaryLines(invoice)

  return (
    <dl className={styles.summary} aria-label="Invoice summary">
      {lines.map((line) => (
        <div key={line.label} className={styles.line}>
          <dt>{line.label}</dt>
          <dd>{line.value}</dd>
        </div>
      ))}
      <div className={`${styles.line} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{total}</dd>
      </div>
    </dl>
  )
}
```

```css
.summary {
  width: 100%;
  max-width: 280px;
  margin: 0 0 0 auto;
}

.line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
}

.line dt {
  color: var(--color-muted);
}

.line dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.total {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 16px;
  font-weight: 700;
}

.total dt {
  color: var(--color-text);
}
```

- [ ] **Step 5: Write `src/components/InvoiceDocument.tsx` and `InvoiceDocument.module.css`**

```tsx
import { formatDate } from '../lib/format'
import type { Company, Invoice } from '../types/invoice'
import { Card } from './Card'
import styles from './InvoiceDocument.module.css'
import { InvoiceSummary } from './InvoiceSummary'
import { LineItemsTable } from './LineItemsTable'

interface InvoiceDocumentProps {
  invoice: Invoice
  company: Company
}

export function InvoiceDocument({ invoice, company }: InvoiceDocumentProps) {
  const { customer } = invoice

  return (
    <Card>
      <div className={styles.parties}>
        <address className={styles.party}>
          <h2 className={styles.label}>From</h2>
          <strong>{company.name}</strong>
          {company.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>{company.email}</span>
        </address>
        <address className={styles.party}>
          <h2 className={styles.label}>Bill to</h2>
          <strong>{customer.name}</strong>
          {customer.contact && <span>Attn: {customer.contact}</span>}
          {customer.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>{customer.email}</span>
        </address>
        <dl className={styles.dates}>
          <div>
            <dt className={styles.label}>Issued</dt>
            <dd>{formatDate(invoice.issueDate)}</dd>
          </div>
          <div>
            <dt className={styles.label}>Due</dt>
            <dd>{formatDate(invoice.dueDate)}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.items}>
        <LineItemsTable items={invoice.items} />
      </div>
      <div className={styles.footer}>
        {invoice.notes && <p className={styles.notes}>{invoice.notes}</p>}
        <InvoiceSummary invoice={invoice} />
      </div>
    </Card>
  )
}
```

```css
.parties {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 32px;
}

.party {
  display: flex;
  flex-direction: column;
  color: var(--color-muted);
  font-style: normal;
}

.party strong {
  color: var(--color-text);
}

.label {
  margin: 0 0 4px;
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dates {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
}

.dates dd {
  margin: 0;
}

.items {
  overflow-x: auto;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
  padding: 20px 32px 28px;
}

.notes {
  max-width: 360px;
  color: var(--color-muted);
}

@media screen and (max-width: 700px) {
  .parties {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .footer {
    padding: 20px 24px 24px;
  }
}

@media print {
  .parties,
  .footer {
    padding-inline: 0;
  }
}
```

- [ ] **Step 6: Write `src/pages/InvoiceDetailPage.tsx` and `InvoiceDetailPage.module.css`**

```tsx
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '../components/Button'
import { DownloadIcon, PrinterIcon } from '../components/icons'
import { InvoiceDocument } from '../components/InvoiceDocument'
import { PageHeader } from '../components/PageHeader'
import { StatusChip } from '../components/StatusChip'
import { exportInvoicePdf } from '../lib/pdf'
import { getCompany, getInvoiceById } from '../services/invoiceService'
import styles from './InvoiceDetailPage.module.css'
import { NotFoundPage } from './NotFoundPage'

export function InvoiceDetailPage() {
  const { invoiceId = '' } = useParams()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const invoice = getInvoiceById(invoiceId)

  if (!invoice) {
    return <NotFoundPage title="Invoice not found" message={`We could not find invoice "${invoiceId}".`} />
  }

  const company = getCompany()

  // An arrow function (not a hoisted declaration) keeps `invoice` narrowed
  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      await exportInvoicePdf(invoice, company)
    } catch {
      setExportError('Could not export the PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Link to="/invoices" className={`${styles.back} no-print`}>
        <span aria-hidden="true">← </span>Back to invoices
      </Link>
      <PageHeader
        title={invoice.number}
        badge={<StatusChip status={invoice.status} />}
        actions={
          <>
            <Button onClick={() => window.print()}>
              <PrinterIcon />
              Print
            </Button>
            <Button variant="primary" disabled={isExporting} onClick={handleExport}>
              <DownloadIcon />
              {isExporting ? 'Exporting…' : 'Export PDF'}
            </Button>
          </>
        }
      />
      {exportError && (
        <p role="alert" className={`${styles.error} no-print`}>
          {exportError}
        </p>
      )}
      <InvoiceDocument invoice={invoice} company={company} />
    </>
  )
}
```

```css
.back {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--color-muted);
  font-size: 13px;
}

.error {
  margin-bottom: 12px;
  padding: 8px 12px;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  background: #fef2f2;
  color: var(--color-danger);
}
```

- [ ] **Step 7: Add the route** in `src/routes.tsx`:

```tsx
import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/invoices" replace /> },
      { path: 'invoices', element: <InvoiceListPage /> },
      { path: 'invoices/:invoiceId', element: <InvoiceDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
```

- [ ] **Step 8: Run the tests and confirm they pass**

Run: `npx vitest run src/pages`
Expected: PASS (14 tests).

- [ ] **Step 9: Check lint, typecheck, and that jsPDF is code-split**

Run: `npm run lint && npm run build && ls dist/assets`
Expected: lint and build succeed, and `dist/assets` contains separate chunks for jsPDF / autotable next to the main `index-*.js`.

- [ ] **Step 10: Commit**

```bash
git add src/components/LineItemsTable.tsx src/components/InvoiceSummary.tsx src/components/InvoiceSummary.module.css src/components/InvoiceDocument.tsx src/components/InvoiceDocument.module.css src/pages/InvoiceDetailPage.tsx src/pages/InvoiceDetailPage.module.css src/pages/InvoiceDetailPage.test.tsx src/routes.tsx
git commit -m "feat: add invoice detail page with print and PDF export"
```

---

### Task 9: CI workflow, CLAUDE.md and README

**Files:**
- Create: `.github/workflows/ci.yml`, `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:

jobs:
  checks:
    name: Lint, typecheck and test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```

- [ ] **Step 2: Write `CLAUDE.md`**

````markdown
# Pocket Invoice

Small React + TypeScript app used to demo [Retask](https://app.retask.work). It has an invoice list page and an invoice detail page with Print and Export PDF. All data comes from TypeScript mocks.

## Commands

- `npm run dev`: start the dev server
- `npm run build`: typecheck, then build to `dist/`
- `npm run lint`: ESLint
- `npm run typecheck`: `tsc -b`
- `npm test`: Vitest, single run (`npm run test:watch` to watch)

## Retask

- Always run the Retask CLI with the demo profile: `retask --profile demo …`
- Project **Pocket Invoice**: key `PI`, id `f49dfa4d-5466-4f1f-a5b9-9222f1a429be`, workspace `79164863-f1f9-492d-bf72-211edcea17de`
- Useful commands:
  - `retask --profile demo task list --project-id f49dfa4d-5466-4f1f-a5b9-9222f1a429be --pretty`
  - `retask --profile demo task get-by-key PI-1`
  - `retask --profile demo project-config get f49dfa4d-5466-4f1f-a5b9-9222f1a429be` (status ids: `backlog`, `todo`, `in-progress`, `in-review`, `done`, `cancelled`)
- The board is a curated demo state. Treat it as **read-only**: don't change statuses or assignees, and don't post comments, unless explicitly asked.

## Demo seed: keep the code in sync with the board

- **PI-1 (Todo, hero task):** `calculateTotal()` in `src/lib/invoice.ts` deliberately ignores `discount`, and `src/lib/invoice.test.ts` has one failing test, "applies the discount to the total". Don't fix this unless you are working on PI-1. On `main`, `npm test` is expected to report exactly that one failure. No other test may assert a discounted total.
- **PI-2 (empty state), PI-3 (overdue badge):** Todo and not built. Only add them when working on those tasks.
- **PI-4 (customer search), PI-5 (date-fns):** In Progress and not in `main`. Dates are formatted with `Intl` in `src/lib/format.ts`.
- **PI-9 (multi-currency), PI-10 (recurring):** Backlog. All amounts are USD.
- **PI-6 (PDF export), PI-7 (CI), PI-8 (invoice list):** built. CI (`.github/workflows/ci.yml`) runs on pull requests only.

## Structure

```
src/
  mocks/        all mock data (company, customers, invoices); add data here
  services/     invoiceService: the only code that reads mocks
  types/        domain types
  lib/          pure logic: invoice math, format, pagination, summary, pdf
  components/   UI building blocks (each with a .module.css)
  pages/        InvoiceListPage, InvoiceDetailPage, NotFoundPage
  styles/       global.css (tokens, print rules), table.module.css
  test/         Vitest setup and renderRoute() helper
  routes.tsx    route objects shared by App and tests
```

## Conventions

- **Mock data:** add it in `src/mocks/`; the types in `src/types/invoice.ts` enforce the shape. Invoices reference customers by object (`customers.fabrikam`), and mock emails use the `.example` domain.
- **Data access:** pages and components never import `src/mocks/`. They go through `src/services/invoiceService.ts`, which is the only file to change when a real API arrives.
- **Shared logic:** money math is in `src/lib/invoice.ts`. The page and the PDF share `getSummaryLines()` from `src/lib/summary.ts`. jsPDF is loaded lazily inside `src/lib/pdf.ts`.
- **Styling:** each component has a matching CSS Module. Design tokens live in `src/styles/global.css`. Add the `no-print` class to anything that shouldn't be printed.
- **Code style:** named exports, no semicolons, single quotes.
- **Tests:** they sit next to the code as `*.test.ts(x)`, and page-level tests use `renderRoute(path)`. Tests run with `TZ=America/New_York`, so always format ISO dates with `formatDate()` and never with `new Date('YYYY-MM-DD')`.
````

- [ ] **Step 3: Replace `README.md`**

````markdown
# Pocket Invoice

Pocket Invoice: demo of [Retask.work](https://app.retask.work) usage.

A small React + TypeScript app with an invoice list and an invoice detail page. The detail page can print the invoice or export it as a PDF. All data comes from TypeScript mock files in `src/mocks/`.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript project check |
| `npm test` | Run the Vitest suite once |

> **Demo note:** one test fails on purpose. It belongs to Retask task PI-1 ("invoice total ignores discount"); see `CLAUDE.md`.
````

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml CLAUDE.md README.md
git commit -m "chore: add CI workflow and project docs"
```

---

### Task 10: Final verification, browser check and pull request

- [ ] **Step 1: Run the full check suite**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all succeed.

Run: `npm test`
Expected: exactly **1 failed** test (`src/lib/invoice.test.ts > calculateTotal > applies the discount to the total`); every other test passes.

- [ ] **Step 2: Check the app in the browser.** Start `npm run dev`, then:
  - Open `/`. It should redirect to `/invoices` and show 10 rows and "Showing 1–10 of 24".
  - Page 2 and 3 should work.
  - Open INV-0022. Check the parties, the line items, the summary, and that the total shows the seeded $3,600.00.
  - Click **Export PDF** and confirm `INV-0022.pdf` downloads.
  - Don't click Print: the native print dialog blocks browser automation. Its behaviour is covered by the unit test and the print CSS.
  - Check `/invoices/nope` and `/nope`.

- [ ] **Step 3: Confirm the Retask board is unchanged** with `retask --profile demo task list --project-id f49dfa4d-5466-4f1f-a5b9-9222f1a429be` (read-only).

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feature/pocket-invoice-app
gh pr create --base main --title "Pocket Invoice demo app: invoice list, detail, print and PDF export" --body-file "$SCRATCHPAD/pr-body.md"
```

The PR body must mention:
- which Retask tasks it covers (PI-6, PI-7, PI-8);
- the PI-1 seed and the expected single failing test (so the CI test step fails on this PR by design);
- how to run the app;
- the attribution line.
