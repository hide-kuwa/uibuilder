'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.hud',
  meta: {
    displayName: 'HUD',
    defaultW: 200,
    defaultH: 60,
    propertySchema: [
      { id: 'kind', type: 'enum', options:['status','notification','floatingButton'], default: 'status' },
      { id: 'position', type: 'enum', options:['top-left','top-right','bottom-left','bottom-right'], default:'top-right' },
      { id: 'visible', type: 'boolean', default: true },
      { id: 'message', type: 'string', default: 'All good' },
      { id: 'bg', type: 'colorToken', default: 'token:color.surface' },
      { id: 'color', type: 'colorToken', default: 'token:color.text' },
    ],
  },
  render: (p: any) => {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:toCssVar(p.bg),color:toCssVar(p.color),border:'1px solid rgba(255,255,255,0.06)',borderRadius:12}}>
        {p.kind==='floatingButton' ? <button style={{padding:'8px 12px',borderRadius:9999,border:'1px solid rgba(255,255,255,0.15)',background:'transparent',color:'inherit'}}>Action</button> : <div>{p.message}</div>}
      </div>
    )
  },
}
export default Def
