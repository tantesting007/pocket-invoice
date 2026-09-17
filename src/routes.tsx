import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/invoices" replace /> },
      { path: 'invoices', element: <InvoiceListPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
