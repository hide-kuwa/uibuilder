'use client'
import React from 'react'
import FallbackPane from './FallbackPane'

type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  // telemetry hook (append-only or integrate with existing logger)
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try { console.error('[ErrorBoundary]', error, info) } catch {}
  }
  render() {
    if (this.state.hasError) return <FallbackPane error={this.state.error} />
    return this.props.children as React.ReactElement
  }
}

