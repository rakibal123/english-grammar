import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TestAttempt from '@/models/TestAttempt';
import Question from '@/models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  const attempt = await TestAttempt.findById(id)
    .populate({ path: 'answers.questionId', model: Question })
    .populate('topicId', 'title slug color')
    .populate('testSetId', 'title');

  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify(attempt)));
}
