import { Schema, Document, model, Model } from "mongoose";
import { Category } from "../types/category.js";

interface ICategoryDocument extends Category, Document { }
export interface ICategoryModel extends Model<ICategoryDocument> { }

const categorySchema: Schema = new Schema<ICategoryDocument>({
    name: { type: String, required: true },
    description: { type: String },
});

export default model<ICategoryDocument, ICategoryModel>("Category", categorySchema);