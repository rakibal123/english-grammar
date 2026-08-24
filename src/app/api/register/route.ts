import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, guestId } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    await connectDB();

    // Check existing
    const existing = await User.findOne({ email, isGuest: false });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);

    if (guestId) {
      const guestUser = await User.findOneAndUpdate(
        { guestId },
        {
          username, email, passwordHash,
          authProvider: 'credentials',
          isGuest: false,
          role: 'user',
        },
        { new: true }
      );
      if (guestUser) {
        return NextResponse.json({ success: true, userId: guestUser._id.toString() });
      }
    }

    const user = await User.create({
      username, email, passwordHash,
      authProvider: 'credentials',
      isGuest: false,
      role: 'user',
    });

    return NextResponse.json({ success: true, userId: user._id.toString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
