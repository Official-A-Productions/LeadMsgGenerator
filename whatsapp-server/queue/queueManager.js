import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.json');

class QueueManager {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(QUEUE_FILE)) {
      this._writeQueue([]);
    }
  }

  _readQueue() {
    try {
      const data = fs.readFileSync(QUEUE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  _writeQueue(queue) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  }

  getAll() {
    return this._readQueue();
  }

  getStats() {
    const queue = this._readQueue();
    const stats = {
      total: queue.length,
      pending: 0,
      sending: 0,
      sent: 0,
      failed: 0,
      cancelled: 0
    };

    queue.forEach(job => {
      if (['PENDING', 'QUEUED', 'RETRY_PENDING'].includes(job.status)) stats.pending++;
      else if (job.status === 'SENDING') stats.sending++;
      else if (job.status === 'SENT') stats.sent++;
      else if (job.status === 'FAILED') stats.failed++;
      else if (job.status === 'CANCELLED') stats.cancelled++;
    });

    return stats;
  }

  enqueue(jobs) {
    const queue = this._readQueue();
    let addedCount = 0;
    
    // jobs can be array or single object
    const jobsArray = Array.isArray(jobs) ? jobs : [jobs];

    jobsArray.forEach(newJob => {
      // Prevent duplicates by leadId
      if (!queue.find(j => j.leadId === newJob.leadId)) {
        queue.push({
          ...newJob,
          id: newJob.id || newJob.leadId, // ensure id field exists for PATCH lookups
          status: 'QUEUED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attempts: 0,
          lastError: null
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this._writeQueue(queue);
    }
    return addedCount;
  }

  dequeueNext() {
    const queue = this._readQueue();
    const jobIndex = queue.findIndex(j => ['QUEUED', 'RETRY_PENDING'].includes(j.status));
    
    if (jobIndex >= 0) {
      const job = queue[jobIndex];
      job.status = 'SENDING';
      job.updatedAt = new Date().toISOString();
      this._writeQueue(queue);
      return job;
    }
    return null;
  }

  updateJob(id, patch) {
    const queue = this._readQueue();
    const jobIndex = queue.findIndex(j => j.id === id || j.leadId === id);
    if (jobIndex >= 0) {
      queue[jobIndex] = {
        ...queue[jobIndex],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      this._writeQueue(queue);
      return queue[jobIndex];
    }
    return null;
  }


  resetSendingJobs() {
    const queue = this._readQueue();
    let updated = false;
    queue.forEach(job => {
      if (job.status === 'SENDING') {
        job.status = 'RETRY_PENDING';
        updated = true;
      }
    });
    if (updated) {
      this._writeQueue(queue);
    }
  }

  // Remove all finished jobs (SENT, CANCELLED, FAILED, etc.)
  clearCompleted() {
    const active = this._readQueue().filter(j =>
      ['QUEUED', 'RETRY_PENDING', 'SENDING'].includes(j.status)
    );
    this._writeQueue(active);
    return active.length;
  }

  // Wipe the entire queue
  purgeAll() {
    this._writeQueue([]);
  }
}

export const queueManager = new QueueManager();
