import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  minDelaySec: 15,
  maxDelaySec: 30,
  batchSize: 10,
  batchDelayMin: 15
};

class SettingsManager {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      this._writeSettings(DEFAULT_SETTINGS);
    }
  }

  getSettings() {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(patch) {
    const current = this.getSettings();
    const updated = { ...current, ...patch };
    this._writeSettings(updated);
    return updated;
  }

  _writeSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  }
}

export const settingsManager = new SettingsManager();
