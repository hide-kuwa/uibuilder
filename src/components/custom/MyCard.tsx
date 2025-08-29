import React from 'react'

interface MyCardProps {
  title: string
  highlighted: boolean
  tone: 'info' | 'warn'
  children?: React.ReactNode
  className?: string
}

const MyCard: React.FC<MyCardProps> = ({ title, highlighted, tone, children, className }) => {
  const border = highlighted ? '2px solid red' : '1px solid #ccc'
  const bg = tone === 'info' ? '#e0f2fe' : '#fef9c3'
  return (
    <div className={className} style={{ border, backgroundColor: bg }}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export default MyCard
