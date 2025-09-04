import React, { createContext, useCallback, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  duration?: number; // ms, 0 disables auto close
  action?: ToastAction;
  maxConcurrent?: number;
}

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  position: NonNullable<ToastOptions['position']>;
  duration: number;
  action?: ToastAction;
}

interface ToastContextValue {
  add: (type: ToastType, message: string, opts?: ToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  defaultPosition?: ToastOptions['position'];
  duration?: number;
  maxConcurrent?: number;
}

export function ToastProvider({
  children,
  defaultPosition = 'top-right',
  duration = 3000,
  maxConcurrent = 5,
}: ProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (type: ToastType, message: string, opts?: ToastOptions) => {
      const id = Date.now() + Math.random();
      const position = opts?.position ?? defaultPosition;
      const toast: ToastItem = {
        id,
        type,
        message,
        position,
        duration: opts?.duration ?? duration,
        action: opts?.action,
      };

      setToasts((prev) => {
        const limit = opts?.maxConcurrent ?? maxConcurrent;
        const list = [...prev, toast];
        const samePos = list.filter((t) => t.position === position);
        const overflow = samePos.length - limit;
        if (overflow > 0) {
          const idsToRemove = samePos.slice(0, overflow).map((t) => t.id);
          return list.filter((t) => !idsToRemove.includes(t.id));
        }
        return list;
      });

      const autoClose = opts?.duration ?? duration;
      if (autoClose > 0) {
        setTimeout(() => remove(id), autoClose);
      }
    },
    [defaultPosition, duration, maxConcurrent, remove]
  );

  const positions: NonNullable<ToastOptions['position']>[] = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ];

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      {positions.map((pos) => {
        const style: React.CSSProperties = {
          position: 'fixed',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        };
        if (pos.includes('top')) style.top = '1rem';
        if (pos.includes('bottom')) style.bottom = '1rem';
        if (pos.includes('left')) style.left = '1rem';
        if (pos.includes('right')) style.right = '1rem';

        return (
          <div key={pos} style={style}>
            {toasts
              .filter((t) => t.position === pos)
              .map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 4,
                    minWidth: 200,
                    color: '#fff',
                    background: backgroundFor(t.type),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ flex: 1 }}>{t.message}</span>
                  {t.action && (
                    <button
                      onClick={() => {
                        t.action?.onClick();
                        remove(t.id);
                      }}
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: 'none',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
              ))}
          </div>
        );
      })}
    </ToastContext.Provider>
  );
}

function backgroundFor(type: ToastType): string {
  switch (type) {
    case 'success':
      return '#16a34a';
    case 'error':
      return '#dc2626';
    case 'warning':
      return '#d97706';
    case 'info':
    default:
      return '#2563eb';
  }
}

export default ToastProvider;
