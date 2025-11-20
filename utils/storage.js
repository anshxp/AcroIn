// utils/storage.js

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save any value (auto converts JSON)
 */
export const saveItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("❌ Storage save error:", e);
    return false;
  }
};

/**
 * Retrieve any value (auto parses JSON)
 */
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("❌ Storage read error:", e);
    return null;
  }
};

/**
 * Remove a value
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("❌ Storage delete error:", e);
    return false;
  }
};

/**
 * Clear entire storage (use with caution)
 */
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (e) {
    console.error("❌ Storage clear error:", e);
    return false;
  }
};
