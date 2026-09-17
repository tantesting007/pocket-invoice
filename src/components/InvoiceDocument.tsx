import { formatDate } from '../lib/format'
import type { Company, Invoice } from '../types/invoice'
import { Card } from './Card'
import styles from './InvoiceDocument.module.css'
import { InvoiceSummary } from './InvoiceSummary'
import { LineItemsTable } from './LineItemsTable'

interface InvoiceDocumentProps {
  invoice: Invoice
  company: Company
}

export function InvoiceDocument({ invoice, company }: InvoiceDocumentProps) {
  const { customer } = invoice

  return (
    <Card>
      <div className={styles.parties}>
        <address className={styles.party}>
          <h2 className={styles.label}>From</h2>
          <strong>{company.name}</strong>
          {company.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>{company.email}</span>
        </address>
        <address className={styles.party}>
          <h2 className={styles.label}>Bill to</h2>
          <strong>{customer.name}</strong>
          {customer.contact && <span>Attn: {customer.contact}</span>}
          {customer.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span>{customer.email}</span>
        </address>
        <dl className={styles.dates}>
          <div>
            <dt className={styles.label}>Issued</dt>
            <dd>{formatDate(invoice.issueDate)}</dd>
          </div>
          <div>
            <dt className={styles.label}>Due</dt>
            <dd>{formatDate(invoice.dueDate)}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.items}>
        <LineItemsTable items={invoice.items} />
      </div>
      <div className={styles.footer}>
        {invoice.notes && <p className={styles.notes}>{invoice.notes}</p>}
        <InvoiceSummary invoice={invoice} />
      </div>
    </Card>
  )
}
