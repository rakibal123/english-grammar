import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GrammarTopic from '@/models/GrammarTopic';
import Lesson from '@/models/Lesson';
import Example from '@/models/Example';
import TestSet from '@/models/TestSet';
import lessonsDataRaw from '@/data/lessons.json';

interface LessonData {
  title: string;
  description: string;
  rules: Array<{
    title: string;
    structure: string;
    explanation: string;
    banglaExplanation?: string;
    examples: string[];
  }>;
  keyPoints: string[];
  whenToUse: string[];
  examples?: Array<{
    englishText: string;
    banglaText: string;
    category?: string;
  }>;
}

const lessonsData = lessonsDataRaw as Record<string, LessonData>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await connectDB();

  const topic = await GrammarTopic.findOne({ slug }).populate('categoryId', 'title');
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [dbLessons, dbExamples, testSets] = await Promise.all([
    Lesson.find({ topicId: topic._id, status: 'published' }).sort('order'),
    Example.find({ topicId: topic._id }).sort('order'),
    TestSet.find({ topicId: topic._id }).sort('order'),
  ]);

  let lessons = JSON.parse(JSON.stringify(dbLessons));
  let examples = JSON.parse(JSON.stringify(dbExamples));

  // Fetch from lessons.json for comprehensive lesson details
  const jsonLesson = lessonsData[slug];
  if (jsonLesson) {
    lessons = [
      {
        _id: dbLessons[0]?._id?.toString() || `lesson-${slug}`,
        topicId: topic._id,
        title: jsonLesson.title,
        description: jsonLesson.description,
        rules: jsonLesson.rules,
        keyPoints: jsonLesson.keyPoints,
        whenToUse: jsonLesson.whenToUse,
        status: 'published',
      },
    ];

    if (jsonLesson.examples && jsonLesson.examples.length > 0) {
      if (!examples || examples.length <= 2) {
        examples = jsonLesson.examples.map((ex, idx) => ({
          _id: `ex-${slug}-${idx + 1}`,
          topicId: topic._id,
          englishText: ex.englishText,
          banglaText: ex.banglaText,
          category: ex.category || 'General',
          order: idx + 1,
        }));
      }
    }
  }

  return NextResponse.json({
    topic: JSON.parse(JSON.stringify(topic)),
    lessons,
    examples,
    testSets: JSON.parse(JSON.stringify(testSets)),
  });
}
