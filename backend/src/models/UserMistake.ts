import mongoose, { Schema, Document } from 'mongoose';

export interface IUserMistake extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  userAnswer: string;
  correctAnswer: string;
  attemptCount: number;
  lastSeenAt: Date;
  resolved: boolean;
}

const UserMistakeSchema = new Schema<IUserMistake>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    userAnswer: String,
    correctAnswer: String,
    attemptCount: { type: Number, default: 1 },
    lastSeenAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserMistakeSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export default mongoose.models.UserMistake ||
  mongoose.model<IUserMistake>('UserMistake', UserMistakeSchema);
