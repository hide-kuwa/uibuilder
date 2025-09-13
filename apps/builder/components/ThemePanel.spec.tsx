import { describe, it, expect } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ThemePanel from './ThemePanel'
import { useFigmaStore } from '../../lib/figma/store'

function bootstrap() {
  useFigmaStore.setState({
    doc: {
      themePresets: [
        {
          id: 'theme-default',
          name: 'Default',
          tokens: {
            'color.base': '#ffffff',
            'color.main': '#222222',
            'color.accent': '#3B82F6',
            'shadow.elevation1': '0 4px 12px rgba(0,0,0,0.08)'
          },
        },
      ],
      activeThemeId: 'theme-default',
    },
  } as any)
}

describe('ThemePanel', () => {
  it('renders pinned colors and groups', () => {
    bootstrap()
    const html = ReactDOMServer.renderToString(React.createElement(ThemePanel))
    expect(html).toContain('Base color')
    expect(html).toContain('Main color')
    expect(html).toContain('Accent color')
    expect(html).toMatch(/Colors/i)
    expect(html).toMatch(/shadow/i)
  })
})

