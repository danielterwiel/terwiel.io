"use client";

import { Toast } from "@base-ui-components/react";

import type React from "react";

import { Icon } from "~/components/icon";
import { useToasts } from "~/hooks/use-toasts";

function ToastViewportContent() {
  const { toasts, close } = useToasts();

  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast} className="base-toast-root">
          <div className="base-toast-content">
            {toast.title && (
              <Toast.Title className="base-toast-title">
                {toast.title}
              </Toast.Title>
            )}
            {toast.description && (
              <Toast.Description className="base-toast-description">
                {toast.description}
              </Toast.Description>
            )}
            <Toast.Close
              className="base-toast-close"
              aria-label="Close notification"
              onClick={() => close(toast.id)}
            >
              <Icon.X className="base-toast-close-icon" style={{ width: "100%", height: "100%" }} />
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
    </>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider timeout={6000} limit={3}>
      <Toast.Portal>
        <Toast.Viewport className="base-toast-viewport">
          <ToastViewportContent />
        </Toast.Viewport>
      </Toast.Portal>
      {children}
    </Toast.Provider>
  );
}
