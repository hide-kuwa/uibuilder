'use client'
import React from 'react'


type S = { hasError: boolean; error?: any }
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, S> {
  state: S = { hasError: false }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, info: any) {
    console.error('[ErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-black/80 text-red-300 p-4 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-bold mb-2">An error occurred</h2>
            <pre className="text-xs whitespace-pre-wrap">{String(this.state.error || '')}</pre>
            <button className="mt-3 border px-3 h-8 rounded" onClick={()=>this.setState({ hasError:false, error:undefined })}>Dismiss</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

