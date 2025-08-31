'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.footer',
  meta: {
    displayName: 'Footer',
    defaultW: 960,
    defaultH: 72,
    propertySchema: [
      { id: 'text', type: 'string', default: '© Your Company' },
      { id: 'shareTwitter', type: 'boolean', default: true },
      { id: 'shareFacebook', type: 'boolean', default: false },
      { id: 'shareLine', type: 'boolean', default: true },
      { id: 'bg', type: 'colorToken', default: 'token:color.surface' },
      { id: 'color', type: 'colorToken', default: 'token:color.text' },
    ],
  },
  render: (p: any) => {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,background:toCssVar(p.bg),color:toCssVar(p.color),padding:'0 16px',border:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{opacity:.8}}>{p.text}</div>
        <div style={{display:'flex',gap:8}}>
          {p.shareTwitter ? <a href="#" style={{opacity:.9}}>X</a> : null}
          {p.shareFacebook ? <a href="#" style={{opacity:.9}}>Fb</a> : null}
          {p.shareLine ? <a href="#" style={{opacity:.9}}>LINE</a> : null}
        </div>
      </div>
    )
  },
}
export default Def
