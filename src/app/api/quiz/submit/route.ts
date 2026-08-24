import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TestAttempt from '@/models/TestAttempt';
import UserProgress from '@/models/UserProgress';
import UserMistake from '@/models/UserMistake';
import User from '@/models/User';
import Question from '@/models/Question';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, testSetId, topicId, answers, timeTaken } = data;

    if (!userId || !testSetId || !topicId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Server-side validation
    const validatedAnswers = await Promise.all(
      answers.map(async (a: { questionId: string; userAnswer: string }) => {
        const question = await Question.findById(a.questionId);
        if (!question) return null;

        const accepted = [question.correctAnswer, ...(question.acceptedAnswers || [])];
        const isCorrect = accepted.some(
          (ans: string) => ans.trim().toLowerCase() === a.userAnswer.trim().toLowerCase()
        );

        return {
          questionId: a.questionId,
          userAnswer: a.userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent: 0,
        };
      })
    );

    const valid = validatedAnswers.filter(Boolean);
    const correctCount = valid.filter(a => a!.isCorrect).length;
    const totalQuestions = valid.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = correctCount * 10 + (percentage === 100 ? 50 : 0);

    const attempt = await TestAttempt.create({
      userId, testSetId, topicId,
      answers: valid,
      score: correctCount, totalQuestions, correctCount,
      incorrectCount: totalQuestions - correctCount,
      percentage, timeTaken: timeTaken || 0,
      completedAt: new Date(), xpEarned,
    });

    // Save mistakes
    for (const a of valid) {
      if (!a!.isCorrect) {
        await UserMistake.findOneAndUpdate(
          { userId, questionId: a!.questionId },
          {
            topicId, userAnswer: a!.userAnswer, correctAnswer: a!.correctAnswer,
            lastSeenAt: new Date(), $inc: { attemptCount: 1 }, resolved: false,
          },
          { upsert: true }
        );
      }
    }

    // Update progress
    const existing = await UserProgress.findOne({ userId, topicId });
    const newAttempts = (existing?.attempts || 0) + 1;
    const newAvg = Math.round(
      ((existing?.averageScore || 0) * (existing?.attempts || 0) + percentage) / newAttempts
    );
    const newBest = Math.max(existing?.bestScore || 0, percentage);
    const mastery = Math.min(100, Math.round(newAvg * 0.7 + newBest * 0.3));
    const masteryLevel = mastery >= 80 ? 'mastered' : mastery >= 60 ? 'improving' : mastery >= 40 ? 'learning' : 'beginner';
    const completion = Math.min(100, Math.round((newAttempts / 3) * 100));

    await UserProgress.findOneAndUpdate(
      { userId, topicId },
      { attempts: newAttempts, testsCompleted: newAttempts, averageScore: newAvg, bestScore: newBest, mastery, masteryLevel, completion, lastActivityAt: new Date(), $inc: { mistakeCount: totalQuestions - correctCount } },
      { upsert: true }
    );

    await User.findByIdAndUpdate(userId, { $inc: { xp: xpEarned } });

    return NextResponse.json({ attemptId: attempt._id.toString(), percentage, correctCount, incorrectCount: totalQuestions - correctCount, xpEarned });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
