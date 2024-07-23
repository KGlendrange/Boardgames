import React, { useState, useEffect } from "react";

// Custom hook for debouncing
export function useDebounced(callback, delay) {
  const [value, setValue] = useState(undefined);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback(value); // Call the passed callback function with the debounced value
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, callback]); // Include callback in the dependency array

  return setValue; // Return only setValue as the component will use the callback for the debounced value
}
