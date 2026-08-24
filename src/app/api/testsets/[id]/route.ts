import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TestSet from '@/models/TestSet';
import Question from '@/models/Question';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();

  const testSet = await TestSet.findById(id);
  if (!testSet) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const questions = await Question.find({ _id: { $in: testSet.questionIds } }).sort('order');

  return NextResponse.json({
    testSet: JSON.parse(JSON.stringify(testSet)),
    questions: JSON.parse(JSON.stringify(questions)),
  });
}
