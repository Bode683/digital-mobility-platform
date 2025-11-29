import { useEffect, useRef } from 'react';

/**
 * Custom hook that stores the previous value of a variable
 * 
 * Useful for comparing current vs previous values in useEffect
 * to prevent unnecessary re-renders or infinite loops
 * 
 * @param value Current value to track
 * @returns Previous value (undefined on first render)
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
