import { Types } from 'mongoose';

export interface User {
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'seller';
  strategy: 'local' | 'google' | 'facebook';
  cart: {
    pId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    imageSrc: string;
    imageAlt: string;
    stock: number;
  }[];
  wishlist: {
    pId: Types.ObjectId;
  }[];
  themePreference: 'light' | 'dark' | 'system';
  recentlyViewedProducts: {
    id: string;
    name: string;
    price: number;
    imageSrc: string;
    imageAlt: string;
    link: string;
    viewedAt: Date;
  }[];
  local: {
    password: string;
    addresses: {
      street: string;
      city: string;
      country: string;
      zipCode: string;
    }[];
  };
  google: {
    id: string;
    avatar: string;
  };
  facebook: {
    id: string;
    avatar: string;
  };
  stripeCustomerId: string;
  paystackPaymentMethods: {
    _id: string;
    userId: string;
    authorizationCode: string;
    customerCode: string;
    email: string;
    cardType: string;
    last4: string;
    expMonth: string;
    expYear: string;
    isDefault: boolean;
  }[];
  failedSignInAttempts: number;
  lockedUntil: Date | undefined;
}
