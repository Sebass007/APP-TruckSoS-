// Offline local storage caching utility

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(`trucksos_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Error reading storage key:", key, e);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`trucksos_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Error writing storage key:", key, e);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(`trucksos_${key}`);
    } catch (e) {
      console.error("Error removing storage key:", key, e);
    }
  }
};
