import { Schema, model, Document, Types } from "mongoose";

export interface ILink extends Document {
  _id: Types.ObjectId;
  originalUrl: string;
  code: string;
  alias?: string;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    originalUrl: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    alias: { type: String, sparse: true },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// List links sorted newest-first
linkSchema.index({ createdAt: -1 });

export const Link = model<ILink>("Link", linkSchema);
