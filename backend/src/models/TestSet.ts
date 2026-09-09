import mongoose, { Schema, Document } from 'mongoose';

export interface ITestSet extends Document {
  _id: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  questionIds: mongoose.Types.ObjectId[];
  questionCount: number;
  order: number;
  setType: 'practice' | 'mastery' | 'review';
}

const TestSetSchema = new Schema<ITestSet>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    title: { type: String, required: true },
    description: String,
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    questionCount: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
    setType: { type: String, enum: ['practice', 'mastery', 'review'], default: 'practice' },
  },
  { timestamps: true }
);

export default mongoose.models.TestSet || mongoose.model<ITestSet>('TestSet', TestSetSchema);
