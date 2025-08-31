'use client'
import React from 'react'
import { toCssVar } from '@/lib/ui/tokenCss'
const Def = {
  key: 'ui.text',
  meta: {
    displayName: 'Text',
    defaultW: 320,
    defaultH: 36,
    propertySchema: [
      { id: 'text', type: 'string', default: 'Text' },
      { id: 'variant', type: 'enum', options:['body','heading','caption'], default: 'body' },
      { id: 'align', type: 'enum', options:['left','center','right'], default: 'left' },
      { id: 'size', type: 'fontSizeToken', default: 'token:fontSize.base' },
      { id: 'color', type: 'colorToken', default: 'token:color.text' },
    ],
  },
  render: (p: any) => {
    const fs = toCssVar(p.size)
    const fw = p.variant==='heading'?700: p.variant==='caption'?400:500
    return (
      <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:p.align==='center'?'center':p.align==='right'?'flex-end':'flex-start',color:toCssVar(p.color),fontSize:fs,fontWeight:fw}}>
        {p.text}
      </div>
    )
  },
}
export default Def
