import React from 'react'

interface MyCardProps {
  title: string
  highlighted: boolean
  tone: 'info' | 'warn'
  image?: {
    filename: string
    w: number
    h: number
    blurDataUrl: string
  }
  className?: string
  children?: React.ReactNode
}

const MyCard: React.FC<MyCardProps> = ({ title, highlighted, tone, image, children, className }) => {
  const border = highlighted ? '2px solid red' : '1px solid #ccc'
  const bg = tone === 'info' ? '#e0f2fe' : '#fef9c3'
  return (
    <div className={className} style={{ border, backgroundColor: bg }}>
      {image && (
        <img
          src={`/assets/${image.filename}`}
          alt=""
          style={{ maxWidth: '100%' }}
        />
      )}
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export default MyCard
