# Pocket Invoice — App Design

**Date:** 2026-09-17
**Retask project:** Pocket Invoice (key `PI`, profile `demo`)
**Status:** Approved in chat and in the visual mockup (sender renamed to "NWEB Studio")

## Purpose

A small React + TypeScript front-end used to demo Retask. It has two pages: an
invoice list and an invoice detail page with Print and Export PDF. All data
comes from TypeScript mock files. The code state must match the curated Retask
board so that open tasks can be picked up live during a demo.

## Scope vs. the Retask board

| Task | Board status | In this build |
|------|--------------|---------------|
| PI-8 Invoice list page (paginated, status chips) | Done | **Built** |
| PI-6 PDF export for invoices (branded PDF) | In Review | **Built**, plus Print |
| PI-7 CI with GitHub Actions (lint, typecheck, test on every PR) | Done | **Built** |
| PI-1 Fix: invoice total ignores discount (HERO) | Todo | **Seeded bug + one failing test** |
| PI-2 Empty state on Invoices page | Todo | Not built |
| PI-3 Overdue badge on invoice rows | Todo | Not built |
| PI-4 Customer search with debounce | In Progress | Not in `main` yet |
| PI-5 Migrate dates to date-fns | In Progress | Not in `main` yet (dates use `Intl`; no moment.js) |
| PI-9 Multi-currency, PI-10 Recurring invoices | Backlog | Not built (all amounts are USD) |

The Retask board is **read-only** for this work: no status changes and no comments.

## Stack

- Vite + React 19 + TypeScript (scaffolded from the `react-ts` template)
- React Router (data router: `createBrowserRouter` / `createMemoryRouter` in tests)
- CSS Modules per component + one `styles/global.css` (tokens, base, print rules); no UI library
- jsPDF + jspdf-autotable for PDF generation, loaded lazily on first export
- Vitest + jsdom + Testing Library; ESLint (template config); `tsc` for typecheck

## Routes

| Path | Page |
|------|------|
| `/` | Redirect to `/invoices` |
| `/invoices?page=N` | `InvoiceListPage` |
| `/invoices/:invoiceId` | `InvoiceDetailPage` |
| `*` | `NotFoundPage` |

## Structure

```
src/
  main.tsx                 – mounts <App/>
  App.tsx                  – RouterProvider with a browser router
  routes.tsx               – route objects (shared by the app and by tests)
  types/invoice.ts         – Company, Customer, LineItem, Invoice, InvoiceStatus
  mocks/                   – ALL mock data (TypeScript) — add more data here
    index.ts               – re-exports
    company.ts             – the sender: NWEB Studio
    customers.ts           – customers keyed by id
    invoices.ts            – 24 invoices, each referencing a customer object
  services/
    invoiceService.ts      – getInvoices(), getInvoiceById(id), getCompany()
  lib/
    invoice.ts             – money math (PI-1 bug lives here)
    format.ts              – formatCurrency, formatDate, formatPercent
    pagination.ts          – paginate()
    summary.ts             – getSummaryLines(invoice), shared by the UI and the PDF
    pdf.ts                 – buildInvoicePdf / exportInvoicePdf(invoice, company)
  components/              – Layout, PageHeader, Button, Card, StatusChip, Pagination,
                             InvoiceTable, InvoiceDocument, LineItemsTable, InvoiceSummary, icons
  pages/                   – InvoiceListPage, InvoiceDetailPage, NotFoundPage
  styles/global.css        – tokens, base styles, print rules
  styles/table.module.css  – shared table styles
  test/setup.ts            – jest-dom matchers
  test/renderRoute.tsx     – renders the app at a URL (memory router)
.github/workflows/ci.yml
CLAUDE.md
```

Components are flat files, each with a matching `.module.css` when it has styles.
Pages never import from `mocks/`; they only go through `services/`.

## Data model

```ts
type InvoiceStatus = 'draft' | 'sent' | 'paid';

interface Company  { name: string; addressLines: string[]; email: string }
interface Customer { id: string; name: string; contact?: string; addressLines: string[]; email: string }
interface LineItem { id: string; description: string; quantity: number; unitPrice: number }
interface Invoice {
  id: string;            // URL id, e.g. "inv-0022"
  number: string;        // display number, e.g. "INV-0022"
  customer: Customer;    // object imported from mocks/customers.ts
  issueDate: string;     // ISO "YYYY-MM-DD"
  dueDate: string;       // ISO "YYYY-MM-DD"
  status: InvoiceStatus;
  items: LineItem[];
  discount: number;      // flat USD amount, subtracted before tax
  taxRate: number;       // 0.1 = 10%
  notes?: string;
}
```

