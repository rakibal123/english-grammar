import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GrammarTopic from '@/models/GrammarTopic';
import Lesson from '@/models/Lesson';
import Question from '@/models/Question';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const [topicsCount, lessonsCount, questionsCount, usersCount] = await Promise.all([
    GrammarTopic.countDocuments(),
    Lesson.countDocuments(),
    Question.countDocuments(),
    User.countDocuments({ isGuest: false }),
  ]);

  return NextResponse.json({ topicsCount, lessonsCount, questionsCount, usersCount });
}
