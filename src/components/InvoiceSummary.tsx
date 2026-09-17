import { getSummaryLines } from '../lib/summary'
import type { Invoice } from '../types/invoice'
import styles from './InvoiceSummary.module.css'

export function InvoiceSummary({ invoice }: { invoice: Invoice }) {
  const { lines, total } = getSummaryLines(invoice)

  return (
    <dl className={styles.summary} aria-label="Invoice summary">
      {lines.map((line) => (
        <div key={line.label} className={styles.line}>
          <dt>{line.label}</dt>
          <dd>{line.value}</dd>
        </div>
      ))}
      <div className={`${styles.line} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{total}</dd>
      </div>
    </dl>
  )
}
