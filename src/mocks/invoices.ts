import type { Invoice } from '../types/invoice'
import { customers } from './customers'

export const invoices: Invoice[] = [
  {
    id: 'inv-0001', number: 'INV-0001', customer: customers.fabrikam,
    issueDate: '2026-01-14', dueDate: '2026-02-13', status: 'paid',
    items: [
      { id: 'li-1', description: 'Brand guidelines', quantity: 1, unitPrice: 1100 },
      { id: 'li-2', description: 'Logo refresh', quantity: 1, unitPrice: 600 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0002', number: 'INV-0002', customer: customers.contoso,
    issueDate: '2026-02-18', dueDate: '2026-03-20', status: 'paid',
    items: [
      { id: 'li-1', description: 'UX audit', quantity: 1, unitPrice: 1500 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0003', number: 'INV-0003', customer: customers.northwind,
    issueDate: '2026-03-20', dueDate: '2026-04-19', status: 'paid',
    items: [
      { id: 'li-1', description: 'Landing page build', quantity: 1, unitPrice: 1800 },
      { id: 'li-2', description: 'Content writing (pages)', quantity: 4, unitPrice: 150 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0004', number: 'INV-0004', customer: customers.blueYonder,
    issueDate: '2026-04-09', dueDate: '2026-05-09', status: 'paid',
    items: [
      { id: 'li-1', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-2', description: 'Analytics setup', quantity: 1, unitPrice: 500 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0005', number: 'INV-0005', customer: customers.wideWorld,
    issueDate: '2026-04-24', dueDate: '2026-05-24', status: 'paid',
    items: [
      { id: 'li-1', description: 'E-commerce integration', quantity: 1, unitPrice: 2200 },
      { id: 'li-2', description: 'Hosting setup (months)', quantity: 6, unitPrice: 100 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0006', number: 'INV-0006', customer: customers.adventureWorks,
    issueDate: '2026-05-08', dueDate: '2026-06-07', status: 'paid',
    items: [
      { id: 'li-1', description: 'Photography (half day)', quantity: 2, unitPrice: 650 },
      { id: 'li-2', description: 'Social media kit', quantity: 1, unitPrice: 450 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0007', number: 'INV-0007', customer: customers.tailspin,
    issueDate: '2026-05-21', dueDate: '2026-06-20', status: 'paid',
    items: [
      { id: 'li-1', description: 'Illustration pack', quantity: 1, unitPrice: 750 },
      { id: 'li-2', description: 'Newsletter template', quantity: 1, unitPrice: 350 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0008', number: 'INV-0008', customer: customers.fabrikam,
    issueDate: '2026-06-02', dueDate: '2026-07-02', status: 'paid',
    items: [
      { id: 'li-1', description: 'Maintenance retainer (hours)', quantity: 20, unitPrice: 85 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0009', number: 'INV-0009', customer: customers.contoso,
    issueDate: '2026-06-12', dueDate: '2026-07-12', status: 'paid',
    items: [
      { id: 'li-1', description: 'Website redesign', quantity: 1, unitPrice: 2400 },
      { id: 'li-2', description: 'Copy review (hours)', quantity: 5, unitPrice: 60 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0010', number: 'INV-0010', customer: customers.northwind,
    issueDate: '2026-06-22', dueDate: '2026-07-22', status: 'paid',
    items: [
      { id: 'li-1', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-2', description: 'Content writing (pages)', quantity: 6, unitPrice: 150 },
    ],
    discount: 100, taxRate: 0.1,
    notes: 'Returning-customer discount applied.',
  },
  {
    id: 'inv-0011', number: 'INV-0011', customer: customers.blueYonder,
    issueDate: '2026-06-30', dueDate: '2026-07-30', status: 'paid',
    items: [
      { id: 'li-1', description: 'Landing page build', quantity: 1, unitPrice: 1800 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0012', number: 'INV-0012', customer: customers.wideWorld,
    issueDate: '2026-07-08', dueDate: '2026-08-07', status: 'paid',
    items: [
      { id: 'li-1', description: 'Maintenance retainer (hours)', quantity: 12, unitPrice: 85 },
      { id: 'li-2', description: 'Analytics setup', quantity: 1, unitPrice: 500 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0013', number: 'INV-0013', customer: customers.adventureWorks,
    issueDate: '2026-07-15', dueDate: '2026-08-14', status: 'paid',
    items: [
      { id: 'li-1', description: 'UX audit', quantity: 1, unitPrice: 1500 },
      { id: 'li-2', description: 'Brand guidelines', quantity: 1, unitPrice: 1100 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0014', number: 'INV-0014', customer: customers.tailspin,
    issueDate: '2026-07-22', dueDate: '2026-08-21', status: 'paid',
    items: [
      { id: 'li-1', description: 'Social media kit', quantity: 2, unitPrice: 450 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0015', number: 'INV-0015', customer: customers.fabrikam,
    issueDate: '2026-07-29', dueDate: '2026-08-28', status: 'paid',
    items: [
      { id: 'li-1', description: 'E-commerce integration', quantity: 1, unitPrice: 2200 },
      { id: 'li-2', description: 'Photography (half day)', quantity: 2, unitPrice: 650 },
      { id: 'li-3', description: 'Copy review (hours)', quantity: 10, unitPrice: 60 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0016', number: 'INV-0016', customer: customers.contoso,
    issueDate: '2026-08-04', dueDate: '2026-09-03', status: 'paid',
    items: [
      { id: 'li-1', description: 'Newsletter template', quantity: 1, unitPrice: 350 },
      { id: 'li-2', description: 'Copy review (hours)', quantity: 9, unitPrice: 60 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0017', number: 'INV-0017', customer: customers.blueYonder,
    issueDate: '2026-08-10', dueDate: '2026-09-09', status: 'sent',
    items: [
      { id: 'li-1', description: 'Illustration pack', quantity: 1, unitPrice: 750 },
      { id: 'li-2', description: 'Photography (half day)', quantity: 1, unitPrice: 650 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0018', number: 'INV-0018', customer: customers.northwind,
    issueDate: '2026-08-15', dueDate: '2026-09-14', status: 'paid',
    items: [
      { id: 'li-1', description: 'Maintenance retainer (hours)', quantity: 16, unitPrice: 85 },
      { id: 'li-2', description: 'Hosting setup (months)', quantity: 6, unitPrice: 100 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0019', number: 'INV-0019', customer: customers.wideWorld,
    issueDate: '2026-08-22', dueDate: '2026-09-21', status: 'paid',
    items: [
      { id: 'li-1', description: 'E-commerce integration', quantity: 1, unitPrice: 2200 },
      { id: 'li-2', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-3', description: 'Analytics setup', quantity: 1, unitPrice: 500 },
    ],
    discount: 250, taxRate: 0.085,
    notes: 'Bundle discount for the launch package.',
  },
  {
    id: 'inv-0020', number: 'INV-0020', customer: customers.adventureWorks,
    issueDate: '2026-08-28', dueDate: '2026-09-11', status: 'sent',
    items: [
      { id: 'li-1', description: 'Landing page build', quantity: 1, unitPrice: 1800 },
      { id: 'li-2', description: 'Content writing (pages)', quantity: 8, unitPrice: 150 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0021', number: 'INV-0021', customer: customers.tailspin,
    issueDate: '2026-09-03', dueDate: '2026-10-03', status: 'paid',
    items: [
      { id: 'li-1', description: 'Social media kit', quantity: 1, unitPrice: 450 },
      { id: 'li-2', description: 'Newsletter template', quantity: 1, unitPrice: 350 },
    ],
    discount: 0, taxRate: 0.085,
  },
  {
    id: 'inv-0022', number: 'INV-0022', customer: customers.fabrikam,
    issueDate: '2026-09-08', dueDate: '2026-09-22', status: 'sent',
    items: [
      { id: 'li-1', description: 'Website redesign', quantity: 1, unitPrice: 2400 },
      { id: 'li-2', description: 'Logo refresh', quantity: 1, unitPrice: 600 },
      { id: 'li-3', description: 'Hosting setup (months)', quantity: 3, unitPrice: 100 },
    ],
    discount: 300, taxRate: 0.1,
    notes: '10% loyalty discount on design work.',
  },
  {
    id: 'inv-0023', number: 'INV-0023', customer: customers.contoso,
    issueDate: '2026-09-12', dueDate: '2026-10-12', status: 'draft',
    items: [
      { id: 'li-1', description: 'UX audit', quantity: 1, unitPrice: 1500 },
    ],
    discount: 0, taxRate: 0.1,
  },
  {
    id: 'inv-0024', number: 'INV-0024', customer: customers.northwind,
    issueDate: '2026-09-15', dueDate: '2026-10-15', status: 'sent',
    items: [
      { id: 'li-1', description: 'Website redesign', quantity: 1, unitPrice: 2400 },
      { id: 'li-2', description: 'SEO optimization', quantity: 1, unitPrice: 900 },
      { id: 'li-3', description: 'Content writing (pages)', quantity: 4, unitPrice: 150 },
    ],
    discount: 0, taxRate: 0.1,
    notes: 'Payment by bank transfer within 30 days.',
  },
]
