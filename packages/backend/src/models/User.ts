import { Schema, Document, model, Model } from 'mongoose';
import { User } from '../types/appUser.js';
import { hashPassword } from '../utils/pswdEncryption.js';
export interface IUserDocument extends User, Document {}
export interface IUserModel extends Model<IUserDocument> {}

const UserSchema: Schema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    local: {
      password: { type: String },
      addresses: [
        {
          street: { type: String },
          city: { type: String },
          country: { type: String },
          zipcode: { type: String },
        },
      ],
    },
    google: {
      id: { type: String },
      avatar: { type: String },
    },
    facebook: {
      id: { type: String },
      avatar: { type: String },
    },
    strategy: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'seller'],
      default: 'customer',
    },
    cart: [
      {
        pId: Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        imageSrc: String,
        imageAlt: String,
        stock: Number,
      },
    ],
    wishlist: [
      {
        pId: Schema.Types.ObjectId,
      },
    ],
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    recentlyViewedProducts: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        imageSrc: { type: String, required: true },
        imageAlt: { type: String, required: true },
        link: { type: String, required: true },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    stripeCustomerId: { type: String },
    paystackPaymentMethods: [
      {
        _id: { type: String },
        userId: { type: String },
        authorizationCode: { type: String },
        customerCode: { type: String },
        email: { type: String },
        cardType: { type: String },
        last4: { type: String },
        expMonth: { type: String },
        expYear: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    failedSignInAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre('validate', function (this: IUserDocument, next) {
  if (this.strategy === 'local' && !this.local.password) {
    return next(new Error('Password is required for local strategy'));
  }
  if (this.strategy === 'google' && !this.google.id) {
    return next(new Error('Google ID is required for google strategy'));
  }
  if (this.strategy === 'facebook' && !this.facebook.id) {
    return next(new Error('Facebook ID is required for facebook strategy'));
  }
  next();
});

UserSchema.pre('save', async function (this: IUserDocument, next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }

  if (
    this.strategy === 'local' &&
    this.local.password &&
    this.isModified('local.password')
  ) {
    this.local.password = await hashPassword(this.local.password);
  }
  next();
});

export default model<IUserDocument, IUserModel>('User', UserSchema);
