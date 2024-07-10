import { useEffect, useState } from "react";

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [debouncing, setDebouncing] = useState(false);

  useEffect(() => {
    setDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setDebouncing(false);
    }, delay || 500);

    return () => {
      setDebouncing(false);
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue, debouncing];
};

export default useDebounce;
