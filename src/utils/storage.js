// Keys for localStorage
const STORAGE_KEYS = {
  USER_PROFILE: 'nutrition_user_profile',
  FOOD_DIARY: 'nutrition_food_diary',
};

/**
 * Save data to localStorage with the given key
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveToStorage = (key, data) => {
  try {
    if (data === null || data === undefined) {
      console.error('Attempting to save null or undefined data to localStorage:', { key });
      return false;
    }
    
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    
    // Verify the data was saved correctly
    const savedItem = localStorage.getItem(key);
    if (!savedItem) {
      console.error('Verification failed: Data was not saved to localStorage', { key });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error, { key, data });
    return false;
  }
};

/**
 * Load data from localStorage with the given key
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if nothing is found
 * @returns {any} The stored data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      console.info(`No data found in localStorage for key: ${key}`);
      return defaultValue;
    }
    
    const parsedData = JSON.parse(serializedData);
    if (key === STORAGE_KEYS.USER_PROFILE) {
      console.info('Loaded user profile data:', parsedData);
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading from localStorage:', error, { key });
    return defaultValue;
  }
};

/**
 * Remove data from localStorage with the given key
 * @param {string} key - Storage key
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error, { key });
    return false;
  }
};

/**
 * Debug function to inspect localStorage contents
 * @returns {Object} All contents of localStorage
 */
export const debugStorage = () => {
  const storage = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const value = localStorage.getItem(key);
        storage[key] = value ? JSON.parse(value) : null;
      } catch (e) {
        storage[key] = `[Error parsing]: ${e.message}`;
      }
    }
    console.log('LocalStorage contents:', storage);
    return storage;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return { error: error.message };
  }
};

export { STORAGE_KEYS }; 