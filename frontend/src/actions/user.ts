'use server';

import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';

export async function getOrCreateGuestUser() {
  await connectDB();
  const cookieStore = await cookies();
  let guestId = cookieStore.get('guest_id')?.value;

  if (!guestId) {
    guestId = uuidv4();
    // Cookie set via API route since server actions can't set cookies directly in all cases
  }

  let user = await User.findOne({ guestId });

  if (!user) {
    user = await User.create({
      username: `Guest_${guestId.slice(0, 6)}`,
      guestId,
      isGuest: true,
      authProvider: 'guest',
      role: 'user',
    });
  }

  return { user: JSON.parse(JSON.stringify(user)), guestId };
}

export async function registerUser(formData: {
  username: string;
  email: string;
  password: string;
  guestId?: string;
}) {
  await connectDB();

  const existingUser = await User.findOne({ email: formData.email });
  if (existingUser && !existingUser.isGuest) {
    return { error: 'Email already registered' };
  }

  const passwordHash = await bcrypt.hash(formData.password, 12);

  let user;
  if (formData.guestId) {
    // Migrate guest to registered
    user = await User.findOneAndUpdate(
      { guestId: formData.guestId },
      {
        username: formData.username,
        email: formData.email,
        passwordHash,
        authProvider: 'credentials',
        isGuest: false,
      },
      { new: true }
    );
  }

  if (!user) {
    user = await User.create({
      username: formData.username,
      email: formData.email,
      passwordHash,
      authProvider: 'credentials',
      isGuest: false,
      role: 'user',
    });
  }

  await signIn('credentials', {
    email: formData.email,
    password: formData.password,
    redirect: false,
  });

  return { success: true, userId: user._id.toString() };
}

export async function getUserById(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function updateStreak(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (lastActive) {
    const diffMs = now.getTime() - lastActive.getTime();
    if (diffMs < oneDayMs) {
      // Same day
      if (user.currentStreak === 0) {
        user.currentStreak = 1;
        user.longestStreak = Math.max(1, user.longestStreak);
      }
    } else if (diffMs < 2 * oneDayMs) {
      // Next day → increment streak
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    } else {
      // Missed a day → reset
      user.currentStreak = 1;
    }
  } else {
    user.currentStreak = 1;
  }

  user.lastActiveAt = now;
  await user.save();
}
