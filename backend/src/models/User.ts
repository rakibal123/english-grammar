import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email?: string;
  passwordHash?: string;
  authProvider: 'credentials' | 'google' | 'guest';
  guestId?: string;
  isGuest: boolean;
  role: 'user' | 'admin';
  userType?: 'student' | 'teacher';
  avatar?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
    passwordHash: { type: String, select: false },
    authProvider: { type: String, enum: ['credentials', 'google', 'guest'], default: 'guest' },
    guestId: { type: String, sparse: true, unique: true },
    isGuest: { type: Boolean, default: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    userType: { type: String, enum: ['student', 'teacher'], default: 'student' },
    avatar: String,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
