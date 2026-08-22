import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// Class component is required here — componentDidCatch/getDerivedStateFromError
// have no hook equivalent. Without a boundary anywhere in the tree, ANY
// uncaught render-time exception (a bad prop shape, a null the render path
// didn't expect) unmounts the whole React tree to a blank white screen with
// no way back except a manual URL edit or hard refresh — this is what a
// "the app went to a blank page" report almost always actually is.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught render error:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Auto-recover on route change — a crash on one page shouldn't require a
    // hard refresh just to navigate elsewhere. `resetKey` is the router
    // location's pathname, passed in by each layout.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-critical/10 text-critical">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-serif text-base font-medium text-ink">Something went wrong</p>
          <p className="mt-1 max-w-sm text-sm text-ink-faint">
            This section hit an unexpected error. Your session and data are safe — try again or head back to the dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => this.setState({ error: null })} className="btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <a href={this.props.homeHref ?? '/'} className="btn-ghost">
            <Home className="h-4 w-4" />
            Go home
          </a>
        </div>
      </div>
    );
  }
}
