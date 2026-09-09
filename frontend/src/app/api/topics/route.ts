import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GrammarTopic from '@/models/GrammarTopic';

export async function GET() {
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
  return NextResponse.json(JSON.parse(JSON.stringify(topics)));
}
