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
  let topic: any = null;
  let dbLessons: any[] = [];
  let dbExamples: any[] = [];
  let testSets: any[] = [];

  try {
    await connectDB();
    topic = await GrammarTopic.findOne({ slug }).populate('categoryId', 'title');
    if (!topic) {
      try {
        const { seedDatabase } = await import('@/lib/seed');
        await seedDatabase();
        topic = await GrammarTopic.findOne({ slug }).populate('categoryId', 'title');
      } catch (e) {
        console.error('Auto-seed error:', e);
      }
    }

    if (topic) {
      const [l, ex, ts] = await Promise.all([
        Lesson.find({ topicId: topic._id, status: 'published' }).sort('order'),
        Example.find({ topicId: topic._id }).sort('order'),
        TestSet.find({ topicId: topic._id }).sort('order'),
      ]);
      dbLessons = l;
      dbExamples = ex;
      testSets = ts;
    }
  } catch (dbErr) {
    console.warn(`[api/topics/${slug}] Database unreachable, serving resilient fallback:`, dbErr);
  }

  const jsonLesson = lessonsData[slug];
  const finalTopic = topic || (jsonLesson ? {
    _id: `topic-${slug}`,
    title: jsonLesson.title.replace('Understanding ', ''),
    slug,
    description: jsonLesson.description,
    order: 1,
    color: '#4F46E5',
  } : null);

  if (!finalTopic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let lessons = JSON.parse(JSON.stringify(dbLessons));
  let examples = JSON.parse(JSON.stringify(dbExamples));
  let finalTestSets = JSON.parse(JSON.stringify(testSets));

  if (!finalTestSets || finalTestSets.length === 0) {
    finalTestSets = [
      {
        _id: slug,
        topicId: finalTopic._id,
        title: `${finalTopic.title} Practice Test`,
        description: 'Test your understanding with authentic, context-based questions.',
        difficulty: 'medium',
        questionCount: 10,
        timeLimitMinutes: 15,
        passingScore: 70,
        order: 1,
      },
    ];
  }

  // Fetch from lessons.json for comprehensive lesson details
  if (jsonLesson) {
    lessons = [
      {
        _id: dbLessons[0]?._id?.toString() || `lesson-${slug}`,
        topicId: finalTopic._id,
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
          topicId: finalTopic._id,
          englishText: ex.englishText,
          banglaText: ex.banglaText,
          category: ex.category || 'General',
          order: idx + 1,
        }));
      }
    }
  }

  return NextResponse.json({
    topic: JSON.parse(JSON.stringify(finalTopic)),
    lessons,
    examples,
    testSets: finalTestSets,
  });
}
