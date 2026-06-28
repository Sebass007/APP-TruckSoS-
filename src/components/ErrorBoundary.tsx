'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black italic uppercase text-white mb-2">Ocurrió un inconveniente</h2>
          <p className="text-xs text-neutral-400 max-w-sm mb-6">
            Ha surgido un error inesperado en la conexión o interfaz. Por favor reinicia la sección.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase italic flex items-center gap-2 shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar Cargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
