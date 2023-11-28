"use client";

import * as RadixCollapsible from "@radix-ui/react-collapsible";

const Root = ({
  children,
  className,
  open,
}: {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
}) => {
  return (
    <RadixCollapsible.Root open={open} className={className}>
      {children}
    </RadixCollapsible.Root>
  );
};

const Trigger = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
}) => {
  return (
    <RadixCollapsible.Trigger onClick={() => onClick()} className={className}>
      {children}
    </RadixCollapsible.Trigger>
  );
};

const Content = ({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) => {
  return (
    <RadixCollapsible.Content asChild={asChild} className={className}>
      {children}
    </RadixCollapsible.Content>
  );
};

export { Root, Trigger, Content };
