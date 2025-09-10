'use client'
import React from 'react'

export default function PresetsTestIdE2E() {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E === '1') {
      const attach = () => {
        try {
          const el = Array.from(document.querySelectorAll('[role="tab"],button,div,a'))
            .find((n) => n.textContent?.trim().toLowerCase() === 'presets') as HTMLElement | undefined
          if (el && !el.getAttribute('data-testid')) el.setAttribute('data-testid', 'tab-presets')
        } catch {}
      }
      attach()
      const mo = new MutationObserver(attach)
      mo.observe(document.body, { childList: true, subtree: true })
      return () => mo.disconnect()
    }
    return () => {}
  }, [])
  return null
}

