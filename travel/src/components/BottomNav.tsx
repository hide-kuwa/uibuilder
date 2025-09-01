'use client'

import {
  CalendarIcon,
  MapIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  WalletIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const items = [
  { id: 'timeline', label: 'Timeline', Icon: CalendarIcon },
  { id: 'map', label: 'Map', Icon: MapIcon },
  { id: 'chat', label: 'Chat', Icon: ChatBubbleOvalLeftEllipsisIcon },
  { id: 'expense', label: 'Expense', Icon: WalletIcon },
  { id: 'settings', label: 'Settings', Icon: Cog6ToothIcon },
]

interface BottomNavProps {
  active: string
  setActive: (id: string) => void
}

export default function BottomNav({ active, setActive }: BottomNavProps) {

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow flex justify-around py-2 z-50">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setActive(id)}
          className="flex flex-col items-center text-xs focus:outline-none"
        >
          <Icon
            className={`h-6 w-6 mb-1 ${active === id ? 'text-primary' : 'text-gray-400'}`}
          />
          <span className={active === id ? 'text-primary' : 'text-gray-400'}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
