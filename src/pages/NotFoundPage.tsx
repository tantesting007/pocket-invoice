import { Link } from 'react-router'
import styles from './NotFoundPage.module.css'

interface NotFoundPageProps {
  title?: string
  message?: string
}

export function NotFoundPage({
  title = 'Page not found',
  message = 'The page you are looking for does not exist.',
}: NotFoundPageProps) {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      <Link to="/invoices">Back to invoices</Link>
    </div>
  )
}
