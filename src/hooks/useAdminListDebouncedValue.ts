"use client";

import { useEffect, useState } from "react";

export const ADMIN_LIST_KEYWORD_DEBOUNCE_MS = 250;

export function useAdminListDebouncedValue<TValue>(
  value: TValue,
  delayMs = ADMIN_LIST_KEYWORD_DEBOUNCE_MS,
) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
}
