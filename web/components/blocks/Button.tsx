'use client'
import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
}

export default function Button({ text, children, ...props }: ButtonProps) {
  return <button {...props}>{children ?? text}</button>
}

