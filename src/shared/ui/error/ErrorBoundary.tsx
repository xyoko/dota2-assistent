import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentTitle?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: any[];
  title?: string;
  message?: string;
  compact?: boolean;
  silent?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.title ? ` - ${this.props.title}` : ''}] Unhandled runtime error:`, error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    if (this.state.hasError && resetKeys && prevProps.resetKeys) {
      const keysChanged = resetKeys.length !== prevProps.resetKeys.length ||
        resetKeys.some((k, i) => !Object.is(k, prevProps.resetKeys![i]));
      if (keysChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  public resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, title, message, compact, silent } = this.props;

    if (!hasError) {
      return children;
    }

    if (silent) {
      return null;
    }

    if (typeof fallback === 'function') {
      return fallback({
        error: error || new Error('Unknown error captured by ErrorBoundary'),
        resetErrorBoundary: this.resetErrorBoundary,
        componentTitle: title,
      });
    }

    if (fallback) {
      return fallback;
    }

    const heading = title || 'Tactical Telemetry Disrupted';
    const description = message || 'An unexpected rendering anomaly occurred in this module. The rest of Aegis Forge remains operational.';

    if (compact) {
      return (
        <div className="w-full h-full min-h-[160px] p-4 rounded-2xl bg-slate-950/95 border border-red-500/30 flex flex-col items-center justify-center text-center shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-dota font-bold text-red-200 uppercase tracking-wider">
              {heading}
            </h4>
            <p className="text-[11px] text-slate-400 font-sans max-w-xs line-clamp-2">
              {error?.message || description}
            </p>
          </div>
          <button
            onClick={this.resetErrorBoundary}
            className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalibrate</span>
          </button>
        </div>
      );
    }

    return (
      <div className="w-full min-h-[360px] my-6 p-8 rounded-3xl bg-slate-950/95 border border-red-600/40 flex flex-col items-center justify-center text-center shadow-2xl space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/20 via-red-950/50 to-slate-900 border border-red-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-lg md:text-xl font-dota font-bold text-white tracking-wide">
            {heading}
          </h3>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">
            {description}
          </p>
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-red-950 text-left overflow-x-auto text-[11px] font-mono text-red-300/80 max-h-28">
              {error.name}: {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={this.resetErrorBoundary}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-colors active:scale-95 btn-fade"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalibrate Module</span>
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
