import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TestAttempt from '@/models/TestAttempt';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json([], { status: 200 });

  await connectDB();
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
  
  let query = TestAttempt.find({ userId })
    .populate('topicId', 'title slug')
    .populate('testSetId', 'title')
    .sort({ createdAt: -1 });
    
  if (limit > 0) {
    query = query.limit(limit);
  }
  
  const attempts = await query;
  return NextResponse.json(JSON.parse(JSON.stringify(attempts)));
}
