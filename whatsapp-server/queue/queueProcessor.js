import { queueManager } from './queueManager.js';
import { messageSender } from '../whatsapp/messageSender.js';
import { settingsManager } from './settingsManager.js';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class QueueProcessor {
  constructor() {
    this.isRunning = false;
    this.isProcessing = false;
    this.isSleeping = false;
    this.sleepUntil = null;
    this.testMode = process.env.WHATSAPP_TEST_MODE === 'true';
    this.messagesSentInCurrentBatch = 0;
    this.currentActivity = 'Idle';
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentActivity = 'Starting queue...';
    
    // Reset any SENDING jobs from a previous crash
    queueManager.resetSendingJobs();
    
    this._processNext();
  }

  pause() {
    this.isRunning = false;
    this.isSleeping = false;
    this.sleepUntil = null;
    this.currentActivity = 'Paused';
  }

  async _processNext() {
    if (!this.isRunning || this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      const settings = settingsManager.getSettings();
      
      if (this.messagesSentInCurrentBatch >= settings.batchSize) {
        this.isSleeping = true;
        const sleepMs = settings.batchDelayMin * 60 * 1000;
        this.sleepUntil = Date.now() + sleepMs;
        
        const msg = `Batch limit (${settings.batchSize}) reached. Taking a break for ${settings.batchDelayMin} mins.`;
        console.log(`[QueueProcessor] ${msg}`);
        this.currentActivity = msg;
        
        const checkIntervalMs = 5000;
        while (this.isRunning && Date.now() < this.sleepUntil) {
          await wait(checkIntervalMs);
        }
        
        this.isSleeping = false;
        this.sleepUntil = null;
        this.messagesSentInCurrentBatch = 0;
        
        if (!this.isRunning) {
          this.currentActivity = 'Paused';
          this.isProcessing = false;
          return;
        }
      }

      const job = queueManager.dequeueNext();
      
      if (!job) {
        console.log('[QueueProcessor] No pending jobs in queue. Stopping queue.');
        this.isRunning = false;
        this.currentActivity = 'Queue completed';
        this.isProcessing = false;
        return;
      }

      this.currentActivity = `Sending to ${job.businessName || job.phoneNumber}...`;
      console.log(`[QueueProcessor] ${this.currentActivity}`);
      
      const result = await messageSender.send(job, this.testMode);
      
      let finalStatus = result.status === 'sent' ? 'SENT' : 'FAILED';
      if (result.status === 'test_ready') finalStatus = 'SENT';
      
      if (result.errorCode === 'ALREADY_SENT') finalStatus = 'ALREADY_SENT';
      else if (result.errorCode === 'INVALID_NUMBER') finalStatus = 'INVALID_NUMBER';

      queueManager.updateJob(job.leadId || job.id, {
        status: finalStatus,
        lastError: result.error || null,
        attempts: job.attempts + 1
      });

      this.messagesSentInCurrentBatch++;

      // Wait random delay between messages if more jobs remain
      if (this.isRunning && queueManager.getStats().pending > 0 && this.messagesSentInCurrentBatch < settings.batchSize) {
        const delaySec = getRandomInt(settings.minDelaySec, settings.maxDelaySec);
        const delayMsg = `Message dispatched. Delaying ${delaySec}s before next...`;
        console.log(`[QueueProcessor] ${delayMsg}`);
        this.currentActivity = delayMsg;
        
        const delayUntil = Date.now() + (delaySec * 1000);
        while (this.isRunning && Date.now() < delayUntil) {
          await wait(1000);
        }
      }

    } catch (e) {
      console.error('[QueueProcessor] Unexpected error:', e);
      this.currentActivity = `Error: ${e.message}`;
    } finally {
      this.isProcessing = false;
      
      if (this.isRunning) {
        setTimeout(() => this._processNext(), 1000);
      }
    }
  }
}

export const queueProcessor = new QueueProcessor();
