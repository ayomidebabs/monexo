import { Schema, Document, model, Model } from "mongoose";
import { Lockout } from "../types/lockOut.js";

interface ILockoutDocument extends Lockout, Document { }
export interface ILockoutModel extends Model<ILockoutDocument> { }

const lockoutSchema = new Schema<ILockoutDocument>({
 key: { type: String, required: true, unique: true }, 
 attempts: { type: Number, default: 0 },
 lockedUntil: { type: Date },
 expireAt: { type: Date, expires: 0, required: true }, 
}, { timestamps: true });

export default model<ILockoutDocument, ILockoutModel>('Lockout', lockoutSchema);