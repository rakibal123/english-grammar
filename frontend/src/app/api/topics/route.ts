import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GrammarTopic from '@/models/GrammarTopic';

const fallbackTopics = [
  { _id: '6a9958e3d368ce6613bdff34', title: 'Present Simple', slug: 'present-simple', description: 'Learn the Present Simple tense', order: 1, isLocked: false, color: '#4F46E5', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff35', title: 'Present Continuous', slug: 'present-continuous', description: 'Learn the Present Continuous tense', order: 2, isLocked: true, color: '#7C3AED', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff36', title: 'Present Perfect', slug: 'present-perfect', description: 'Learn the Present Perfect tense', order: 3, isLocked: true, color: '#9333EA', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff37', title: 'Present Perfect Continuous', slug: 'present-perfect-continuous', description: 'Learn the Present Perfect Continuous tense', order: 4, isLocked: true, color: '#A855F7', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff38', title: 'Past Simple', slug: 'past-simple', description: 'Learn the Past Simple tense', order: 5, isLocked: true, color: '#0EA5E9', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff39', title: 'Past Continuous', slug: 'past-continuous', description: 'Learn the Past Continuous tense', order: 6, isLocked: true, color: '#0284C7', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff3a', title: 'Past Perfect', slug: 'past-perfect', description: 'Learn the Past Perfect tense', order: 7, isLocked: true, color: '#0369A1', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff3b', title: 'Past Perfect Continuous', slug: 'past-perfect-continuous', description: 'Learn the Past Perfect Continuous tense', order: 8, isLocked: true, color: '#075985', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff3c', title: 'Future Simple', slug: 'future-simple', description: 'Learn the Future Simple tense', order: 9, isLocked: true, color: '#059669', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff3d', title: 'Future Continuous', slug: 'future-continuous', description: 'Learn the Future Continuous tense', order: 10, isLocked: true, color: '#047857', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff3e', title: 'Future Perfect', slug: 'future-perfect', description: 'Learn the Future Perfect tense', order: 11, isLocked: true, color: '#065F46', icon: 'BookOpen' },
  { _id: '6a9958e3d368ce6613bdff3f', title: 'Future Perfect Continuous', slug: 'future-perfect-continuous', description: 'Learn the Future Perfect Continuous tense', order: 12, isLocked: true, color: '#064E3B', icon: 'BookOpen' },
];

export async function GET() {
  try {
    await connectDB();
    let topics = await GrammarTopic.find().sort('order').populate('categoryId', 'title');
    if (!topics || topics.length === 0) {
      try {
        const { seedDatabase } = await import('@/lib/seed');
        await seedDatabase();
        topics = await GrammarTopic.find().sort('order').populate('categoryId', 'title');
      } catch (e) {
        console.error('Auto-seed error:', e);
      }
    }
    if (topics && topics.length > 0) {
      return NextResponse.json(JSON.parse(JSON.stringify(topics)));
    }
  } catch (err) {
    console.warn('[api/topics] Database unreachable, serving resilient fallback:', err);
  }

  return NextResponse.json(fallbackTopics);
}
