import type { ReactNode } from 'react'

interface StateCardProps {
  icon?: ReactNode
  title: string
  text?: string
  error?: boolean
  children?: ReactNode
}

/** Bloco padrão para carregamento, erro e lista vazia. */
export function StateCard({ icon, title, text, error, children }: StateCardProps) {
  return (
    <div className={`state-card ${error ? 'error-state' : ''}`}>
      {icon}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

export const Loader = () => <span className="loader" />
