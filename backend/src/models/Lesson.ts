import mongoose, { Schema, Document } from 'mongoose';

export interface IGrammarRule {
  title: string;
  structure: string;
  explanation: string;
  banglaExplanation?: string;
  examples: string[];
}

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  content: string;
  rules: IGrammarRule[];
  keyPoints: string[];
  whenToUse: string[];
  status: 'draft' | 'published';
}

const GrammarRuleSchema = new Schema<IGrammarRule>({
  title: String,
  structure: String,
  explanation: String,
  banglaExplanation: String,
  examples: [String],
});

const LessonSchema = new Schema<ILesson>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    title: { type: String, required: true },
    description: String,
    order: { type: Number, default: 0 },
    content: String,
    rules: [GrammarRuleSchema],
    keyPoints: [String],
    whenToUse: [String],
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
