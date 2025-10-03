import { Types } from "mongoose";

export interface TwoFA {
  userId: Types.ObjectId;
  code: string;
  expireAt: Date;
}