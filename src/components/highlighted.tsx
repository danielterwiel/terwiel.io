import React from "react";

export const HighlightedText = ({
  children,
  query,
}: {
  children: string;
  query: string;
}) => {
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

export const HighlightedIcon = ({
  children,
  query,
  meta,
}: {
  children: React.ReactNode;
  query: string;
  meta: string;
}) => {
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  if (query === "") {
    return <span>{children}</span>;
  }

  if (meta.toLowerCase().includes(escapedQuery.toLowerCase())) {
    return <mark>{children}</mark>;
  } else {
    return <span>{children}</span>;
  }
};
