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
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Reset any SENDING jobs from a previous crash
    queueManager.resetSendingJobs();
    
    this._processNext();
  }

  pause() {
    this.isRunning = false;
    this.isSleeping = false;
    this.sleepUntil = null;
  }

  async _processNext() {
    if (!this.isRunning || this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Check if we need to take a batch break
      const settings = settingsManager.getSettings();
      
      if (this.messagesSentInCurrentBatch >= settings.batchSize) {
        this.isSleeping = true;
        const sleepMs = settings.batchDelayMin * 60 * 1000;
        this.sleepUntil = Date.now() + sleepMs;
        
        console.log(`Batch size of ${settings.batchSize} reached. Sleeping for ${settings.batchDelayMin} minutes.`);
        
        // Wait in small increments so we can still be paused
        const checkIntervalMs = 5000;
        while (this.isRunning && Date.now() < this.sleepUntil) {
          await wait(checkIntervalMs);
        }
        
        this.isSleeping = false;
        this.sleepUntil = null;
        this.messagesSentInCurrentBatch = 0;
        
        if (!this.isRunning) {
          this.isProcessing = false;
          return;
        }
      }

      const job = queueManager.dequeueNext();
      
      if (!job) {
        this.isRunning = false; // Stop if nothing to process
        this.isProcessing = false;
        return;
      }
      
      const result = await messageSender.send(job, this.testMode);
      
      // Update job based on result
      let finalStatus = result.status === 'sent' ? 'SENT' : 'FAILED';
      if (result.status === 'test_ready') finalStatus = 'SENT'; // for testing purposes
      
      if (result.errorCode === 'ALREADY_SENT') finalStatus = 'ALREADY_SENT';
      else if (result.errorCode === 'INVALID_NUMBER') finalStatus = 'INVALID_NUMBER';

      queueManager.updateJob(job.leadId || job.id, {
        status: finalStatus,
        lastError: result.error || null,
        attempts: job.attempts + 1
      });

      this.messagesSentInCurrentBatch++;

      // Wait a random delay between messages if there are more jobs queued
      if (this.isRunning && queueManager.getStats().pending > 0 && this.messagesSentInCurrentBatch < settings.batchSize) {
         const delaySec = getRandomInt(settings.minDelaySec, settings.maxDelaySec);
         console.log(`Waiting ${delaySec}s before next message...`);
         
         const delayUntil = Date.now() + (delaySec * 1000);
         while (this.isRunning && Date.now() < delayUntil) {
            await wait(1000);
         }
      }

    } catch (e) {
      console.error('Unexpected error in queue processor:', e);
    } finally {
      this.isProcessing = false;
      
      // Proceed to next
      if (this.isRunning) {
        setTimeout(() => this._processNext(), 1000);
      }
    }
  }
}

export const queueProcessor = new QueueProcessor();
