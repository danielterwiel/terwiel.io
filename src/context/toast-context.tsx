"use client";

import { useMemo } from "react";

import { ToastContext } from "~/context/toast-context-internal";
import { useToastQueue } from "~/hooks/use-toast-queue";

export const ToastContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toastQueue = useToastQueue();

  const value = useMemo(() => toastQueue, [toastQueue]);

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
