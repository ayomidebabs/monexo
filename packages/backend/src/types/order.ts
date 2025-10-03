import { Types } from 'mongoose';

export interface Order {
  user: Types.ObjectId | string;
  email: string;
  products: {
    pId: Types.ObjectId | string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentDetails: {
    method: string;
    transactionId?: string;
  };
  currency: string;
}
