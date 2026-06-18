import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type ToastTone = 'error' | 'info' | 'success' | 'warning';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastInput = {
  action?: ToastAction;
  description?: string;
  durationMs?: number;
  title: string;
  tone?: ToastTone;
};

type Toast = ToastInput & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-950',
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
};

function ToastItem({
  toast,
  onDismiss,
}: {
  onDismiss: (id: string) => void;
  toast: Toast;
}) {
  useEffect(() => {
    if (toast.durationMs === Infinity) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs ?? 5000);

    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.durationMs, toast.id]);

  return (
    <div
      aria-live="polite"
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.18)] ${toneStyles[toast.tone ?? 'info']}`}
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-5">{toast.title}</p>
          {toast.description ? (
            <p className="text-sm leading-5 opacity-90">{toast.description}</p>
          ) : null}
        </div>
        <button
          className="px-2 py-1 text-xs font-semibold transition rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/30"
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          Dismiss
        </button>
      </div>

      {toast.action ? (
        <div className="flex justify-end mt-3">
          <button
            className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            type="button"
          >
            {toast.action.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = `${Date.now()}-${nextIdRef.current += 1}`;
      setToasts((current) => [...current, { ...toast, id }]);
      return id;
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed bottom-4 right-4 z-[10000] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
              {toasts.map((toast) => (
                <ToastItem key={toast.id} onDismiss={dismissToast} toast={toast} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

// The provider and hook intentionally live together so toast state stays colocated.
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export type { ToastInput, ToastTone };
