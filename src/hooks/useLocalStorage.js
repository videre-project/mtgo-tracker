import { useState, useCallback, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback(value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  const handleStorage = useCallback((event) => {
    if (event.key === key && event.newValue !== storedValue) {
      setValue(event.newValue || initialValue);
    }
  }, [key, storedValue, setValue, initialValue]);

  useEffect(() => {
    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, [handleStorage]);

  return [storedValue, setValue];
}

export default useLocalStorage;
