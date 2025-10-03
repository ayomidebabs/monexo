export interface WebhookEvent {
  eventId: string;
  type: string;
  payload: object;
  receivedAt: Date;
  signature: string;
  processed: boolean;
  processingError?: string;
  source: 'stripe' | 'paystack';
}
