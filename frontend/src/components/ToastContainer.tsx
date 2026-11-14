import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ToastType } from '../types';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-emerald-50 border-emerald-500 text-emerald-950',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />,
          progress: 'bg-emerald-500',
        };
      case 'error':
        return {
          container: 'bg-rose-50 border-rose-500 text-rose-950 shadow-rose-100',
          icon: <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 animate-pulse" />,
          progress: 'bg-rose-500',
        };
      case 'warning':
        return {
          container: 'bg-amber-50 border-amber-500 text-amber-950 shadow-amber-100',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />,
          progress: 'bg-amber-500',
        };
      case 'info':
      default:
        return {
          container: 'bg-sky-50 border-sky-500 text-sky-950 shadow-sky-100',
          icon: <Info className="w-6 h-6 text-sky-600 flex-shrink-0" />,
          progress: 'bg-sky-500',
        };
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-xl backdrop-blur-sm transition-all duration-300 animate-slide-down ${styles.container}`}
          >
            {styles.icon}
            <div className="flex-1 pr-2">
              <h4 className="text-sm font-bold tracking-tight mb-1">{toast.title}</h4>
              <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 text-stone-500 hover:text-stone-800 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
