import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await connectDB();
  
  const session = await auth();
  let user;

  if (session?.user?.id) {
    user = await User.findById(session.user.id);
  } else {
    const guestId = request.cookies.get('guest_id')?.value;

    if (!guestId) {
      return NextResponse.json({ error: 'No guest ID' }, { status: 400 });
    }

    user = await User.findOne({ guestId });

    if (!user) {
      user = await User.create({
        username: `Guest_${guestId.slice(0, 6)}`,
        guestId,
        isGuest: true,
        authProvider: 'guest',
        role: 'user',
      });
    }
  }

  if (!user) {
     return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user._id.toString(),
    username: user.username,
    isGuest: user.isGuest,
    xp: user.xp,
    level: user.level,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
  });
}
