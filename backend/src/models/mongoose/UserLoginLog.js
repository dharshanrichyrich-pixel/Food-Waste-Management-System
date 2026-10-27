import mongoose from 'mongoose';

const userLoginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['donor', 'recipient', 'volunteer', 'admin'],
    },
    displayName: {
      type: String,
      default: '',
    },
    organizationName: {
      type: String,
      default: '',
    },
    loginAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: '',
    },
    loginType: {
      type: String,
      enum: ['STANDARD', 'DEMO', 'REGISTRATION'],
      default: 'STANDARD',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

export const UserLoginLog = mongoose.models.UserLoginLog || mongoose.model('UserLoginLog', userLoginLogSchema);
export default UserLoginLog;
