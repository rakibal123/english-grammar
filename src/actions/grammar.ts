'use server';

import { connectDB } from '@/lib/db';
import GrammarCategory from '@/models/GrammarCategory';
import GrammarTopic from '@/models/GrammarTopic';
import Lesson from '@/models/Lesson';
import Example from '@/models/Example';
import TestSet from '@/models/TestSet';

export async function getCategories() {
  await connectDB();
  const categories = await GrammarCategory.find().sort('order');
  return JSON.parse(JSON.stringify(categories));
}

export async function getTopics() {
  await connectDB();
  const topics = await GrammarTopic.find().sort('order').populate('categoryId');
  return JSON.parse(JSON.stringify(topics));
}

export async function getTopicBySlug(slug: string) {
  await connectDB();
  const topic = await GrammarTopic.findOne({ slug }).populate('categoryId');
  return topic ? JSON.parse(JSON.stringify(topic)) : null;
}

export async function getLessonsByTopic(topicId: string) {
  await connectDB();
  const lessons = await Lesson.find({ topicId, status: 'published' }).sort('order');
  return JSON.parse(JSON.stringify(lessons));
}

export async function getExamplesByTopic(topicId: string) {
  await connectDB();
  const examples = await Example.find({ topicId }).sort('order');
  return JSON.parse(JSON.stringify(examples));
}

export async function getTestSetsByTopic(topicId: string) {
  await connectDB();
  const testSets = await TestSet.find({ topicId }).sort('order');
  return JSON.parse(JSON.stringify(testSets));
}

export async function getTestSetById(testSetId: string) {
  await connectDB();
  const testSet = await TestSet.findById(testSetId).populate('questionIds');
  return testSet ? JSON.parse(JSON.stringify(testSet)) : null;
}
