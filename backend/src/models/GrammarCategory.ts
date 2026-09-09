import mongoose, { Schema, Document } from 'mongoose';

export interface IGrammarCategory extends Document {
  title: string;
  slug: string;
  description: string;
  order: number;
  icon: string;
}

const GrammarCategorySchema = new Schema<IGrammarCategory>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    order: { type: Number, default: 0 },
    icon: { type: String, default: 'BookOpen' },
  },
  { timestamps: true }
);

export default mongoose.models.GrammarCategory ||
  mongoose.model<IGrammarCategory>('GrammarCategory', GrammarCategorySchema);
