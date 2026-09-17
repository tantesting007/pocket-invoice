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
