import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import UserProgress from '@/models/UserProgress';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json([], { status: 200 });

  await connectDB();
  const progress = await UserProgress.find({ userId }).populate('topicId', 'title slug color order');
  return NextResponse.json(JSON.parse(JSON.stringify(progress)));
}
