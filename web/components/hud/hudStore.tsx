'use client'
import React, {createContext, useContext, useState} from 'react'

export type HUDKey = 'arGuide'|'workMap'|'skillShortcuts'|'expGauge'|'contextNotify'
type HUDState = Record<HUDKey, boolean>

const HudCtx = createContext<{
  hud: HUDState
  toggle: (k:HUDKey)=>void
} | null>(null)

export const HUDProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [hud, setHud] = useState<HUDState>({
    arGuide:false, workMap:false, skillShortcuts:false, expGauge:false, contextNotify:false
  })
  const toggle = (k:HUDKey)=> setHud(s=>({...s, [k]:!s[k]}))
  return <HudCtx.Provider value={{hud, toggle}}>{children}</HudCtx.Provider>
}
export const useHUD = ()=>{
  const ctx = useContext(HudCtx)
  if(!ctx) throw new Error('useHUD must be used within HUDProvider')
  return ctx
}
