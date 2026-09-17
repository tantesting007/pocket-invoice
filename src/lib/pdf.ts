import type { jsPDF } from 'jspdf'
import type { Company, Invoice } from '../types/invoice'
import { formatCurrency, formatDate, formatStatus } from './format'
import { calculateLineAmount } from './invoice'
import { getSummaryLines } from './summary'

type Rgb = [number, number, number]

const BRAND: Rgb = [124, 58, 237]
const TEXT: Rgb = [31, 41, 55]
const MUTED: Rgb = [107, 114, 128]
const BORDER: Rgb = [229, 231, 235]
const ZEBRA: Rgb = [247, 245, 253]
const WHITE: Rgb = [255, 255, 255]
const MARGIN = 40
const SUMMARY_WIDTH = 190

/** Draws the invoice as a branded A4 PDF. jsPDF is loaded on first use. */
export async function buildInvoicePdf(invoice: Invoice, company: Company): Promise<jsPDF> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const right = pageWidth - MARGIN
  const { customer } = invoice

  // Header band
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Pocket Invoice', MARGIN, 52)
  doc.setFontSize(14)
  doc.text('INVOICE', right, 44, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(invoice.number, right, 62, { align: 'right' })

  // Parties and dates
  drawBlock(doc, 'From', [company.name, ...company.addressLines, company.email], MARGIN, 130)
  drawBlock(
    doc,
    'Bill to',
    [
      customer.name,
      ...(customer.contact ? [`Attn: ${customer.contact}`] : []),
      ...customer.addressLines,
      customer.email,
    ],
    MARGIN + 190,
    130,
  )
  drawBlock(
    doc,
    'Details',
    [
      `Issued: ${formatDate(invoice.issueDate)}`,
      `Due: ${formatDate(invoice.dueDate)}`,
      `Status: ${formatStatus(invoice.status)}`,
    ],
    right,
    130,
    'right',
  )

  // Line items
  autoTable(doc, {
    startY: 230,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Description', 'Qty', 'Unit price', 'Amount']],
    body: invoice.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(calculateLineAmount(item)),
    ]),
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, textColor: TEXT, cellPadding: 6 },
    headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: ZEBRA },
    columnStyles: { 1: { cellWidth: 50 }, 2: { cellWidth: 90 }, 3: { cellWidth: 90 } },
    didParseCell: ({ column, cell }) => {
      if (column.index > 0) cell.styles.halign = 'right'
    },
  })
  const tableBottom = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  // Notes (left) and summary (right)
  let y = tableBottom + 28
  if (invoice.notes) {
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text(invoice.notes, MARGIN, y, { maxWidth: right - SUMMARY_WIDTH - MARGIN - 30 })
  }

  const summary = getSummaryLines(invoice)
  const labelX = right - SUMMARY_WIDTH
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  for (const line of summary.lines) {
    doc.setTextColor(...MUTED)
    doc.text(line.label, labelX, y)
    doc.setTextColor(...TEXT)
    doc.text(line.value, right, y, { align: 'right' })
    y += 18
  }
  doc.setDrawColor(...BORDER)
  doc.line(labelX, y - 8, right, y - 8)
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...TEXT)
  doc.text('Total', labelX, y)
  doc.text(summary.total, right, y, { align: 'right' })

  // Footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 40, { align: 'center' })

  return doc
}

/** Builds the invoice PDF and downloads it as "<number>.pdf". */
export async function exportInvoicePdf(invoice: Invoice, company: Company): Promise<void> {
  const doc = await buildInvoicePdf(invoice, company)
  doc.save(`${invoice.number}.pdf`)
}

function drawBlock(
  doc: jsPDF,
  label: string,
  lines: string[],
  x: number,
  y: number,
  align: 'left' | 'right' = 'left',
) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(label.toUpperCase(), x, y, { align })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...TEXT)
  lines.forEach((line, index) => doc.text(line, x, y + 18 + index * 14, { align }))
}
