import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CBT App:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      localStorage.removeItem('cbt_sman1batu_active_student_session');
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans selection:bg-blue-600">
          <div className="bg-slate-800 border border-slate-700 max-w-md w-full p-6 sm:p-8 rounded-3xl text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Terjadi Kendala Tampilan</h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Sistem mendeteksi kendala pada sesi peramban. Jawaban Anda tetap tersimpan aman di memori perangkat.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Halaman Ujian</span>
              </button>

              <button
                onClick={this.handleResetSession}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-600"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Halaman Login</span>
              </button>
            </div>

            {this.state.error && (
              <p className="text-[10px] text-slate-500 font-mono mt-6 truncate">
                Info: {this.state.error.message || 'Unknown error'}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
