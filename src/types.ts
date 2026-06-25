export type Subject = 'math' | 'japanese';

export interface Question {
  id: string;
  subject: Subject;
  category: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
}

export interface UserProgress {
  answeredQuestions: Record<string, boolean>; // id -> isCorrect
  reviewList: string[]; // array of question ids to review
  mockExamScores: { date: string; score: number; total: number; subject: Subject }[];
  coins?: number;
  unlockedCards?: string[];
  gachaRates?: Record<string, number>;
}

export type ViewState = 'home' | 'practice' | 'review' | 'mock-exam' | 'mock-exam-result' | 'gacha' | 'album';
