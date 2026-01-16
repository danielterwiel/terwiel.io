import { useSearchParams } from "next/navigation";

import { Suspense, useMemo } from "react";

/** Escape special regex characters in a string */
const REGEX_ESCAPE_PATTERN = /[-/\\^$*+?.()|[\]{}]/g;
function escapeRegex(str: string): string {
  return str.replace(REGEX_ESCAPE_PATTERN, "\\$&");
}

const HighlightedTextContent = ({ children }: { children: string }) => {
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("query") ?? "").trim();

  // Memoize regex patterns based on query to avoid recreation on each render
  const { matchPattern, splitPattern } = useMemo(() => {
    if (!query) return { matchPattern: null, splitPattern: null };
    const escapedQuery = escapeRegex(query);
    return {
      matchPattern: new RegExp(
        `(^|[\\s\\-./,;:!?"'—–])(${escapedQuery})([\\s\\-./,;:!?"'—–]|$)`,
        "i",
      ),
      splitPattern: new RegExp(
        `([\\s\\-./,;:!?"'—–]*${escapedQuery}[\\s\\-./,;:!?"'—–]*|[\\s\\-./,;:!?"'—–]+)`,
        "gi",
      ),
    };
  }, [query]);

  if (!query || !matchPattern || !splitPattern) {
    return <>{children}</>;
  }

  // Only highlight if the query is a full word match in the text
  if (!matchPattern.test(children)) {
    return <>{children}</>;
  }

  // Split by word boundaries, capturing leading/trailing punctuation separately
  const parts = children.split(splitPattern);

  return (
    <>
      {parts.map((part, index) => {
        const key = `${part}-${index}-${part.length}`;
        // Check if this part contains the query as a full word
        if (matchPattern.test(part)) {
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
