import { Navigate, type RouteObject } from 'react-router'
import { Layout } from './components/Layout'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/invoices" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
