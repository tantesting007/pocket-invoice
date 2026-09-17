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
