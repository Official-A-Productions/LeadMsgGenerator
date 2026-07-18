import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/whatsapp/whatsappApi.js';

export function useWhatsApp() {
  const [status, setStatus] = useState(null);
  const [queue, setQueue] = useState([]);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const refreshStatus = useCallback(async () => {
    try {
      const st = await api.fetchStatus();
      setStatus(st);
      setError(null);
    } catch (e) {
      setError('Could not connect to WhatsApp Automation Server');
    }
  }, []);

  const refreshQueue = useCallback(async () => {
    try {
      const q = await api.fetchQueue();
      setQueue(q);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const s = await api.fetchSettings();
      setSettings(s);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    refreshQueue();
    refreshSettings();
    const interval = setInterval(() => {
      refreshStatus();
      refreshQueue();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshStatus, refreshQueue, refreshSettings]);

  const enqueue = async (jobs) => {
    await api.enqueueJobs(jobs);
    refreshQueue();
    refreshStatus();
  };

  const start = async () => {
    await api.startQueue();
    refreshStatus();
  };

  const pause = async () => {
    await api.pauseQueue();
    refreshStatus();
  };

  const cancelJob = async (id) => {
    await api.updateJobAction(id, 'cancel');
    refreshQueue();
  };

  const retryJob = async (id) => {
    await api.updateJobAction(id, 'retry');
    refreshQueue();
  };

  const updateSettings = async (patch) => {
    const updated = await api.updateSettings(patch);
    setSettings(updated);
  };

  return {
    status,
    queue,
    settings,
    error,
    enqueue,
    start,
    pause,
    cancelJob,
    retryJob,
    updateSettings
  };
}
