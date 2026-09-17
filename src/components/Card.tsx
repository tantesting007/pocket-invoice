import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <section className={className ? `${styles.card} ${className}` : styles.card}>{children}</section>
}
