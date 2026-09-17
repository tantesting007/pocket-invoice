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
