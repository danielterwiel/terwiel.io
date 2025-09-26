import type React from "react";

import { Icon } from "~/components/icon";

interface IconWrapperProps {
  icon: keyof typeof Icon;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-hidden"?: boolean;
}

export default function IconWrapper({
  icon,
  size = "md",
  className = "",
  "aria-hidden": ariaHidden = true,
}: IconWrapperProps) {
  const IconComponent = Icon[icon] as React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`flex-shrink-0 ${sizeClasses[size]} flex items-center justify-center overflow-hidden`}
    >
      <IconComponent
        aria-hidden={ariaHidden}
        className={`w-full h-full ${className}`}
      />
    </div>
  );
}
