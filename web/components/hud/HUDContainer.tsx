'use client'
import React from 'react'
import { useHUD } from './hudStore'
import ARGuide from './ar/ARGuide'
import WorkMapHUD from './workmap/WorkMapHUD'
import SkillShortcutsHUD from './skills/SkillShortcutsHUD'
import ExpGaugeHUD from './exp/ExpGaugeHUD'
import ContextNotificationsHUD from './notify/ContextNotificationsHUD'
import HUDBar from './HUDBar'

export default function HUDContainer(){
  const { hud } = useHUD()
  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <HUDBar />
      {hud.arGuide && <ARGuide/>}
      {hud.workMap && <WorkMapHUD/>}
      {hud.skillShortcuts && <SkillShortcutsHUD/>}
      {hud.expGauge && <ExpGaugeHUD/>}
      {hud.contextNotify && <ContextNotificationsHUD/>}
    </div>
  )
}
