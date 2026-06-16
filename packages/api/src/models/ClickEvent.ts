import { Schema, model, Document, Types } from "mongoose";

export interface IClickEvent extends Document {
  _id: Types.ObjectId;
  linkId: Types.ObjectId;
  referrer: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  createdAt: Date;
}

const clickEventSchema = new Schema<IClickEvent>(
  {
    linkId: { type: Schema.Types.ObjectId, ref: "Link", required: true },
    referrer: { type: String, default: "direct" },
    userAgent: { type: String, default: "" },
    deviceType: { type: String, default: "unknown" },
    browser: { type: String, default: "unknown" },
    os: { type: String, default: "unknown" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Core analytics query: all events for a link ordered by time
clickEventSchema.index({ linkId: 1, createdAt: 1 });

export const ClickEvent = model<IClickEvent>("ClickEvent", clickEventSchema);
