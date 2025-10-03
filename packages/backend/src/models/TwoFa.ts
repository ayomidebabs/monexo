import { Schema, Document, model, Model } from "mongoose";
import { TwoFA } from "../types/twoFa.js";

interface ITwoFaDocument extends TwoFA, Document { }
interface ITwoFaModel extends Model<ITwoFaDocument> { }

const twoFASchema = new Schema<ITwoFaDocument>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
 code: { type: String, required: true },
 expireAt: { type: Date, expires: 0, required: true }, 
}, { timestamps: true });

export default model<ITwoFaDocument, ITwoFaModel>('TwoFACode', twoFASchema);;