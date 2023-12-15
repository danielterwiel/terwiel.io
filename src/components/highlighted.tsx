export const Highlighted = ({
  text,
  query,
}: {
  text: string;
  query: string;
}) => {
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  if (query === "") {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        query !== "" && part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};
