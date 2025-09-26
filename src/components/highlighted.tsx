import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const HighlightedTextContent = ({ children }: { children: string }) => {
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("search") ?? "").trim();

  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  if (query === "") {
    return <>{children}</>;
  }

  const parts = children.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

export const HighlightedText = ({ children }: { children: string }) => {
  return (
    <Suspense fallback={<span>{children}</span>}>
      <HighlightedTextContent>{children}</HighlightedTextContent>
    </Suspense>
  );
};

const HighlightedIconContent = ({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta: string;
}) => {
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("search") ?? "").trim();

  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  if (query === "") {
    return <span>{children}</span>;
  }

  if (meta.toLowerCase().includes(escapedQuery.toLowerCase())) {
    return <mark className="pb-1">{children}</mark>;
  } else {
    return <span>{children}</span>;
  }
};

export const HighlightedIcon = ({
  children,
  meta,
}: {
  children: React.ReactNode;
  meta: string;
}) => {
  return (
    <Suspense fallback={<span>{children}</span>}>
      <HighlightedIconContent meta={meta}>{children}</HighlightedIconContent>
    </Suspense>
  );
};
