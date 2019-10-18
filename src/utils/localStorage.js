import { useEffect, useState } from "react";

// Auto JSON stringify/parse
const localStorageSetObj = (key, obj) =>
  localStorage.setItem(key, JSON.stringify(obj));
const localStorageGetObj = key => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {}
};

export const useStateWithLocalStorage = (localStorageKey, defaultValue) => {
  const [value, setValue] = useState(
    localStorageGetObj(localStorageKey) || defaultValue
  );
  useEffect(() => {
    localStorageSetObj(localStorageKey, value);
  }, [localStorageKey, value]);
  return [value, setValue];
};
