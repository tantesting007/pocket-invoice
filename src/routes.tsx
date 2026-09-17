import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/invoices" replace /> },
      { path: 'invoices', element: <InvoiceListPage /> },
      { path: 'invoices/:invoiceId', element: <InvoiceDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
