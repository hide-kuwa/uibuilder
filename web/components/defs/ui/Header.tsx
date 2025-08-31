'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.header',
  meta: {
    displayName: 'Header',
    defaultW: 960,
    defaultH: 80,
    propertySchema: [
      { id: 'loginEnabled', type: 'boolean', default: true },
      { id: 'loginLabel', type: 'string', default: 'Log in' },
      { id: 'searchEnabled', type: 'boolean', default: true },
      { id: 'searchPlaceholder', type: 'string', default: 'Search…' },
      { id: 'bg', type: 'colorToken', default: 'token:color.surface' },
      { id: 'color', type: 'colorToken', default: 'token:color.text' },
    ],
  },
  render: (p: any) => {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,background:toCssVar(p.bg),color:toCssVar(p.color),padding:'0 16px',border:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{fontWeight:700}}>Logo</div>
        {p.searchEnabled ? <input placeholder={p.searchPlaceholder} style={{flex:1,maxWidth:480,background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'6px 10px',color:'inherit'}}/> : <div style={{flex:1}}/>}
        {p.loginEnabled ? <button style={{border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,padding:'8px 12px',background:'transparent',color:'inherit'}}>{p.loginLabel}</button> : null}
      </div>
    )
  },
}
export default Def
