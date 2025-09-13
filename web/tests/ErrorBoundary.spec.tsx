import { describe, it, expect } from 'vitest'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ErrorBoundary from '@/components/common/ErrorBoundary'

function Boom() {
  throw new Error('__probe__')
}

describe('ErrorBoundary', () => {
  it('renders fallback when child throws', () => {
    const html = ReactDOMServer.renderToString(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    expect(html).toContain('Something went wrong')
    // Buttons rendered
    expect(html).toContain('Reload')
    expect(html).toContain('Restore latest snapshot')
    expect(html).toContain('Report issue')
  })
})

