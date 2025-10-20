import { createContext } from "react";

import type { UseToastQueueReturn } from "~/hooks/use-toast-queue";

export const ToastContext = createContext<UseToastQueueReturn | undefined>(
  undefined,
);
