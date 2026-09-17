import { useSearchParams } from 'react-router'
import { Card } from '../components/Card'
import { InvoiceTable } from '../components/InvoiceTable'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { paginate } from '../lib/pagination'
import { getInvoices } from '../services/invoiceService'
import styles from './InvoiceListPage.module.css'

const PAGE_SIZE = 10

export function InvoiceListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const current = paginate(getInvoices(), Number(searchParams.get('page') ?? 1), PAGE_SIZE)

  const goToPage = (page: number) => setSearchParams({ page: String(page) })

  return (
    <>
      <PageHeader title="Invoices" subtitle={`${current.totalItems} invoices`} />
      <Card>
        <div className={styles.tableScroll}>
          <InvoiceTable invoices={current.items} />
        </div>
        <div className={styles.footer}>
          <span>
            Showing {current.firstItem}–{current.lastItem} of {current.totalItems}
          </span>
          <Pagination page={current.page} totalPages={current.totalPages} onPageChange={goToPage} />
        </div>
      </Card>
    </>
  )
}
