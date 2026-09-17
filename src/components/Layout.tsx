import { Link, NavLink, Outlet } from 'react-router'
import { getCompany } from '../services/invoiceService'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <>
      <header className={`${styles.header} no-print`}>
        <Link to="/invoices" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            PI
          </span>
          Pocket Invoice
        </Link>
        <nav className={styles.nav}>
          <NavLink to="/invoices" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Invoices
          </NavLink>
          <span className={styles.company}>{getCompany().name}</span>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
