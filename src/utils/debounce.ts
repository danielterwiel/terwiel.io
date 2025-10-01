export function debounce<T extends (query: string) => unknown>(
  func: T,
  wait: number,
): (...funcArgs: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(query: string) {
    const later = () => {
      timeout = null;
      func(query);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
