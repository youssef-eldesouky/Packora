import React, { Component } from 'react'

export default class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.warn('3D canvas error:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-background flex-col gap-4">
          <div className="w-20 h-20 rounded-2xl bg-sidebar border border-border flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3563fa" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-foreground font-semibold text-lg mb-1">WebGL Not Available</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your browser or environment doesn't support WebGL. Please use a modern browser with hardware acceleration enabled.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-lg bg-primary text-foreground text-sm font-medium hover:bg-brand-400 transition-all"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