Mock contact emails use the reserved `.example` domain. Sender: **NWEB Studio**,
120 Market Street, Suite 400, San Francisco, CA 94105, `billing@nweb.example`.
Invoice `inv-0022` (Fabrikam Inc.) matches the mockup: subtotal $3,300, discount
$300, tax 10%. A few other invoices also have discounts.

## Money math (`lib/invoice.ts`)

- `calculateLineAmount(item)` = `quantity × unitPrice`
- `calculateSubtotal(items)` = sum of line amounts
- `calculateTax(invoice)` = `roundMoney((subtotal − discount) × taxRate)` — correct
- `calculateTotal(invoice)` = **`subtotal + tax`** — **seeded PI-1 bug** (the correct
  value is `subtotal − discount + tax`)
- `getInvoiceTotals(invoice)` → `{ subtotal, discount, tax, total }`, used by both
  the UI summary and the PDF, so the bug shows in both places
- `roundMoney(n)` rounds to cents

## Behaviour

**List page:**
- Shows invoices sorted by issue date, newest first, 10 per page.
- The page number comes from `?page`. Missing or invalid values fall back to page 1,
  and values beyond the last page are clamped to the last page.
- Columns: Invoice (a link), Customer, Issued, Due, Total, Status chip.
- Clicking a row opens the invoice.
- The footer shows "Showing X–Y of N" plus Prev / numbered / Next buttons. They update `?page`.

**Detail page:**
- A back link to `/invoices`, then the header: invoice number, status chip, and **Print**
  and **Export PDF** buttons.
- The invoice card (`InvoiceDocument`) shows From / Bill to / Issued / Due, the line
  items, and the summary (Subtotal, Discount, Tax (rate), Total). The Discount line
  appears only when the discount is greater than 0.
- An unknown id shows "Invoice not found" with a link back to the list.

**Print:** `window.print()`. Print CSS hides everything marked `.no-print`
(app header, back link, action buttons), removes the page background and card
shadow, and sets `@page { margin: 16mm }`.

**Export PDF:**
- `exportInvoicePdf(invoice, company)` loads `jspdf` and `jspdf-autotable` with a
  dynamic import and draws an A4 page:
  - a purple (`#7C3AED`) band with "Pocket Invoice" / "INVOICE" and the invoice number;
  - From / Bill to / Issued / Due / Status;
  - a line-items table with a purple header row and zebra rows;
  - the totals and a "Thank you for your business!" footer.
- The file is saved as `<number>.pdf`.
- The button is disabled while the export runs. If the export fails, the page shows an
  inline error message.

## Testing

| File | Covers |
|------|--------|
| `lib/invoice.test.ts` | Subtotal, tax on the discounted base, total without discount (pass); **"applies the discount to the total" (fails on purpose — PI-1)** |
| `lib/format.test.ts` | USD formatting; ISO dates are not shifted by time zone (tests run with `TZ=America/New_York`) |
| `lib/pagination.test.ts` | Slicing, bounds, clamping, empty lists |
| `lib/summary.test.ts` | Summary lines with and without a discount (it doesn't assert a discounted total) |
| `lib/pdf.test.ts` | Checks the generated PDF text (`doc.output()`), the line-item rows passed to autoTable, and that the file is saved as `<number>.pdf` (jsPDF is replaced with a subclass that records calls) |
| `components/Pagination.test.tsx`, `routes.test.tsx` | Pagination buttons; redirect, not-found page, header |
| `services/invoiceService.test.ts` | Sort order, lookup by id, unknown id, unique ids/numbers |
| `pages/InvoiceListPage.test.tsx` | 10 rows on page 1, next page, `?page` clamping, row click opens the details page |
| `pages/InvoiceDetailPage.test.tsx` | Renders the invoice; Print calls `window.print`; Export calls `exportInvoicePdf` (mocked); unknown id shows not found |

No test other than the PI-1 test may assert the discounted total. Expected result
on `main`: **exactly one failing test**. Lint, typecheck and build all pass.

## CI (PI-7)

`.github/workflows/ci.yml` runs on `pull_request`: `npm ci`, `npm run lint`,
`npm run typecheck`, `npm test`. It uses Node 24. It does not run on pushes to
`main`, so `main` shows no red check; the PI-1 PR turns CI green.

## CLAUDE.md

Records the following:
- Retask usage: always `--profile demo`, project `PI` / id, the board is read-only by default.
- Demo-seed rules: don't fix PI-1 or build PI-2 / PI-3 unless working on that task.
- The mock-data conventions and the project commands.
