function useLocalStorage(key: string, initialValue?: any) {
  const getStoredValue: any = () => JSON.parse(window.localStorage.getItem(key))
  const setStoredValue: any = (value: any) =>
    window.localStorage.setItem(key, JSON.stringify(value))

  if (initialValue) setStoredValue(initialValue)

  return [getStoredValue, setStoredValue]
}

export default useLocalStorage
