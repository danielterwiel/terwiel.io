import { useContext } from "react";

import type { UseToastQueueReturn } from "~/hooks/use-toast-queue";
import { ToastContext } from "~/context/toast-context-internal";

export const useToasts = (): UseToastQueueReturn => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts must be used within ToastContextProvider");
  }
  return context;
};
