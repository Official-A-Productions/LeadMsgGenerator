export const SELECTORS = {
  // QR Code: multiple variants to handle WhatsApp Web DOM changes over time
  QR_CODE: 'canvas[aria-label="Scan me!"], div[data-testid="qr-code"], canvas[role="img"], div[data-ref]',
  
  // Element present when chats list is visible (authenticated)
  CHATS_LIST: 'div[aria-label="Chat list"], div[data-testid="chat-list"], #pane-side',
  
  // The main message input box in a chat
  MESSAGE_INPUT: 'div[title="Type a message"], div[aria-placeholder="Type a message"], div[data-testid="conversation-compose-box-input"], footer div[contenteditable="true"]',
  
  // The send button (appears after typing)
  SEND_BUTTON: 'button[aria-label="Send"], button[data-testid="send"], span[data-icon="send"], span[data-testid="send"], button[data-tab="11"]',
  
  // Single checkmark (sent) or double checkmark (delivered/read) on the last message
  MESSAGE_SENT_CHECKMARK: 'span[aria-label=" Sent "], span[data-testid="msg-dblcheck"], span[data-icon="msg-check"]',
  MESSAGE_DELIVERED_CHECKMARK: 'span[aria-label=" Delivered "], span[data-testid="msg-dblcheck-ack"], span[data-icon="msg-dblcheck"]',
  MESSAGE_READ_CHECKMARK: 'span[aria-label=" Read "], span[data-testid="msg-dblcheck-ack"], span[data-icon="msg-dblcheck-ack"]',
  
  // Invalid phone number dialog indicators
  INVALID_NUMBER_DIALOG: 'div[data-testid="popup-contents"], div[data-animate-modal-popup="true"]',
  INVALID_NUMBER_OK_BUTTON: 'button[data-testid="popup-controls-ok"], div[role="button"]:has-text("OK"), button:has-text("OK"), button:has-text("Ok")'
};
