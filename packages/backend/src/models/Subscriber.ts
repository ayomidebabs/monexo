import { Schema, Document, model, Model } from 'mongoose';
import { NewsletterSubscriber } from '../types/newsletterSubscriber.js';

interface INewsletterSubscriberDocument
  extends NewsletterSubscriber,
    Document {}
interface INewsletterSubscriberModel
  extends Model<INewsletterSubscriberDocument> {}

const subscriberSchema = new Schema<INewsletterSubscriberDocument>({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

export default model<INewsletterSubscriberDocument, INewsletterSubscriberModel>(
  'Subscriber',
  subscriberSchema
);
