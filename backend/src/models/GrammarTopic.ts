import mongoose, { Schema, Document } from 'mongoose';

export interface IGrammarTopic extends Document {
  _id: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  order: number;
  isLocked: boolean;
  unlockAfterTopicId?: mongoose.Types.ObjectId;
  color: string;
  icon: string;
}

const GrammarTopicSchema = new Schema<IGrammarTopic>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'GrammarCategory', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    order: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    unlockAfterTopicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic' },
    color: { type: String, default: '#4F46E5' },
    icon: { type: String, default: 'BookOpen' },
  },
  { timestamps: true }
);

export default mongoose.models.GrammarTopic ||
  mongoose.model<IGrammarTopic>('GrammarTopic', GrammarTopicSchema);
