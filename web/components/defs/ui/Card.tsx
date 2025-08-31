'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.card',
  meta: {
    displayName: 'Card',
    defaultW: 320,
    defaultH: 180,
    propertySchema: [
      { id: 'title', type: 'string', default: 'Card title' },
      { id: 'body', type: 'string', default: 'Card body' },
      { id: 'image', type: 'string', default: '' },
      { id: 'bg', type: 'colorToken', default: 'token:color.surface' },
      { id: 'radius', type: 'radiusToken', default: 'token:radius.lg' },
      { id: 'pad', type: 'spaceToken', default: 'token:space.4' },
    ],
  },
  render: (p: any) => {
    return (
      <div style={{width:'100%',height:'100%',background:toCssVar(p.bg),borderRadius:toCssVar(p.radius),padding:toCssVar(p.pad),border:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:12}}>
        {p.image ? <div style={{width:72,height:72,background:`url(${p.image}) center/cover`,borderRadius:12}}/> : null}
        <div style={{display:'flex',flexDirection:'column',gap:6,overflow:'hidden'}}>
          <div style={{fontWeight:700,whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden'}}>{p.title}</div>
          <div style={{opacity:.85,lineHeight:1.35,whiteSpace:'nowrap',textOverflow:'ellipsis',overflow:'hidden'}}>{p.body}</div>
        </div>
      </div>
    )
  },
}
export default Def
