import mongoose, { Schema, Document } from 'mongoose';

export type QuestionType =
  | 'MCQ'
  | 'FILL_BLANK'
  | 'ERROR_CORRECTION'
  | 'SENTENCE_SELECTION'
  | 'BANGLA_TO_ENGLISH'
  | 'ENGLISH_TO_BANGLA';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  type: QuestionType;
  questionText: string;
  banglaText?: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string;
  banglaExplanation?: string;
  difficulty: Difficulty;
  tags: string[];
  order: number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'GrammarTopic', required: true },
    type: {
      type: String,
      enum: ['MCQ', 'FILL_BLANK', 'ERROR_CORRECTION', 'SENTENCE_SELECTION', 'BANGLA_TO_ENGLISH', 'ENGLISH_TO_BANGLA'],
      required: true,
    },
    questionText: { type: String, required: true },
    banglaText: String,
    options: [String],
    correctAnswer: { type: String, required: true },
    acceptedAnswers: [String],
    explanation: { type: String, required: true },
    banglaExplanation: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [String],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
