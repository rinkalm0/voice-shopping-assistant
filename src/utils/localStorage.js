import { STORAGE_KEYS } from './constants';

// Get data from localStorage
export const getFromStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return null;
    }
};

// Save data to localStorage
export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
        return false;
    }
};

// Remove data from localStorage
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
        return false;
    }
};

// Clear all localStorage
export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

// Shopping List specific functions
export const getShoppingList = () => {
    return getFromStorage(STORAGE_KEYS.SHOPPING_LIST) || [];
};

export const saveShoppingList = (list) => {
    return saveToStorage(STORAGE_KEYS.SHOPPING_LIST, list);
};

export const addToShoppingList = (item) => {
    const list = getShoppingList();
    const newItem = {
        id: Date.now().toString(),
        name: item.name,
        quantity: item.quantity || 1,
        category: item.category || 'Other',
        price: item.price || 0,
        completed: false,
        addedAt: new Date().toISOString()
    };
    list.push(newItem);
    saveShoppingList(list);
    return newItem;
};

export const removeFromShoppingList = (itemId) => {
    const list = getShoppingList();
    const updatedList = list.filter(item => item.id !== itemId);
    saveShoppingList(updatedList);
    return updatedList;
};

export const updateShoppingListItem = (itemId, updates) => {
    const list = getShoppingList();
    const updatedList = list.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
    );
    saveShoppingList(updatedList);
    return updatedList;
};

export const clearShoppingList = () => {
    saveShoppingList([]);
    return [];
};

// Shopping History functions
export const getShoppingHistory = () => {
    return getFromStorage(STORAGE_KEYS.SHOPPING_HISTORY) || [];
};

export const addToHistory = (item) => {
    const history = getShoppingHistory();
    const existingIndex = history.findIndex(h =>
        h.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingIndex >= 0) {
        history[existingIndex].count += 1;
        history[existingIndex].lastPurchased = new Date().toISOString();
    } else {
        history.push({
            name: item.name,
            category: item.category,
            count: 1,
            lastPurchased: new Date().toISOString()
        });
    }

    saveToStorage(STORAGE_KEYS.SHOPPING_HISTORY, history);
    return history;
};

// User Preferences functions
export const getUserPreferences = () => {
    return getFromStorage(STORAGE_KEYS.USER_PREFERENCES) || {
        language: 'en-US',
        theme: 'light',
        voiceEnabled: true
    };
};

export const saveUserPreferences = (preferences) => {
    return saveToStorage(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

export const getSelectedLanguage = () => {
    return getFromStorage(STORAGE_KEYS.LANGUAGE) || 'en-US';
};

export const saveSelectedLanguage = (language) => {
    return saveToStorage(STORAGE_KEYS.LANGUAGE, language);
};