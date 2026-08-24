import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import GrammarTopic from '@/models/GrammarTopic';

export async function GET() {
  await connectDB();
  const topics = await GrammarTopic.find().sort('order').populate('categoryId', 'title');
  return NextResponse.json(JSON.parse(JSON.stringify(topics)));
}
