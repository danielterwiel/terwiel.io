/**
 * Generates a query URL for a technology stack item.
 * The URL will filter projects to show only those containing the specified technology.
 *
 * @param name - The name of the technology/stack item
 * @returns A query URL in the format `/?query={encoded_name}#projects`
 */
export function generateStackUrl(name: string): string {
  const encodedName = encodeURIComponent(name);
  return `/?query=${encodedName}#projects`;
}
