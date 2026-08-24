import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GrammarTopic from '@/models/GrammarTopic';
import Lesson from '@/models/Lesson';
import Example from '@/models/Example';
import TestSet from '@/models/TestSet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await connectDB();

  const topic = await GrammarTopic.findOne({ slug }).populate('categoryId', 'title');
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [lessons, examples, testSets] = await Promise.all([
    Lesson.find({ topicId: topic._id, status: 'published' }).sort('order'),
    Example.find({ topicId: topic._id }).sort('order'),
    TestSet.find({ topicId: topic._id }).sort('order'),
  ]);

  return NextResponse.json({
    topic: JSON.parse(JSON.stringify(topic)),
    lessons: JSON.parse(JSON.stringify(lessons)),
    examples: JSON.parse(JSON.stringify(examples)),
    testSets: JSON.parse(JSON.stringify(testSets)),
  });
}
