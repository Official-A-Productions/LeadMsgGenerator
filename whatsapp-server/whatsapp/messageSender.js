import { whatsappClient } from './whatsappClient.js';
import { deliveryLogger } from '../logging/deliveryLogger.js';
import { normalizePhone } from './phoneNormalizer.js';

class MessageSender {
  async send(job, isTestMode) {
    // 1. Duplicate check (by leadId)
    const history = deliveryLogger.getHistory();
    const alreadySent = history.find(h => h.leadId === job.leadId && h.status === 'sent');
    if (alreadySent) {
      return { status: 'failed', errorCode: 'ALREADY_SENT', error: 'Lead already received a message successfully' };
    }

    // 2. Normalize phone
    const defaultCountry = process.env.WHATSAPP_DEFAULT_COUNTRY || 'IN';
    const phoneInfo = normalizePhone(job.phoneNumber, defaultCountry);
    
    if (!phoneInfo.valid) {
      return { status: 'failed', errorCode: 'INVALID_NUMBER', error: phoneInfo.error };
    }

    // 3. Send
    let result;
    if (isTestMode) {
      result = await whatsappClient.testMode(phoneInfo.normalized, job.message);
    } else {
      result = await whatsappClient.sendMessage(phoneInfo.normalized, job.message);
    }

    // 4. Log
    if (!isTestMode || result.status === 'test_ready') {
       deliveryLogger.log({
          leadId: job.leadId,
          phoneNumber: phoneInfo.normalized,
          status: result.status === 'test_ready' ? 'sent' : result.status, // log tests as sent for now to prevent dupes in test mode
          errorCode: result.errorCode,
          error: result.error
       });
    }

    return result;
  }
}

export const messageSender = new MessageSender();
