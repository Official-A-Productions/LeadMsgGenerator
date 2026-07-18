export const SELECTORS = {
  // QR Code canvas for scanning
  QR_CODE: 'canvas[aria-label="Scan me!"]',
  
  // Element present when chats list is visible (authenticated)
  CHATS_LIST: 'div[aria-label="Chat list"]',
  
  // The main message input box in a chat
  MESSAGE_INPUT: 'div[title="Type a message"]',
  
  // The send button (appears after typing)
  SEND_BUTTON: 'button[aria-label="Send"]',
  
  // Single checkmark (sent) or double checkmark (delivered/read) on the last message
  MESSAGE_SENT_CHECKMARK: 'span[aria-label=" Sent "]',
  MESSAGE_DELIVERED_CHECKMARK: 'span[aria-label=" Delivered "]',
  MESSAGE_READ_CHECKMARK: 'span[aria-label=" Read "]',
  
  // Invalid phone number dialog
  INVALID_NUMBER_DIALOG: 'div[data-testid="popup-contents"]', // This might need refinement depending on actual DOM
  INVALID_NUMBER_OK_BUTTON: 'button[data-testid="popup-controls-ok"]'
};
