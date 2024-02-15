"use client";
import { useEffect, useState } from "react";

function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
}

export function useSafeLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const jsonValue = localStorage.getItem(key);
      if (jsonValue != null) {
        setValue(JSON.parse(jsonValue));
      }
    }
  }, [isMounted, key]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [isMounted, key, value]);

  return [value, setValue];
}
