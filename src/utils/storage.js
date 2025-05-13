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
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
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
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
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
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

export { STORAGE_KEYS }; 