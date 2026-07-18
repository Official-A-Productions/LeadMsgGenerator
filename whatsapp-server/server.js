import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import { whatsappRouter } from './routes/whatsapp.js';

app.use('/api/whatsapp', whatsappRouter);

app.listen(PORT, () => {
  console.log(`WhatsApp server listening on port ${PORT}`);
});
