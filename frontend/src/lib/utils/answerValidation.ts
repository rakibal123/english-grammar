const CONTRACTION_MAP: Record<string, string> = {
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "haven't": "have not",
  "hasn't": "has not",
  "hadn't": "had not",
  "won't": "will not",
  "wouldn't": "would not",
  "can't": "cannot",
  "couldn't": "could not",
  "shouldn't": "should not",
  "i'm": "i am",
  "you're": "you are",
  "they're": "they are",
  "we're": "we are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is"
};

/**
 * Normalizes a string by lowercasing, trimming extra spaces, 
 * and expanding common contractions to ensure fair comparison.
 */
export function normalizeAnswer(input: string): string {
  let normalized = input.toLowerCase().trim().replace(/\s+/g, ' ');

  // Replace contractions with their expanded equivalents
  for (const [contraction, expansion] of Object.entries(CONTRACTION_MAP)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'g');
    normalized = normalized.replace(regex, expansion);
  }

  return normalized;
}

/**
 * Validates user input against a single correct answer or an array of accepted answers.
 */
export function validateAnswer(userInput: string, correctAnswers: string | string[]): boolean {
  const normalizedUser = normalizeAnswer(userInput);
  const answersArray = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];

  return answersArray.some(ans => normalizeAnswer(ans) === normalizedUser);
}
