'use client'
import React from 'react'

export type ItineraryItem = { time?: string; title: string; note?: string }
export type ItineraryDay = { date: string; items: ItineraryItem[] }

export default function ItineraryTimeline({ days = [] as ItineraryDay[] }) {
  if (!days.length) {
    days = [
      { date: 'Day1', items: [{ time: '10:00', title: '出発' }, { time: '12:30', title: 'ランチ' }] },
      { date: 'Day2', items: [{ time: '09:00', title: '観光A' }, { time: '18:00', title: '夕食' }] },
    ]
  }
  return (
    <div className="space-y-3">
      {days.map((d, i) => (
        <div key={i} className="border rounded-xl p-3">
          <div className="text-sm font-medium mb-2">{d.date}</div>
          <ul className="space-y-1">
            {d.items.map((it, j) => (
              <li key={j} className="flex gap-2 text-sm">
                <span className="w-14 text-muted-foreground">{it.time ?? ''}</span>
                <span className="font-medium">{it.title}</span>
                {it.note && <span className="text-muted-foreground">— {it.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

