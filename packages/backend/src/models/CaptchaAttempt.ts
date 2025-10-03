import { Schema, Document, model, Model } from "mongoose";
import { CaptchaAttempt } from "../types/CaptchaAttempt.js";

interface ICaptchaAttemptDocument extends CaptchaAttempt, Document { }
export interface ICaptchaAttemptModel extends Model<ICaptchaAttemptDocument> { }

const CaptchaAttemptSchema = new Schema<ICaptchaAttemptDocument>({
    key: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now },
    lockedUntil: { type: Date },
    expireAt: { type: Date, expires: 0, required: true },
}, { timestamps: true });

export default model<ICaptchaAttemptDocument, ICaptchaAttemptModel>('CaptchaAttempt', CaptchaAttemptSchema);