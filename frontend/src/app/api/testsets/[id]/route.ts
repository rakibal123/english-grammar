import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TestSet from '@/models/TestSet';
import Question from '@/models/Question';
import questionsDataRaw from '@/data/questions.json';

const questionsData = questionsDataRaw as Record<string, any[]>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let testSet: any = null;
  let questions: any[] = [];

  try {
    await connectDB();
    // Try finding by ID if valid ObjectId format
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      testSet = await TestSet.findById(id);
      if (testSet) {
        questions = await Question.find({ _id: { $in: testSet.questionIds } });
      }
    }
  } catch (err) {
    console.warn(`[api/testsets/${id}] Database query failed, checking static fallback:`, err);
  }

  // Fallback to questions.json if DB record not found or DB offline
  if (!testSet || questions.length === 0) {
    const rawQuestions = questionsData[id];
    if (rawQuestions && rawQuestions.length > 0) {
      testSet = {
        _id: id,
        title: `${id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Practice Test`,
        description: 'Authentic, context-based test questions.',
        difficulty: 'medium',
        questionCount: rawQuestions.length,
        timeLimitMinutes: 15,
        passingScore: 70,
      };
      questions = rawQuestions.map((q, idx) => ({
        _id: `q-${id}-${idx + 1}`,
        type: q.type || 'MCQ',
        difficulty: q.difficulty || 'medium',
        order: q.order || idx + 1,
        questionText: q.questionText,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        banglaExplanation: q.banglaExplanation || '',
        tags: q.tags || [],
      }));
    }
  }

  if (!testSet) {
    return NextResponse.json({ error: 'Test set not found' }, { status: 404 });
  }

  // Shuffle questions randomly
  const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
  const finalQuestions = shuffledQuestions.slice(0, testSet.questionCount || 10);

  return NextResponse.json({
    testSet: JSON.parse(JSON.stringify(testSet)),
    questions: JSON.parse(JSON.stringify(finalQuestions)),
  });
}

