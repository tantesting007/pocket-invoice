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
