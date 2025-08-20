"use client"
import { registry } from '../lib/registry'
import { useStore } from '../lib/store'

const defaults: Record<string, any> = {
  Header: { text: 'Header', level: 1, className: '' },
  Sidebar: { className: '' },
  Section: { className: '' },
  Button: { text: 'Button', className: '' },
  Window: { title: 'Window', className: '' },
  HUD: { className: '' }
}

export default function Library() {
  const append = useStore(s => s.append)
  return (
    <div className="p-2 space-y-2">
      {Object.keys(registry).map(name => (
        <div key={name} className="flex justify-between">
          <span>{name}</span>
          <button className="text-blue-600" onClick={() => append(name, defaults[name])}>追加</button>
        </div>
      ))}
    </div>
  )
}
