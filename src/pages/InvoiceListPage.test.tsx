import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/renderRoute'

function bodyRows() {
  const [, body] = screen.getAllByRole('rowgroup')
  return within(body).getAllByRole('row')
}

describe('InvoiceListPage', () => {
  it('shows the first 10 invoices, newest first', () => {
    renderRoute('/invoices')
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByText('24 invoices')).toBeInTheDocument()

    const rows = bodyRows()
    expect(rows).toHaveLength(10)
    expect(rows[0]).toHaveTextContent('INV-0024')
    expect(rows[0]).toHaveTextContent('Northwind Traders')
    expect(rows[0]).toHaveTextContent('Sep 15, 2026')
    expect(rows[0]).toHaveTextContent('Oct 15, 2026')
    expect(rows[0]).toHaveTextContent('$4,290.00')
    expect(rows[0]).toHaveTextContent('Sent')
    expect(rows[9]).toHaveTextContent('INV-0015')
    expect(screen.getByText('Showing 1–10 of 24')).toBeInTheDocument()
  })

  it('links each invoice number to its detail page', () => {
    renderRoute('/invoices')
    expect(within(bodyRows()[0]).getByRole('link', { name: 'INV-0024' })).toHaveAttribute(
      'href',
      '/invoices/inv-0024',
    )
  })

  it('moves to the next page', async () => {
    const { router } = renderRoute('/invoices')
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(router.state.location.search).toBe('?page=2')
    expect(bodyRows()[0]).toHaveTextContent('INV-0014')
    expect(screen.getByText('Showing 11–20 of 24')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('reads the page from the URL and clamps it to the last page', () => {
    renderRoute('/invoices?page=99')
    expect(bodyRows()).toHaveLength(4)
    expect(screen.getByText('Showing 21–24 of 24')).toBeInTheDocument()
  })

  it('falls back to the first page for an invalid page', () => {
    renderRoute('/invoices?page=abc')
    expect(screen.getByText('Showing 1–10 of 24')).toBeInTheDocument()
  })

  it('opens an invoice when its row is clicked', async () => {
    const { router } = renderRoute('/invoices')
    await userEvent.click(within(bodyRows()[2]).getByText('Fabrikam Inc.'))
    expect(router.state.location.pathname).toBe('/invoices/inv-0022')
  })
})
