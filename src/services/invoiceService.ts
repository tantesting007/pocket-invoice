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
