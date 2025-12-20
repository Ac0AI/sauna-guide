'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center bg-sauna-linen rounded-xl border border-sauna-ash/50">
          <p className="text-sauna-slate">Something went wrong. Please refresh the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}
