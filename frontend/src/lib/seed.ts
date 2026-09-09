import { connectDB } from '@/lib/db';
import GrammarCategory from '@/models/GrammarCategory';
import GrammarTopic from '@/models/GrammarTopic';
import Lesson from '@/models/Lesson';
import Example from '@/models/Example';
import Question from '@/models/Question';
import TestSet from '@/models/TestSet';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function seedAdmins() {
  await connectDB();

  const defaultAdmins = [
    {
      username: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@grammarflow.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    },
    {
      username: 'Admin Two',
      email: 'admin2@grammarflow.com',
      password: 'Admin2@123456',
    },
    {
      username: 'Admin Three',
      email: 'admin3@grammarflow.com',
      password: 'Admin3@123456',
    },
  ];

  for (const adminData of defaultAdmins) {
    const passwordHash = await bcrypt.hash(adminData.password, 12);
    await User.findOneAndUpdate(
      { email: adminData.email },
      {
        username: adminData.username,
        email: adminData.email,
        passwordHash,
        authProvider: 'credentials',
        isGuest: false,
        role: 'admin',
      },
      { upsert: true, new: true }
    );
  }
}

export async function seedDatabase() {
  await connectDB();

  // Always seed default 3 admins
  await seedAdmins();

  // Check if content already seeded
  const existingCategory = await GrammarCategory.findOne({ slug: 'tenses' });
  if (existingCategory) return { message: 'Database content already seeded; 3 admin accounts ensured.' };

  // ─── CATEGORY ────────────────────────────────────────────────
  const tensesCategory = await GrammarCategory.create({
    title: 'Tenses',
    slug: 'tenses',
    description: 'Master all 12 English tenses',
    order: 1,
    icon: 'Clock',
  });

  // ─── TOPICS ──────────────────────────────────────────────────
  const topicsData = [
    { title: 'Present Simple', slug: 'present-simple', order: 1, isLocked: false, color: '#4F46E5' },
    { title: 'Present Continuous', slug: 'present-continuous', order: 2, isLocked: true, color: '#7C3AED' },
    { title: 'Present Perfect', slug: 'present-perfect', order: 3, isLocked: true, color: '#9333EA' },
    { title: 'Present Perfect Continuous', slug: 'present-perfect-continuous', order: 4, isLocked: true, color: '#A855F7' },
    { title: 'Past Simple', slug: 'past-simple', order: 5, isLocked: true, color: '#0EA5E9' },
    { title: 'Past Continuous', slug: 'past-continuous', order: 6, isLocked: true, color: '#0284C7' },
    { title: 'Past Perfect', slug: 'past-perfect', order: 7, isLocked: true, color: '#0369A1' },
    { title: 'Past Perfect Continuous', slug: 'past-perfect-continuous', order: 8, isLocked: true, color: '#075985' },
    { title: 'Future Simple', slug: 'future-simple', order: 9, isLocked: true, color: '#059669' },
    { title: 'Future Continuous', slug: 'future-continuous', order: 10, isLocked: true, color: '#047857' },
    { title: 'Future Perfect', slug: 'future-perfect', order: 11, isLocked: true, color: '#065F46' },
    { title: 'Future Perfect Continuous', slug: 'future-perfect-continuous', order: 12, isLocked: true, color: '#064E3B' },
  ];

  const topics = await GrammarTopic.insertMany(
    topicsData.map(t => ({ ...t, categoryId: tensesCategory._id, description: `Learn the ${t.title} tense` }))
  );

  const presentSimple = topics[0];

  // ─── LESSON ──────────────────────────────────────────────────
  await Lesson.create({
    topicId: presentSimple._id,
    title: 'Understanding Present Simple',
    description: 'Mastering the foundation of daily communication.',
    order: 1,
    content: 'The Present Simple tense is used to describe habitual actions, universal truths, and general facts.',
    rules: [
      {
        title: 'Affirmative Sentences',
        structure: 'Subject + V1 + Object',
        explanation: 'For I/You/We/They use the base verb. For He/She/It add -s or -es.',
        banglaExplanation: 'ইতিবাচক বাক্যে কর্তা + ক্রিয়া (মূল রূপ) + কর্ম ব্যবহার করুন।',
        examples: ['I play football.', 'She plays tennis. (He/She/It → add -s)', 'They study every day.'],
      },
      {
        title: 'Negative Sentences',
        structure: 'Subject + do/does + not + V1 + Object',
        explanation: 'Use "do not" (don\'t) for I/You/We/They. Use "does not" (doesn\'t) for He/She/It.',
        banglaExplanation: 'নেতিবাচক বাক্যে do not/does not ব্যবহার করুন।',
        examples: ["I don't like coffee.", "She doesn't play tennis.", "They don't work on Sundays."],
      },
      {
        title: 'Question Sentences',
        structure: 'Do/Does + Subject + V1 + Object?',
        explanation: 'Use "Do" for I/You/We/They. Use "Does" for He/She/It.',
        banglaExplanation: 'প্রশ্নবাক্যে Do/Does দিয়ে শুরু করুন।',
        examples: ['Do you play football?', 'Does she like music?', 'Do they study English?'],
      },
    ],
    keyPoints: [
      'Add -s or -es for He/She/It in affirmative sentences',
      'Use "do not" or "does not" for negatives',
      'Use "Do" or "Does" at the beginning of questions',
    ],
    whenToUse: [
      'Habits and routines: "I wake up at 7 AM."',
      'Universal truths: "The sun rises in the east."',
      'Permanent states: "She lives in Dhaka."',
      'With frequency adverbs: always, usually, often, sometimes, never',
    ],
    status: 'published',
  });

  // ─── EXAMPLES ────────────────────────────────────────────────
  const examplesData = [
    { englishText: 'I go to school every day.', banglaText: 'আমি প্রতিদিন স্কুলে যাই।', order: 1, category: 'Habits' },
    { englishText: 'She reads books in the evening.', banglaText: 'সে সন্ধ্যায় বই পড়ে।', order: 2, category: 'Habits' },
    { englishText: 'They play football on weekends.', banglaText: 'তারা সাপ্তাহিক ছুটিতে ফুটবল খেলে।', order: 3, category: 'Habits' },
    { englishText: 'He works at a hospital.', banglaText: 'সে হাসপাতালে কাজ করে।', order: 4, category: 'Permanent State' },
    { englishText: 'Water boils at 100 degrees Celsius.', banglaText: 'পানি ১০০ ডিগ্রি সেলসিয়াসে ফুটে।', order: 5, category: 'Universal Truth' },
    { englishText: 'The sun rises in the east.', banglaText: 'সূর্য পূর্ব দিকে ওঠে।', order: 6, category: 'Universal Truth' },
    { englishText: 'My mother cooks very well.', banglaText: 'আমার মা খুব ভালো রান্না করেন।', order: 7, category: 'Habits' },
    { englishText: "I don't eat meat.", banglaText: 'আমি মাংস খাই না।', order: 8, category: 'Negative' },
    { englishText: "She doesn't like cold weather.", banglaText: 'সে ঠান্ডা আবহাওয়া পছন্দ করে না।', order: 9, category: 'Negative' },
    { englishText: 'Do you speak English?', banglaText: 'তুমি কি ইংরেজি বলো?', order: 10, category: 'Question' },
    { englishText: 'Does he live near here?', banglaText: 'সে কি এখানের কাছাকাছি থাকে?', order: 11, category: 'Question' },
    { englishText: 'We usually have dinner at 8 PM.', banglaText: 'আমরা সাধারণত রাত ৮টায় রাতের খাবার খাই।', order: 12, category: 'Habits' },
    { englishText: 'The train leaves at 9 AM.', banglaText: 'ট্রেনটি সকাল ৯টায় ছেড়ে যায়।', order: 13, category: 'Schedule' },
    { englishText: 'Birds fly south in winter.', banglaText: 'পাখিরা শীতকালে দক্ষিণে উড়ে যায়।', order: 14, category: 'Universal Truth' },
    { englishText: 'He always tells the truth.', banglaText: 'সে সবসময় সত্য বলে।', order: 15, category: 'Habits' },
  ];

  await Example.insertMany(examplesData.map(e => ({ ...e, topicId: presentSimple._id })));

  // ─── QUESTIONS ───────────────────────────────────────────────
  const questionsData = [
    // MCQ – Easy
    {
      type: 'MCQ', difficulty: 'easy', order: 1,
      questionText: 'She ___ to school every day.',
      options: ['go', 'goes', 'going', 'gone'],
      correctAnswer: 'goes',
      explanation: 'Use "goes" for He/She/It in present simple.',
      banglaExplanation: 'He/She/It এর জন্য ক্রিয়ার শেষে -s/es যোগ করতে হয়।',
      tags: ['third-person', 'affirmative'],
    },
    {
      type: 'MCQ', difficulty: 'easy', order: 2,
      questionText: 'I ___ English every morning.',
      options: ['study', 'studies', 'studied', 'studying'],
      correctAnswer: 'study',
      explanation: 'Use base verb "study" for I in present simple.',
      banglaExplanation: 'I এর সাথে মূল ক্রিয়া ব্যবহার করুন।',
      tags: ['first-person', 'affirmative'],
    },
    {
      type: 'MCQ', difficulty: 'easy', order: 3,
      questionText: 'They ___ football on weekends.',
      options: ['plays', 'play', 'playing', 'played'],
      correctAnswer: 'play',
      explanation: 'Use base verb "play" for They in present simple.',
      banglaExplanation: 'They এর সাথে মূল ক্রিয়া ব্যবহার করুন।',
      tags: ['third-person-plural', 'affirmative'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 4,
      questionText: 'He ___ not like spicy food.',
      options: ['do', 'does', 'did', 'is'],
      correctAnswer: 'does',
      explanation: 'Use "does not" for He/She/It in negative present simple.',
      banglaExplanation: 'He/She/It এর নেতিবাচক বাক্যে "does not" ব্যবহার করুন।',
      tags: ['negative', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 5,
      questionText: '___ you speak French?',
      options: ['Do', 'Does', 'Did', 'Is'],
      correctAnswer: 'Do',
      explanation: 'Use "Do" for You in present simple questions.',
      banglaExplanation: 'You এর প্রশ্নবাক্যে "Do" ব্যবহার করুন।',
      tags: ['question', 'second-person'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 6,
      questionText: 'The sun ___ in the east.',
      options: ['rise', 'rising', 'rises', 'rose'],
      correctAnswer: 'rises',
      explanation: '"The sun" is third person singular, so add -s to "rise".',
      banglaExplanation: 'The sun তৃতীয় পুরুষ একবচন, তাই rises ব্যবহার করুন।',
      tags: ['universal-truth', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'hard', order: 7,
      questionText: 'Which sentence is correct?',
      options: [
        'She don\'t go to work on Sundays.',
        'She doesn\'t goes to work on Sundays.',
        'She doesn\'t go to work on Sundays.',
        'She not go to work on Sundays.',
      ],
      correctAnswer: "She doesn't go to work on Sundays.",
      explanation: 'For She/He/It: use "doesn\'t" + base verb (without -s).',
      banglaExplanation: 'She/He/It এর নেতিবাচকে "doesn\'t" + মূল ক্রিয়া ব্যবহার করুন।',
      tags: ['error-identification', 'negative'],
    },
    // FILL_BLANK
    {
      type: 'FILL_BLANK', difficulty: 'easy', order: 8,
      questionText: 'My father ___ (work) in a bank.',
      correctAnswer: 'works',
      acceptedAnswers: ['works'],
      explanation: '"My father" is He (third person singular), so add -s to "work".',
      banglaExplanation: 'My father তৃতীয় পুরুষ একবচন, তাই works ব্যবহার করুন।',
      tags: ['fill-blank', 'third-person'],
    },
    {
      type: 'FILL_BLANK', difficulty: 'easy', order: 9,
      questionText: 'We ___ (not/eat) meat.',
      correctAnswer: "don't eat",
      acceptedAnswers: ["don't eat", "do not eat"],
      explanation: 'For We: use "don\'t" + base verb.',
      banglaExplanation: 'We এর নেতিবাচকে "don\'t eat" ব্যবহার করুন।',
      tags: ['fill-blank', 'negative'],
    },
    {
      type: 'FILL_BLANK', difficulty: 'medium', order: 10,
      questionText: '___ (she/like) chocolate?',
      correctAnswer: 'Does she like',
      acceptedAnswers: ['Does she like'],
      explanation: 'For questions with She: Does + subject + base verb.',
      banglaExplanation: 'She এর প্রশ্নে: Does she like ব্যবহার করুন।',
      tags: ['fill-blank', 'question'],
    },
    // MCQ – More
    {
      type: 'MCQ', difficulty: 'easy', order: 11,
      questionText: 'Water ___ at 100°C.',
      options: ['boil', 'boils', 'boiling', 'boiled'],
      correctAnswer: 'boils',
      explanation: '"Water" is third person singular → boils.',
      banglaExplanation: 'Water তৃতীয় পুরুষ, তাই boils ব্যবহার করুন।',
      tags: ['universal-truth', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 12,
      questionText: 'Which word is NOT a frequency adverb?',
      options: ['always', 'never', 'yesterday', 'usually'],
      correctAnswer: 'yesterday',
      explanation: '"Yesterday" indicates a specific past time, not frequency.',
      banglaExplanation: '"Yesterday" নির্দিষ্ট অতীত সময় বোঝায়, কোনো পৌনঃপুনিকতা নয়।',
      tags: ['frequency-adverbs', 'vocabulary'],
    },
    {
      type: 'MCQ', difficulty: 'hard', order: 13,
      questionText: 'My sister ___ very hard for her exams.',
      options: ['study', 'studies', 'studying', 'have studied'],
      correctAnswer: 'studies',
      explanation: '"My sister" = She (third person) → add -es because study ends in -y (consonant + y → ies).',
      banglaExplanation: 'Study এর শেষে y থাকায় -ies যোগ হয়।',
      tags: ['spelling-rules', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 14,
      questionText: 'Complete: "He ___ TV in the evening."',
      options: ["don't watch", "doesn't watches", "doesn't watch", "not watch"],
      correctAnswer: "doesn't watch",
      explanation: 'Negative for He: doesn\'t + base verb (no -es on the verb).',
      banglaExplanation: 'He এর নেতিবাচকে: doesn\'t + মূল ক্রিয়া।',
      tags: ['negative', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'easy', order: 15,
      questionText: 'Which sentence uses Present Simple correctly?',
      options: [
        'I am going to school every day.',
        'I go to school every day.',
        'I went to school every day.',
        'I will go to school every day.',
      ],
      correctAnswer: 'I go to school every day.',
      explanation: 'Present Simple uses base verb for habits/routines.',
      banglaExplanation: 'অভ্যাস বা নিয়মিত কাজের জন্য Present Simple ব্যবহার করুন।',
      tags: ['identification', 'habits'],
    },
    // Extra questions for set 2
    {
      type: 'MCQ', difficulty: 'medium', order: 16,
      questionText: 'She ___ to the gym three times a week.',
      options: ['go', 'goes', 'went', 'going'],
      correctAnswer: 'goes',
      explanation: '"She" is third person → goes.',
      banglaExplanation: 'She তৃতীয় পুরুষ → goes।',
      tags: ['third-person', 'frequency'],
    },
    {
      type: 'MCQ', difficulty: 'easy', order: 17,
      questionText: '___  he know the answer?',
      options: ['Do', 'Does', 'Did', 'Has'],
      correctAnswer: 'Does',
      explanation: 'Questions with He/She/It use "Does".',
      banglaExplanation: 'He/She/It এর প্রশ্নে "Does" ব্যবহার করুন।',
      tags: ['question', 'third-person'],
    },
    {
      type: 'FILL_BLANK', difficulty: 'medium', order: 18,
      questionText: 'Birds ___ (fly) south every winter.',
      correctAnswer: 'fly',
      acceptedAnswers: ['fly'],
      explanation: '"Birds" is plural → use base verb "fly".',
      banglaExplanation: 'Birds বহুবচন, তাই মূল ক্রিয়া fly ব্যবহার করুন।',
      tags: ['fill-blank', 'plural'],
    },
    {
      type: 'MCQ', difficulty: 'hard', order: 19,
      questionText: 'Which sentence is grammatically INCORRECT?',
      options: [
        'He watches TV every night.',
        'They don\'t study on weekends.',
        'She do her homework daily.',
        'Does he play cricket?',
      ],
      correctAnswer: 'She do her homework daily.',
      explanation: 'For She: use "does" not "do". Correct: "She does her homework daily."',
      banglaExplanation: 'She এর সাথে "does" ব্যবহার করুন, "do" নয়।',
      tags: ['error-identification', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 20,
      questionText: 'The earth ___ around the sun.',
      options: ['move', 'moves', 'is moving', 'moved'],
      correctAnswer: 'moves',
      explanation: '"The earth" = third person → moves. Universal truth uses Present Simple.',
      banglaExplanation: 'Universal truth এ Present Simple ব্যবহার করুন।',
      tags: ['universal-truth', 'third-person'],
    },
    // Set 3 questions
    {
      type: 'MCQ', difficulty: 'medium', order: 21,
      questionText: 'I ___ coffee every morning.',
      options: ['drinks', 'drink', 'drank', 'drinking'],
      correctAnswer: 'drink',
      explanation: 'For "I" use base verb.',
      banglaExplanation: '"I" এর সাথে মূল ক্রিয়া ব্যবহার করুন।',
      tags: ['first-person', 'habits'],
    },
    {
      type: 'MCQ', difficulty: 'easy', order: 22,
      questionText: 'My parents ___ in Dhaka.',
      options: ['lives', 'live', 'living', 'lived'],
      correctAnswer: 'live',
      explanation: '"My parents" = They (plural) → live.',
      banglaExplanation: '"My parents" = They, তাই live ব্যবহার করুন।',
      tags: ['plural', 'permanent-state'],
    },
    {
      type: 'MCQ', difficulty: 'hard', order: 23,
      questionText: 'Choose the correct negative: "He ___ speak Arabic."',
      options: ["don't", "doesn't", "isn't", "aren't"],
      correctAnswer: "doesn't",
      explanation: '"He" takes "doesn\'t" in negative present simple.',
      banglaExplanation: '"He" এর নেতিবাচকে "doesn\'t" ব্যবহার করুন।',
      tags: ['negative', 'third-person'],
    },
    {
      type: 'FILL_BLANK', difficulty: 'easy', order: 24,
      questionText: 'She always ___ (arrive) on time.',
      correctAnswer: 'arrives',
      acceptedAnswers: ['arrives'],
      explanation: '"She" is third person → arrives.',
      banglaExplanation: '"She" তৃতীয় পুরুষ → arrives।',
      tags: ['fill-blank', 'frequency'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 25,
      questionText: '___ your brother like football?',
      options: ['Do', 'Does', 'Is', 'Has'],
      correctAnswer: 'Does',
      explanation: '"Your brother" = He → use "Does" for questions.',
      banglaExplanation: '"Your brother" = He, তাই প্রশ্নে "Does" ব্যবহার করুন।',
      tags: ['question', 'third-person'],
    },
    {
      type: 'MCQ', difficulty: 'easy', order: 26,
      questionText: 'Cats ___ fish.',
      options: ['likes', 'like', 'liked', 'liking'],
      correctAnswer: 'like',
      explanation: '"Cats" is plural → like.',
      banglaExplanation: '"Cats" বহুবচন → like।',
      tags: ['plural', 'affirmative'],
    },
    {
      type: 'MCQ', difficulty: 'hard', order: 27,
      questionText: 'Which is the correct way to make a negative sentence for: "She plays piano."',
      options: [
        "She don't play piano.",
        "She doesn't plays piano.",
        "She doesn't play piano.",
        "She not plays piano.",
      ],
      correctAnswer: "She doesn't play piano.",
      explanation: 'Negative: doesn\'t + base verb (play, not plays).',
      banglaExplanation: 'নেতিবাচকে: doesn\'t + মূল ক্রিয়া (play, plays নয়)।',
      tags: ['negative', 'error-correction'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 28,
      questionText: 'He usually ___ to bed at 10 PM.',
      options: ['go', 'goes', 'went', 'going'],
      correctAnswer: 'goes',
      explanation: '"He" + usually → goes (third person singular).',
      banglaExplanation: '"He" + usually → goes (তৃতীয় পুরুষ একবচন)।',
      tags: ['habits', 'frequency'],
    },
    {
      type: 'FILL_BLANK', difficulty: 'hard', order: 29,
      questionText: '___ (the students / study) hard for their exams?',
      correctAnswer: 'Do the students study',
      acceptedAnswers: ['Do the students study'],
      explanation: '"The students" = They (plural) → Do + they + base verb.',
      banglaExplanation: '"The students" = They → Do the students study।',
      tags: ['question', 'plural'],
    },
    {
      type: 'MCQ', difficulty: 'medium', order: 30,
      questionText: 'Present Simple is used for:',
      options: [
        'Actions happening right now',
        'Actions completed in the past',
        'Habits, routines, and universal truths',
        'Future planned events only',
      ],
      correctAnswer: 'Habits, routines, and universal truths',
      explanation: 'Present Simple is used for habits, routines, universal truths, and general facts.',
      banglaExplanation: 'Present Simple অভ্যাস, নিয়মিত কাজ এবং সার্বজনীন সত্যের জন্য ব্যবহৃত হয়।',
      tags: ['concept', 'usage'],
    },
  ];

  const questions = await Question.insertMany(
    questionsData.map(q => ({ ...q, topicId: presentSimple._id }))
  );

  // ─── TEST SETS ────────────────────────────────────────────────
  await TestSet.insertMany([
    {
      topicId: presentSimple._id,
      title: 'Practice Set 01',
      description: 'Foundation practice for Present Simple',
      questionIds: questions.slice(0, 10).map(q => q._id),
      questionCount: 10,
      order: 1,
      setType: 'practice',
    },
  ]);

  return { message: 'Database seeded successfully' };
}
