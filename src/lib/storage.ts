
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`mythos_dm_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(`mythos_dm_${key}`, JSON.stringify(value));
  },

  delete(key: string): void {
    localStorage.removeItem(`mythos_dm_${key}`);
  }
};
