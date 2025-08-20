import { PropsWithChildren } from 'react'

export const registry: Record<string, any> = {
  Header: ({ text, level = 1, className }: { text: string; level?: number; className?: string }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements
    return <Tag className={className}>{text}</Tag>
  },
  Sidebar: ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <aside className={className}>{children}</aside>
  ),
  Section: ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <section className={className}>{children}</section>
  ),
  Button: ({ text, className, onClick }: { text: string; className?: string; onClick?: () => void }) => (
    <button className={className} onClick={onClick}>{text}</button>
  ),
  Window: ({ title, className, children }: PropsWithChildren<{ title: string; className?: string }>) => (
    <div className={className}><div>{title}</div><div>{children}</div></div>
  ),
  HUD: ({ className, children }: PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  )
}
