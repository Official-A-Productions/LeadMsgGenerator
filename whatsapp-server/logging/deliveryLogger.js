import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const LOG_FILE = path.join(DATA_DIR, 'delivery-log.jsonl');

class DeliveryLogger {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, '');
    }
  }

  log(entry) {
    const logLine = JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString()
    }) + '\n';
    
    fs.appendFileSync(LOG_FILE, logLine);
  }

  getHistory() {
    if (!fs.existsSync(LOG_FILE)) return [];
    
    const lines = fs.readFileSync(LOG_FILE, 'utf-8').split('\n').filter(Boolean);
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }
}

export const deliveryLogger = new DeliveryLogger();
