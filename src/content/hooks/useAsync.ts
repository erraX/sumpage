import { useState, useCallback, useRef } from "react";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

type AsyncFunction<T, Args extends unknown[]> = (
  ...args: Args
) => Promise<T>;

/**
 * Custom hook for handling async operations with loading/error states
 * Follows Vercel's best practices for client-side data fetching
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: AsyncFunction<T, Args>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const executionCount = useRef(0);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      executionCount.current += 1;
      const currentCount = executionCount.current;

      setState({ data: null, error: null, isLoading: true });

      try {
        const data = await asyncFunction(...args);

        // Only update state if this is the most recent execution
        if (currentCount === executionCount.current) {
          setState({ data, error: null, isLoading: false });
        }

        return data;
      } catch (error) {
        // Only update state if this is the most recent execution
        if (currentCount === executionCount.current) {
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";
          setState({ data: null, error: new Error(errorMessage), isLoading: false });
        }

        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for debounced async operations
 */
export function useDebouncedAsync<T, Args extends unknown[]>(
  asyncFunction: AsyncFunction<T, Args>,
  delay: number = 300
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const timeoutRef = useRef<number | null>(null);
  const executionCount = useRef(0);

  const execute = useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        executeAsync(...args);
      }, delay);
    },
    [asyncFunction, delay]
  );

  const executeAsync = useCallback(
    async (...args: Args): Promise<T | null> => {
      executionCount.current += 1;
      const currentCount = executionCount.current;

      setState({ data: null, error: null, isLoading: true });

      try {
        const data = await asyncFunction(...args);

        if (currentCount === executionCount.current) {
          setState({ data, error: null, isLoading: false });
        }

        return data;
      } catch (error) {
        if (currentCount === executionCount.current) {
          const errorMessage =
            error instanceof Error ? error.message : "An error occurred";
          setState({ data: null, error: new Error(errorMessage), isLoading: false });
        }

        return null;
      }
    },
    [asyncFunction]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset: () => setState({ data: null, error: null, isLoading: false }),
  };
}
