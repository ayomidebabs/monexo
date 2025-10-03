import { Schema, Document, model, Model } from 'mongoose';
import { Product } from '../types/product.js';

interface IProductDocument extends Product, Document {}
interface IProductModel extends Model<IProductDocument> {}

const productSchema: Schema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, require: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },
    images: [{ type: String }],
    imagePublicIds: [{ type: String }],
    reviews: [
      {
        id: { type: Schema.Types.ObjectId },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true }
);

export default model<IProductDocument, IProductModel>('Product', productSchema);
