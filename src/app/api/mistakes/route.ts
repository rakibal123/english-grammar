import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import UserMistake from '@/models/UserMistake';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json([], { status: 200 });

  await connectDB();
  const mistakes = await UserMistake.find({ userId, resolved: false })
    .populate('questionId')
    .populate('topicId', 'title slug')
    .sort({ lastSeenAt: -1 })
    .limit(50);
  return NextResponse.json(JSON.parse(JSON.stringify(mistakes)));
}
