import { formatStatus } from '../lib/format'
import type { InvoiceStatus } from '../types/invoice'
import styles from './StatusChip.module.css'

export function StatusChip({ status }: { status: InvoiceStatus }) {
  return <span className={`${styles.chip} ${styles[status]}`}>{formatStatus(status)}</span>
}
