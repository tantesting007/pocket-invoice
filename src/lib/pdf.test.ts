import { autoTable } from 'jspdf-autotable'
import { describe, expect, it, vi } from 'vitest'
import { getCompany, getInvoiceById } from '../services/invoiceService'
import { buildInvoicePdf, exportInvoicePdf } from './pdf'

const savedFiles = vi.hoisted(() => [] as string[])

// jsPDF attaches methods per instance, so replace the class with a subclass that records save()
vi.mock('jspdf', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jspdf')>()
  class RecordingPdf extends actual.jsPDF {
    constructor(...args: ConstructorParameters<typeof actual.jsPDF>) {
      super(...args)
      this.save = ((filename: string) => {
        savedFiles.push(filename)
      }) as typeof this.save
    }
  }
  return { ...actual, jsPDF: RecordingPdf }
})
vi.mock('jspdf-autotable', { spy: true })

const invoice = getInvoiceById('inv-0022')!
const company = getCompany()

describe('buildInvoicePdf', () => {
  it('writes the branded header, parties, summary and footer', async () => {
    const output = (await buildInvoicePdf(invoice, company)).output()
    for (const text of [
      'Pocket Invoice',
      'INVOICE',
      'INV-0022',
      'NWEB Studio',
      'Fabrikam Inc.',
      'Sep 8, 2026',
      'Sep 22, 2026',
      'Subtotal',
      '$3,300.00',
      'Discount',
      '-$300.00',
      '10% loyalty discount on design work.',
      'Thank you for your business!',
    ]) {
      expect(output).toContain(text)
    }
  })

  it('renders every line item in the table', async () => {
    await buildInvoicePdf(invoice, company)
    const options = vi.mocked(autoTable).mock.calls[0][1]
    expect(options.head).toEqual([['Description', 'Qty', 'Unit price', 'Amount']])
    expect(options.body).toEqual([
      ['Website redesign', '1', '$2,400.00', '$2,400.00'],
      ['Logo refresh', '1', '$600.00', '$600.00'],
      ['Hosting setup (months)', '3', '$100.00', '$300.00'],
    ])
  })
})

describe('exportInvoicePdf', () => {
  it('saves the PDF named after the invoice number', async () => {
    savedFiles.length = 0
    await exportInvoicePdf(invoice, company)
    expect(savedFiles).toEqual(['INV-0022.pdf'])
  })
})
