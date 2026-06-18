import { createContext } from 'react';

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

export type { Toast, ToastAction, ToastContextValue, ToastInput, ToastTone };
export { ToastContext };
