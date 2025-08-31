'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.sidebar',
  meta: {
    displayName: 'Sidebar',
    defaultW: 240,
    defaultH: 320,
    propertySchema: [
      { id: 'collapsible', type: 'boolean', default: true },
      { id: 'defaultOpen', type: 'boolean', default: true },
      { id: 'width', type: 'number', default: 240 },
      { id: 'menu', type: 'list', of: { label:'MenuItem', schema:[
        { id: 'label', type: 'string', default: 'Item' },
        { id: 'href', type: 'string', default: '#' },
      ]}, default: [] },
      { id: 'bg', type: 'colorToken', default: 'token:color.surface' },
      { id: 'color', type: 'colorToken', default: 'token:color.text' },
    ],
  },
  render: (p: any) => {
    const items: any[] = Array.isArray(p.menu)?p.menu:[]
    return (
      <div style={{width:'100%',height:'100%',background:toCssVar(p.bg),color:toCssVar(p.color),border:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'10px 12px',fontWeight:700,opacity:.9}}>Menu</div>
        <div style={{display:'flex',flexDirection:'column',gap:4,padding:'0 8px 8px'}}>
          {items.map((m,i)=>(
            <a key={i} href={m.href||'#'} style={{padding:'8px 10px',borderRadius:8,opacity:.95,border:'1px solid rgba(255,255,255,0.08)'}}>{m.label||'Item'}</a>
          ))}
        </div>
      </div>
    )
  },
}
export default Def
