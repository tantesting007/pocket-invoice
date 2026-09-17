import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from './test/renderRoute'

describe('routes', () => {
  it('redirects / to /invoices', async () => {
    const { router } = renderRoute('/')
    await waitFor(() => expect(router.state.location.pathname).toBe('/invoices'))
  })

  it('shows the not found page for unknown paths', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to invoices' })).toHaveAttribute('href', '/invoices')
  })

  it('renders the app header with the brand and company', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('link', { name: 'Pocket Invoice' })).toHaveAttribute('href', '/invoices')
    expect(screen.getByText('NWEB Studio')).toBeInTheDocument()
  })
})
