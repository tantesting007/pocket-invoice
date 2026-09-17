import { formatCurrency } from '../lib/format'
import { calculateLineAmount } from '../lib/invoice'
import tableStyles from '../styles/table.module.css'
import type { LineItem } from '../types/invoice'

export function LineItemsTable({ items }: { items: LineItem[] }) {
  return (
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col" className={tableStyles.numeric}>
            Qty
          </th>
          <th scope="col" className={tableStyles.numeric}>
            Unit price
          </th>
          <th scope="col" className={tableStyles.numeric}>
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.description}</td>
            <td className={tableStyles.numeric}>{item.quantity}</td>
            <td className={tableStyles.numeric}>{formatCurrency(item.unitPrice)}</td>
            <td className={tableStyles.numeric}>{formatCurrency(calculateLineAmount(item))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
