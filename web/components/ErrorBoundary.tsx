'use client'
import React from 'react'

export default class ErrorBoundary extends React.Component<
  { fallback?: (info: { error: unknown }) => React.ReactNode; children: React.ReactNode },
  { error: unknown | null }
> {
  state = { error: null as unknown | null }
  static getDerivedStateFromError(error: unknown) { return { error } }
  componentDidCatch(error: unknown, info: unknown) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback
      return Fallback ? Fallback({ error: this.state.error }) : (
        <div className="p-6 text-sm">
          <div className="mb-2 font-semibold text-red-400">Runtime error</div>
          <pre className="whitespace-pre-wrap text-red-200">{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
