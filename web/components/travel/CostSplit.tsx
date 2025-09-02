'use client'
import React from 'react'

export type CostItem = { name: string; amount: number }
export type CostSplitProps = {
  items?: CostItem[]
}

export default function CostSplit({ items = [] }: CostSplitProps) {
  const total = items.reduce((sum, i) => sum + (i.amount || 0), 0)
  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          <th className="text-left">Item</th>
          <th className="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, i) => (
          <tr key={i}>
            <td>{it.name}</td>
            <td className="text-right">{it.amount.toLocaleString()}</td>
          </tr>
        ))}
        <tr className="font-medium">
          <td>Total</td>
          <td className="text-right">{total.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  )
}
