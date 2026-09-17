export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface Company {
  name: string
  addressLines: string[]
  email: string
}

export interface Customer {
  id: string
  name: string
  contact?: string
  addressLines: string[]
  email: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  /** URL id, e.g. "inv-0022" */
  id: string
  /** Display number, e.g. "INV-0022" */
  number: string
  customer: Customer
  /** ISO date, "YYYY-MM-DD" */
  issueDate: string
  /** ISO date, "YYYY-MM-DD" */
  dueDate: string
  status: InvoiceStatus
  items: LineItem[]
  /** Flat USD amount, subtracted before tax */
  discount: number
  /** Fraction, e.g. 0.1 for 10% */
  taxRate: number
  notes?: string
}
