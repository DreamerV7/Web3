import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue, isValid) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (isValid(saved)) return saved;
    } catch {
      // Используем начальное значение при недоступном или повреждённом хранилище.
    }
    return initialValue;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Значение остаётся доступным до перезагрузки страницы.
    }
  }, [key, value]);
  return [value, setValue];
}
