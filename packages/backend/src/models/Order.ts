import { Schema, Document, model, Model } from 'mongoose';
import { Order } from '../types/order.js';

interface IOrderDocument extends Order, Document {}
interface IOrderModel extends Model<IOrderDocument> {}

const orderSchema: Schema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    products: [
      {
        pId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, require: true },
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered'],
      default: 'pending',
    },
    paymentDetails: {
      method: { type: String, required: true },
      transactionId: { type: String },
    },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IOrderDocument, IOrderModel>('Order', orderSchema);
