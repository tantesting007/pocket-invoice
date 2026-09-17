import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatPercent, formatStatus } from './format'

describe('formatCurrency', () => {
  it('formats USD with separators and two decimals', () => {
    expect(formatCurrency(3300)).toBe('$3,300.00')
    expect(formatCurrency(12.5)).toBe('$12.50')
  })

  it('formats negative amounts', () => {
    expect(formatCurrency(-300)).toBe('-$300.00')
  })
})

describe('formatDate', () => {
  it('formats an ISO date as a short US date', () => {
    expect(formatDate('2026-09-08')).toBe('Sep 8, 2026')
  })

  it('does not shift the day in time zones behind UTC', () => {
    // Tests run with TZ=America/New_York (see vite.config.ts)
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026')
  })
})

describe('formatPercent', () => {
  it('formats a fraction as a percentage', () => {
    expect(formatPercent(0.1)).toBe('10%')
    expect(formatPercent(0.085)).toBe('8.5%')
  })
})

describe('formatStatus', () => {
  it('returns a readable label', () => {
    expect(formatStatus('draft')).toBe('Draft')
    expect(formatStatus('sent')).toBe('Sent')
    expect(formatStatus('paid')).toBe('Paid')
  })
})
