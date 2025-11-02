import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OtpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

OtpSchema.statics.generateOtp = async function (email, purpose) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await this.deleteMany({ email, purpose });

  const record = await this.create({ email, otp, purpose, expiresAt });
  return record.otp;
};

const Otp = model("Otp", OtpSchema);
export default Otp;
