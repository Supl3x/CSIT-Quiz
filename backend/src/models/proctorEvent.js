import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ProctorEventSchema = new Schema(
  {
    attempt: { type: Schema.Types.ObjectId, ref: "Attempt", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventType: {
      type: String,
      enum: ["tab_switch", "blur", "focus", "fullscreen_exit", "copy", "paste", "visibility_hidden", "visibility_visible", "disconnect"],
      required: true,
    },
    detail: { type: Schema.Types.Mixed },
    source: { type: String, enum: ["socket", "rest"], default: "socket" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProctorEventSchema.index({ attempt: 1, student: 1, recordedAt: 1 });

export default model("ProctorEvent", ProctorEventSchema);
