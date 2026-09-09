import mongoose, { Schema, Document } from 'mongoose';

export type MasteryLevel = 'beginner' | 'learning' | 'improving' | 'mastered';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  completion: number;
  mastery: number;
  masteryLevel: MasteryLevel;
  attempts: number;
  testsCompleted: number;
  averageScore: number;
  bestScore: number;
  correctPercentage: number;
  mistakeCount: number;
  lessonsCompleted: string[];
  lastActivityAt: Date;
  currentLessonId?: mongoose.Types.ObjectId;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    completion: { type: Number, default: 0 },
    mastery: { type: Number, default: 0 },
    masteryLevel: { type: String, enum: ['beginner', 'learning', 'improving', 'mastered'], default: 'beginner' },
    attempts: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    correctPercentage: { type: Number, default: 0 },
    mistakeCount: { type: Number, default: 0 },
    lessonsCompleted: [String],
    lastActivityAt: { type: Date, default: Date.now },
    currentLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
