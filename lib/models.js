import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, index: true },
    name: String,
  },
  { timestamps: true }
);

const QboConnectionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    realmId: { type: String, required: true, index: true },
    accessToken: String,
    refreshToken: String,
    tokenType: String,
    expiresAt: Date,
    environment: { type: String, default: process.env.ENVIRONMENT },
  },
  { timestamps: true }
);

// Prevent model overwrite upon hot reloading
export const User = mongoose.models.User || model('User', UserSchema);
export const QboConnection = mongoose.models.QboConnection || model('QboConnection', QboConnectionSchema);