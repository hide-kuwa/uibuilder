'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.panel',
  meta: {
    displayName: 'Panel',
    defaultW: 360,
    defaultH: 200,
    propertySchema: [
      { id: 'title', type: 'string', default: 'Panel' },
      { id: 'bordered', type: 'boolean', default: true },
      { id: 'pad', type: 'spaceToken', default: 'token:space.4' },
      { id: 'scrollable', type: 'boolean', default: false },
      { id: 'bg', type: 'colorToken', default: 'token:color.surface' },
    ],
  },
  render: (p: any) => {
    return (
      <div style={{width:'100%',height:'100%',background:toCssVar(p.bg),border:p.bordered?'1px solid rgba(255,255,255,0.08)':'none',borderRadius:12,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'8px 12px',fontWeight:700}}>{p.title}</div>
        <div style={{padding:toCssVar(p.pad),overflow:p.scrollable?'auto':'visible',flex:1}}/>
      </div>
    )
  },
}
export default Def
