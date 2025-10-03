import { Types } from 'mongoose';

export interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  imagePublicIds?: string[];
  reviews: {
    id?: Types.ObjectId;
    user: Types.ObjectId | string;
    rating: number;
    comment: string;
    createdAt?: Date;
  }[];
}

export interface ProductQuery {
  limit: number;
  page: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
