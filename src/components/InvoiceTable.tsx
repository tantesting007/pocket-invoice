import { Link, useNavigate } from 'react-router'
import { formatCurrency, formatDate } from '../lib/format'
import { calculateTotal } from '../lib/invoice'
import tableStyles from '../styles/table.module.css'
import type { Invoice } from '../types/invoice'
import styles from './InvoiceTable.module.css'
import { StatusChip } from './StatusChip'

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const navigate = useNavigate()

  return (
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <th scope="col">Invoice</th>
          <th scope="col">Customer</th>
          <th scope="col">Issued</th>
          <th scope="col">Due</th>
          <th scope="col" className={tableStyles.numeric}>
            Total
          </th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((invoice) => {
          const href = `/invoices/${invoice.id}`
          return (
            <tr key={invoice.id} className={styles.row} onClick={() => navigate(href)}>
              <td>
                <Link to={href} className={styles.number} onClick={(event) => event.stopPropagation()}>
                  {invoice.number}
                </Link>
              </td>
              <td>{invoice.customer.name}</td>
              <td>{formatDate(invoice.issueDate)}</td>
              <td>{formatDate(invoice.dueDate)}</td>
              <td className={tableStyles.numeric}>{formatCurrency(calculateTotal(invoice))}</td>
              <td>
                <StatusChip status={invoice.status} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
