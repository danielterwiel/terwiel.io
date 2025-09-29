import type React from "react";
import { Suspense } from "react";

import { IconCloudContent } from "./icon-cloud-content";

export const IconCloud: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto my-8 px-4 overflow-visible bg-gray-100 rounded-lg" />
      }
    >
      <IconCloudContent />
    </Suspense>
  );
};
