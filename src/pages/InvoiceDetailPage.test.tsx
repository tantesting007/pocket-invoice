import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { exportInvoicePdf } from '../lib/pdf'
import { getCompany, getInvoiceById } from '../services/invoiceService'
import { renderRoute } from '../test/renderRoute'

vi.mock('../lib/pdf', () => ({ exportInvoicePdf: vi.fn() }))

function sectionOf(heading: string) {
  return screen.getByRole('heading', { name: heading }).parentElement!
}

describe('InvoiceDetailPage', () => {
  it('shows the invoice header, parties and dates', () => {
    renderRoute('/invoices/inv-0022')
    expect(screen.getByRole('heading', { level: 1, name: 'INV-0022' })).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
    expect(sectionOf('From')).toHaveTextContent('NWEB Studio')
    expect(sectionOf('From')).toHaveTextContent('billing@nweb.example')
    expect(sectionOf('Bill to')).toHaveTextContent('Fabrikam Inc.')
    expect(sectionOf('Bill to')).toHaveTextContent('Attn: Accounts Payable')
    expect(screen.getByText('Sep 8, 2026')).toBeInTheDocument()
    expect(screen.getByText('Sep 22, 2026')).toBeInTheDocument()
    expect(screen.getByText('10% loyalty discount on design work.')).toBeInTheDocument()
  })

  it('shows the line items and summary figures', () => {
    renderRoute('/invoices/inv-0022')
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(rows[1]).toHaveTextContent('Website redesign1$2,400.00$2,400.00')
    expect(rows[3]).toHaveTextContent('Hosting setup (months)3$100.00$300.00')

    const summary = screen.getByLabelText('Invoice summary')
    expect(summary).toHaveTextContent('Subtotal$3,300.00')
    expect(summary).toHaveTextContent('Discount-$300.00')
    expect(summary).toHaveTextContent('Tax (10%)$300.00')
    expect(summary).toHaveTextContent('Total')
  })

  it('links back to the invoice list', () => {
    renderRoute('/invoices/inv-0022')
    expect(screen.getByRole('link', { name: 'Back to invoices' })).toHaveAttribute('href', '/invoices')
  })

  it('prints the page', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Print' }))
    expect(print).toHaveBeenCalledOnce()
  })

  it('exports the invoice as a PDF', async () => {
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    expect(exportInvoicePdf).toHaveBeenCalledExactlyOnceWith(getInvoiceById('inv-0022'), getCompany())
    expect(await screen.findByRole('button', { name: 'Export PDF' })).toBeEnabled()
  })

  it('disables the export button while exporting', async () => {
    let finish!: () => void
    vi.mocked(exportInvoicePdf).mockImplementationOnce(
      () => new Promise<void>((resolve) => (finish = resolve)),
    )
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    expect(screen.getByRole('button', { name: 'Exporting…' })).toBeDisabled()

    await act(async () => finish())
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeEnabled()
  })

  it('shows an error when the export fails', async () => {
    vi.mocked(exportInvoicePdf).mockRejectedValueOnce(new Error('boom'))
    renderRoute('/invoices/inv-0022')
    await userEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not export the PDF. Please try again.')
  })

  it('shows not found for an unknown invoice', () => {
    renderRoute('/invoices/inv-9999')
    expect(screen.getByRole('heading', { name: 'Invoice not found' })).toBeInTheDocument()
    expect(screen.getByText('We could not find invoice "inv-9999".')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Print' })).not.toBeInTheDocument()
  })
})
