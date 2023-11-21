"use client";

import * as RadixCollapsible from "@radix-ui/react-collapsible";

const Root = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <RadixCollapsible.Root className={className}>
      {children}
    </RadixCollapsible.Root>
  );
};

const Trigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <RadixCollapsible.Trigger className={className}>
      {children}
    </RadixCollapsible.Trigger>
  );
};

const Content = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <RadixCollapsible.Content className={className}>
      {children}
    </RadixCollapsible.Content>
  );
};

export { Root, Trigger, Content };
