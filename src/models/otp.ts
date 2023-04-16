import mongoose, { Schema, Document, Model, model } from 'mongoose';

export interface IOtp extends Document {
  email: string
  otp: string
  createdAt: Date
  expiresAt: Date
}


const otpSchema: Schema<IOtp> = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    index: true,
    required: [true, 'userId is required'],
  },
  otp: {
    type: String,
    required: [true, 'Please enter a OTP']
  },
  createdAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

const Otp = model<IOtp>('Otp', otpSchema);

export default Otp;