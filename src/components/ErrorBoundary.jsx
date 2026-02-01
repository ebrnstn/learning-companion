import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 font-sans">
          <h1 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h1>
          <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 text-sm overflow-auto max-w-full max-h-48 text-neutral-300">
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
          <p className="mt-4 text-sm text-neutral-500">Check the browser console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
