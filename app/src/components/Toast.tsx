import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Undo2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  undoAction?: () => void;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none toast-container">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl shadow-slate-900/5 dark:shadow-black/30 flex items-start justify-between gap-3 text-right animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-start gap-3 flex-1">
              {icon}
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {toast.title}
                </div>
                {toast.message && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {toast.message}
                  </div>
                )}
                {toast.undoAction && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.undoAction?.();
                      onDismiss(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    تراجع عن هذا التعديل
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
