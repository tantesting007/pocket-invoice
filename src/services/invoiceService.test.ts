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
