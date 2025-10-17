interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Debounce utility function
 * Creates a debounced version of a function that delays invoking until after
 * the specified delay has elapsed since the last time it was invoked
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout;

  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as DebouncedFunction<T>;

  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debounced;
}
