import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load root .env file if available
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (e) {
    console.log('Loaded env file from root');
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import { whatsappRouter } from './routes/whatsapp.js';

app.use('/api/whatsapp', whatsappRouter);

app.listen(PORT, () => {
  console.log(`WhatsApp server listening on port ${PORT}`);
});
