export type DictationWord = {
  id: string;
  text: string;
  syllables: string[];
};

export const STORAGE_KEY = "dislexia-dictation-words";
export const WORDS_UPDATED_EVENT = "dislexia-words-updated";
