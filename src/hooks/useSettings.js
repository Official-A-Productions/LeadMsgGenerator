import { useState, useCallback } from 'react';
import { storageGet, storageSet } from '../utils/storage.js';
import { DEFAULT_MESSAGE_SETTINGS } from '../config/defaults.js';
import { PROVIDER_DEFINITIONS } from '../config/providers.js';

const SETTINGS_KEY = 'app_settings';

function getDefaultSettings() {
  return {
    activeProviderId: PROVIDER_DEFINITIONS[0]?.id || 'gemini',
    providerKeys: {
      gemini: [],
      groq: [],
    },
    providerModels: {
      gemini: PROVIDER_DEFINITIONS.find((p) => p.id === 'gemini')?.defaultModel || 'gemini-1.5-flash',
      groq: PROVIDER_DEFINITIONS.find((p) => p.id === 'groq')?.defaultModel || 'llama-3.1-8b-instant',
    },
    messageSettings: { ...DEFAULT_MESSAGE_SETTINGS },
  };
}

/**
 * Persistent settings hook.
 * All values stored in localStorage, never logs keys.
 */
export function useSettings() {
  const [settings, setSettingsState] = useState(() => {
    const saved = storageGet(SETTINGS_KEY);
    const defaults = getDefaultSettings();
    if (!saved) return defaults;

    // Validate stored models to force fallback if deprecated in providers config
    const geminiModels = PROVIDER_DEFINITIONS.find((p) => p.id === 'gemini')?.models || [];
    const groqModels = PROVIDER_DEFINITIONS.find((p) => p.id === 'groq')?.models || [];
    const savedModels = saved.providerModels || {};

    const finalModels = {
      gemini: geminiModels.includes(savedModels.gemini) ? savedModels.gemini : defaults.providerModels.gemini,
      groq: groqModels.includes(savedModels.groq) ? savedModels.groq : defaults.providerModels.groq,
    };

    return {
      ...defaults,
      ...saved,
      providerModels: finalModels,
      providerKeys: {
        ...defaults.providerKeys,
        ...(saved.providerKeys || {}),
      },
      messageSettings: {
        ...DEFAULT_MESSAGE_SETTINGS,
        ...(saved.messageSettings || {}),
      },
    };
  });

  const updateSettings = useCallback((updater) => {
    setSettingsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      storageSet(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  // --- Provider helpers ---

  const setActiveProvider = useCallback(
    (providerId) => updateSettings((s) => ({ ...s, activeProviderId: providerId })),
    [updateSettings]
  );

  const addKey = useCallback(
    (providerId, key) =>
      updateSettings((s) => ({
        ...s,
        providerKeys: {
          ...s.providerKeys,
          [providerId]: [...(s.providerKeys[providerId] || []), key.trim()],
        },
      })),
    [updateSettings]
  );

  const removeKey = useCallback(
    (providerId, index) =>
      updateSettings((s) => ({
        ...s,
        providerKeys: {
          ...s.providerKeys,
          [providerId]: s.providerKeys[providerId].filter((_, i) => i !== index),
        },
      })),
    [updateSettings]
  );

  const reorderKeys = useCallback(
    (providerId, newKeys) =>
      updateSettings((s) => ({
        ...s,
        providerKeys: { ...s.providerKeys, [providerId]: newKeys },
      })),
    [updateSettings]
  );

  const setModel = useCallback(
    (providerId, model) =>
      updateSettings((s) => ({
        ...s,
        providerModels: { ...s.providerModels, [providerId]: model },
      })),
    [updateSettings]
  );

  // --- Message settings helpers ---

  const updateMessageSettings = useCallback(
    (patch) =>
      updateSettings((s) => ({
        ...s,
        messageSettings: { ...s.messageSettings, ...patch },
      })),
    [updateSettings]
  );

  return {
    settings,
    setActiveProvider,
    addKey,
    removeKey,
    reorderKeys,
    setModel,
    updateMessageSettings,
    updateSettings,
  };
}
