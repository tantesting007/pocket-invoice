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
