import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '../components/Button'
import { DownloadIcon, PrinterIcon } from '../components/icons'
import { InvoiceDocument } from '../components/InvoiceDocument'
import { PageHeader } from '../components/PageHeader'
import { StatusChip } from '../components/StatusChip'
import { exportInvoicePdf } from '../lib/pdf'
import { getCompany, getInvoiceById } from '../services/invoiceService'
import styles from './InvoiceDetailPage.module.css'
import { NotFoundPage } from './NotFoundPage'

export function InvoiceDetailPage() {
  const { invoiceId = '' } = useParams()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const invoice = getInvoiceById(invoiceId)

  if (!invoice) {
    return <NotFoundPage title="Invoice not found" message={`We could not find invoice "${invoiceId}".`} />
  }

  const company = getCompany()

  // An arrow function (not a hoisted declaration) keeps `invoice` narrowed
  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      await exportInvoicePdf(invoice, company)
    } catch {
      setExportError('Could not export the PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <Link to="/invoices" className={`${styles.back} no-print`}>
        <span aria-hidden="true">← </span>Back to invoices
      </Link>
      <PageHeader
        title={invoice.number}
        badge={<StatusChip status={invoice.status} />}
        actions={
          <>
            <Button onClick={() => window.print()}>
              <PrinterIcon />
              Print
            </Button>
            <Button variant="primary" disabled={isExporting} onClick={handleExport}>
              <DownloadIcon />
              {isExporting ? 'Exporting…' : 'Export PDF'}
            </Button>
          </>
        }
      />
      {exportError && (
        <p role="alert" className={`${styles.error} no-print`}>
          {exportError}
        </p>
      )}
      <InvoiceDocument invoice={invoice} company={company} />
    </>
  )
}
