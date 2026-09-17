import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  badge?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, badge, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          {badge}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={`${styles.actions} no-print`}>{actions}</div>}
    </div>
  )
}
