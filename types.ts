export interface WordData {
  word: string;
  wordClass: string; // e.g., "Substantiv", "Verb"
  definition: string;
  etymology: string;
  usageExample: string;
  inflections: string[]; // List of inflected forms
  funFact?: string;
}

export interface GeneratedImage {
  url: string;
  promptUsed: string;
}