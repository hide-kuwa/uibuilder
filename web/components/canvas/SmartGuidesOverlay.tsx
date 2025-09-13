'use client'
import React from 'react'
import type { Guide, Measure } from './snap'

export default function SmartGuidesOverlay({
  guides = [],
  measures = [],
}: {
  guides?: Guide[]
  measures?: Measure[]
}) {
  const active = guides.length > 0 || measures.length > 0
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-200"
      style={{ opacity: active ? 1 : 0 }}
    >
      {guides.map((g, i) =>
        g.type === 'v' ? (
          <line
            key={i}
            x1={g.pos}
            x2={g.pos}
            y1={g.from}
            y2={g.to}
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        ) : (
          <line
            key={i}
            y1={g.pos}
            y2={g.pos}
            x1={g.from}
            x2={g.to}
            stroke="#ef4444"
            strokeWidth="1.5"
          />
        ),
      )}
      {measures.map((m, i) => {
        const mid = (m.from + m.to) / 2
        const val = Math.abs(m.to - m.from)
        return m.axis === 'x' ? (
          <g key={`mx-${i}`}>
            <line x1={m.from} x2={m.to} y1={m.at} y2={m.at} stroke="#ef4444" strokeWidth="1" />
            <text
              x={mid}
              y={m.at - 4}
              fill="#ef4444"
              fontSize="10"
              textAnchor="middle"
            >
              {val}
            </text>
          </g>
        ) : (
          <g key={`my-${i}`}>
            <line x1={m.at} x2={m.at} y1={m.from} y2={m.to} stroke="#ef4444" strokeWidth="1" />
            <text
              x={m.at + 4}
              y={(m.from + m.to) / 2}
              fill="#ef4444"
              fontSize="10"
              dominantBaseline="middle"
            >
              {val}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
