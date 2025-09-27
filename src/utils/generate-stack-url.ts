/**
 * Generates a search URL for a technology stack item.
 * The URL will filter projects to show only those containing the specified technology.
 *
 * @param name - The name of the technology/stack item
 * @returns A search URL in the format `/?search={encoded_name}#projects`
 */
export function generateStackUrl(name: string): string {
  const encodedName = encodeURIComponent(name);
  return `/?search=${encodedName}#projects`;
}
