"use client";

import { Toast } from "@base-ui-components/react";

import type React from "react";

import { useToasts } from "~/hooks/use-toasts";

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Close"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ToastViewportContent() {
  const { toasts, close } = useToasts();

  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          onClose={() => close(toast.id)}
          className="base-toast-root"
        >
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
            >
              <XIcon className="base-toast-close-icon" />
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
    </>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider timeout={6000}>
      <Toast.Portal>
        <Toast.Viewport className="base-toast-viewport">
          <ToastViewportContent />
        </Toast.Viewport>
      </Toast.Portal>
      {children}
    </Toast.Provider>
  );
}
