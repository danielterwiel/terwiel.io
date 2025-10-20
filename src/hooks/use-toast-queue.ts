import { useCallback, useRef, useState } from "react";

export interface ToastItem {
  id: string;
  message: string;
  details?: string;
  type?: "default" | "success" | "error" | "info";
  dismissable?: boolean;
}

export interface UseToastQueueReturn {
  toasts: ToastItem[];
  addToast: (
    message: string,
    details?: string,
    type?: ToastItem["type"],
  ) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

/**
 * Hook for managing a queue of toast notifications
 * Supports multiple concurrent toasts with automatic or manual dismissal
 */
export const useToastQueue = (): UseToastQueueReturn => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const addToast = useCallback(
    (
      message: string,
      details?: string,
      type: ToastItem["type"] = "default",
    ) => {
      const id = `toast-${nextIdRef.current++}`;
      const newToast: ToastItem = {
        id,
        message,
        details,
        type,
        dismissable: true,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);
      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
  };
};
