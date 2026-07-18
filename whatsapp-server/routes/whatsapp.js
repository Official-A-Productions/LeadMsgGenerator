import express from 'express';
import { whatsappClient } from '../whatsapp/whatsappClient.js';
import { queueManager } from '../queue/queueManager.js';
import { queueProcessor } from '../queue/queueProcessor.js';
import { deliveryLogger } from '../logging/deliveryLogger.js';
import { settingsManager } from '../queue/settingsManager.js';

export const whatsappRouter = express.Router();

whatsappRouter.get('/status', async (req, res) => {
  const authStatus = await whatsappClient.getAuthStatus();
  const queueStats = queueManager.getStats();
  
  res.json({
    authStatus,
    queueStats,
    processorRunning: queueProcessor.isRunning,
    isSleeping: queueProcessor.isSleeping,
    sleepUntil: queueProcessor.sleepUntil,
    messagesSentInCurrentBatch: queueProcessor.messagesSentInCurrentBatch
  });
});

whatsappRouter.get('/settings', (req, res) => {
  res.json(settingsManager.getSettings());
});

whatsappRouter.post('/settings', (req, res) => {
  const updated = settingsManager.updateSettings(req.body);
  res.json(updated);
});

whatsappRouter.post('/queue', (req, res) => {
  const jobs = req.body;
  if (!jobs) return res.status(400).json({ error: 'Missing jobs payload' });
  
  const count = queueManager.enqueue(jobs);
  res.json({ added: count });
});

whatsappRouter.get('/queue', (req, res) => {
  res.json(queueManager.getAll());
});

whatsappRouter.patch('/queue/:id', (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  
  let job = queueManager.getAll().find(j => j.id === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  
  if (action === 'cancel') {
    job = queueManager.updateJob(id, { status: 'CANCELLED' });
  } else if (action === 'retry') {
    job = queueManager.updateJob(id, { status: 'RETRY_PENDING', attempts: 0, lastError: null });
  }
  
  res.json(job);
});

whatsappRouter.post('/queue/start', (req, res) => {
  queueProcessor.start();
  res.json({ status: 'started' });
});

whatsappRouter.post('/queue/pause', (req, res) => {
  queueProcessor.pause();
  res.json({ status: 'paused' });
});

whatsappRouter.get('/history', (req, res) => {
  res.json(deliveryLogger.getHistory());
});
