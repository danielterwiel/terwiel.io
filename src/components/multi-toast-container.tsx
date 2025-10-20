"use client";

import { useToasts } from "~/hooks/use-toasts";
import { MultiToast } from "./multi-toast";

/**
 * Multi-toast container that displays multiple toasts with stacking depth effect
 * Uses CSS variables and z-index for proper stacking
 * Should be placed inside ToastContextProvider
 */
export const MultiToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className="multi-toast-stack-container">
        {toasts.map((toast, index) => {
          return (
            <MultiToast
              key={toast.id}
              toastItem={toast}
              index={index}
              totalToasts={toasts.length}
              onDismiss={removeToast}
              style={
                {
                  "--toast-index": index,
                  "--total-toasts": toasts.length,
                } as React.CSSProperties & {
                  "--toast-index": number;
                  "--total-toasts": number;
                }
              }
            />
          );
        })}
      </div>
    </div>
  );
};
