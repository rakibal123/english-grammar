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

  const questions = await Question.find({ _id: { $in: testSet.questionIds } });

  // Shuffle questions randomly
  const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
  
  // Optional: slice to questionCount if there are more questions available
  const finalQuestions = shuffledQuestions.slice(0, testSet.questionCount || 10);

  return NextResponse.json({
    testSet: JSON.parse(JSON.stringify(testSet)),
    questions: JSON.parse(JSON.stringify(finalQuestions)),
  });
}
