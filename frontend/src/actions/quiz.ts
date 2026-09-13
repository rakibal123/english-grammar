'use server';

import { connectDB } from '@/lib/db';
import TestAttempt from '@/models/TestAttempt';
import UserProgress from '@/models/UserProgress';
import UserMistake from '@/models/UserMistake';
import User from '@/models/User';
import Question from '@/models/Question';
import { validateAnswer as normalizeAndValidate } from '@/lib/utils/answerValidation';

interface SubmitAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export async function submitTestAttempt(data: {
  userId: string;
  testSetId: string;
  topicId: string;
  answers: SubmitAnswer[];
  timeTaken: number;
}) {
  await connectDB();

  const correctCount = data.answers.filter(a => a.isCorrect).length;
  const totalQuestions = data.answers.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const xpEarned = correctCount * 10 + (percentage === 100 ? 50 : 0);

  const attempt = await TestAttempt.create({
    userId: data.userId,
    testSetId: data.testSetId,
    topicId: data.topicId,
    answers: data.answers,
    score: correctCount,
    totalQuestions,
    correctCount,
    incorrectCount: totalQuestions - correctCount,
    percentage,
    timeTaken: data.timeTaken,
    completedAt: new Date(),
    xpEarned,
  });

  // Save mistakes
  const wrongAnswers = data.answers.filter(a => !a.isCorrect);
  for (const wrong of wrongAnswers) {
    await UserMistake.findOneAndUpdate(
      { userId: data.userId, questionId: wrong.questionId },
      {
        topicId: data.topicId,
        userAnswer: wrong.userAnswer,
        correctAnswer: wrong.correctAnswer,
        lastSeenAt: new Date(),
        $inc: { attemptCount: 1 },
        resolved: false,
      },
      { upsert: true }
    );
  }

  // Update progress
  await updateUserProgress(data.userId, data.topicId, percentage, correctCount, totalQuestions);

  // Update XP
  await User.findByIdAndUpdate(data.userId, { $inc: { xp: xpEarned } });

  return {
    attemptId: attempt._id.toString(),
    percentage,
    correctCount,
    incorrectCount: totalQuestions - correctCount,
    xpEarned,
  };
}

async function updateUserProgress(
  userId: string,
  topicId: string,
  percentage: number,
  correctCount: number,
  totalQuestions: number
) {
  const existing = await UserProgress.findOne({ userId, topicId });

  const newAttempts = (existing?.attempts || 0) + 1;
  const newTotalCorrect = (existing?.correctPercentage || 0) * (existing?.attempts || 0) * totalQuestions / 100 + correctCount;
  const newAverageScore = Math.round(
    ((existing?.averageScore || 0) * (existing?.testsCompleted || 0) + percentage) / newAttempts
  );
  const newBestScore = Math.max(existing?.bestScore || 0, percentage);

  // Calculate mastery: weighted average of recent scores
  const mastery = Math.min(100, Math.round((newAverageScore * 0.7 + newBestScore * 0.3)));
  const masteryLevel =
    mastery >= 80 ? 'mastered' :
    mastery >= 60 ? 'improving' :
    mastery >= 40 ? 'learning' :
    'beginner';

  // completion based on tests taken (max 100% after 1 test)
  const completion = Math.min(100, Math.round((newAttempts / 1) * 100));

  await UserProgress.findOneAndUpdate(
    { userId, topicId },
    {
      attempts: newAttempts,
      testsCompleted: newAttempts,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      mastery,
      masteryLevel,
      completion,
      lastActivityAt: new Date(),
      $inc: { mistakeCount: totalQuestions - correctCount },
    },
    { upsert: true, new: true }
  );
}

export async function getAttemptById(attemptId: string) {
  await connectDB();
  const attempt = await TestAttempt.findById(attemptId)
    .populate({ path: 'answers.questionId', model: Question })
    .populate('topicId');
  return attempt ? JSON.parse(JSON.stringify(attempt)) : null;
}

export async function getUserProgress(userId: string) {
  await connectDB();
  const progress = await UserProgress.find({ userId }).populate('topicId');
  return JSON.parse(JSON.stringify(progress));
}

export async function getUserMistakes(userId: string, topicId?: string) {
  await connectDB();
  const query: Record<string, string> = { userId };
  if (topicId) query.topicId = topicId;
  const mistakes = await UserMistake.find({ ...query, resolved: false })
    .populate('questionId')
    .populate('topicId')
    .sort({ lastSeenAt: -1 })
    .limit(50);
  return JSON.parse(JSON.stringify(mistakes));
}

export async function getRecentAttempts(userId: string) {
  await connectDB();
  const attempts = await TestAttempt.find({ userId })
    .populate('topicId', 'title slug')
    .populate('testSetId', 'title')
    .sort({ createdAt: -1 })
    .limit(10);
  return JSON.parse(JSON.stringify(attempts));
}

export async function markMistakeResolved(mistakeId: string) {
  await connectDB();
  await UserMistake.findByIdAndUpdate(mistakeId, { resolved: true });
}

export async function validateAnswer(questionId: string, userAnswer: string) {
  await connectDB();
  const question = await Question.findById(questionId);
  if (!question) return { isCorrect: false, correctAnswer: '', explanation: '' };

  const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])];
  const isCorrect = normalizeAndValidate(userAnswer, accepted);

  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    banglaExplanation: question.banglaExplanation,
  };
}
