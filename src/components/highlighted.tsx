import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

/**
 * Check if a string contains a full word match (case-insensitive)
 * Word boundaries are defined by: whitespace, hyphens, dots, slashes, and punctuation
 */
function hasFullWordMatch(text: string, query: string): boolean {
  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  // Match the query with word boundaries: start/end of string, separators, or punctuation
  const pattern = new RegExp(
    `(^|[\\s\\-./,;:!?"'—–])(${escapedQuery})([\\s\\-./,;:!?"'—–]|$)`,
    "i",
  );
  return pattern.test(text);
}

const HighlightedTextContent = ({ children }: { children: string }) => {
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("query") ?? "").trim();

  if (query === "") {
    return <>{children}</>;
  }

  // Only highlight if the query is a full word match in the text
  if (!hasFullWordMatch(children, query)) {
    return <>{children}</>;
  }

  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  // Split by word boundaries, capturing leading/trailing punctuation separately
  const parts = children.split(
    new RegExp(
      `([\\s\\-./,;:!?"'—–]*${escapedQuery}[\\s\\-./,;:!?"'—–]*|[\\s\\-./,;:!?"'—–]+)`,
      "gi",
    ),
  );

  return (
    <>
      {parts.map((part, index) => {
        const key = `${part}-${index}-${part.length}`;
        // Check if this part contains the query as a full word
        if (hasFullWordMatch(part, query)) {
          // Extract leading and trailing punctuation
          const leadingMatch = part.match(/^[\s.-/,;:!?"'—–]*/);
          const trailingMatch = part.match(/[\s.-/,;:!?"'—–]*$/);
          const leading = leadingMatch ? leadingMatch[0] : "";
          const trailing = trailingMatch ? trailingMatch[0] : "";
          const word = part.slice(
            leading.length,
            part.length - trailing.length,
          );
          return (
            <span key={key}>
              {leading}
              <mark>{word}</mark>
              {trailing}
            </span>
          );
        }
        return <span key={key}>{part}</span>;
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
