# Pocket Invoice

Small React + TypeScript app used to demo [Retask](https://app.retask.work). It has an invoice list page and an invoice detail page with Print and Export PDF. All data comes from TypeScript mocks.

## Commands

- `npm run dev`: start the dev server
- `npm run build`: typecheck, then build to `dist/`
- `npm run lint`: ESLint
- `npm run typecheck`: `tsc -b`
- `npm test`: Vitest, single run (`npm run test:watch` to watch)

## Retask

- Project **Pocket Invoice**: key `PI`, id `f49dfa4d-5466-4f1f-a5b9-9222f1a429be`, workspace `79164863-f1f9-492d-bf72-211edcea17de`
- Useful commands:
  - `retask task list --project-id f49dfa4d-5466-4f1f-a5b9-9222f1a429be --pretty`
  - `retask task get-by-key PI-1`
  - `retask project-config get f49dfa4d-5466-4f1f-a5b9-9222f1a429be` (status ids: `backlog`, `todo`, `in-progress`, `in-review`, `done`, `cancelled`)
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
