import mongoose, { Schema, Document } from 'mongoose';

export interface IExample extends Document {
  topicId: mongoose.Types.ObjectId;
  englishText: string;
  banglaText: string;
  audioUrl?: string;
  order: number;
  category?: string;
}

const ExampleSchema = new Schema<IExample>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    englishText: { type: String, required: true },
    banglaText: { type: String, required: true },
    audioUrl: String,
    order: { type: Number, default: 0 },
    category: String,
  },
  { timestamps: true }
);

export default mongoose.models.Example || mongoose.model<IExample>('Example', ExampleSchema);
