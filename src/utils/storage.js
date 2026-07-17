import { APP_CONFIG } from '../config/app.js';

const PREFIX = APP_CONFIG.storagePrefix;

/**
 * Safe localStorage wrapper with JSON serialization.
 * Never logs values to console.
 */

export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
}

export function storageClear() {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}
