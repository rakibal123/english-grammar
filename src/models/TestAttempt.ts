import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAnswer {
  questionId: mongoose.Types.ObjectId;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ITestAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  testSetId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  answers: IUserAnswer[];
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  timeTaken: number;
  completedAt: Date;
  xpEarned: number;
}

const UserAnswerSchema = new Schema<IUserAnswer>({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
  timeSpent: { type: Number, default: 0 },
});

const TestAttemptSchema = new Schema<ITestAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testSetId: { type: Schema.Types.ObjectId, ref: 'TestSet', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    answers: [UserAnswerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    completedAt: Date,
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.TestAttempt ||
  mongoose.model<ITestAttempt>('TestAttempt', TestAttemptSchema);
