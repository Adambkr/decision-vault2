import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Hexagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[100dvh] bg-void flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-accent/[0.08] rounded-full blur-xl" />
              <div className="relative w-full h-full rounded-full border border-white/[0.06] flex items-center justify-center bg-white/[0.02]">
                <Hexagon className="w-8 h-8 text-accent/40" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
              <p className="text-sm text-ink-dim/60 leading-relaxed">
                An unexpected error occurred. We have captured the details and recommend refreshing to continue.
              </p>
              {this.state.error && (
                <code className="block mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-ink-faint/50 text-left overflow-auto max-h-32">
                  {this.state.error.message}
                </code>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-accent text-void px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#7a96ff] transition-all duration-300 shadow-[0_0_20px_rgba(107,138,254,0.15)] active:scale-[0.97]"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={2} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
