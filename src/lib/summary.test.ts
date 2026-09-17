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
