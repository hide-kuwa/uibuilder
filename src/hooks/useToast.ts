import { useContext } from 'react';
import { ToastContext, ToastOptions, ToastType } from '../components/ui/ToastProvider';

export interface ToastApi {
  success: (message: string, opts?: ToastOptions) => void;
  error: (message: string, opts?: ToastOptions) => void;
  info: (message: string, opts?: ToastOptions) => void;
  warning: (message: string, opts?: ToastOptions) => void;
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const build = (type: ToastType) => (message: string, opts?: ToastOptions) =>
    ctx.add(type, message, opts);

  return {
    success: build('success'),
    error: build('error'),
    info: build('info'),
    warning: build('warning'),
  };
}

export default useToast;
export type { ToastOptions };
