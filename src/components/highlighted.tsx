import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

const HighlightedTextContent = ({ children }: { children: string }) => {
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("query") ?? "").trim();

  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  if (query === "") {
    return <>{children}</>;
  }

  const parts = children.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) => {
        const key = `${part}-${index}-${part.length}`;
        return part.toLowerCase() === query.toLowerCase() ? (
          <mark key={key}>{part}</mark>
        ) : (
          <span key={key}>{part}</span>
        );
      })}
    </>
  );
};

HighlightedTextContent.displayName = "HighlightedTextContent";

export const HighlightedText = ({ children }: { children: string }) => {
  return (
    <Suspense fallback={<span>{children}</span>}>
      <HighlightedTextContent>{children}</HighlightedTextContent>
    </Suspense>
  );
};
