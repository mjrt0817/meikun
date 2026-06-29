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

export interface ReviewSchedule {
  questionId: string;
  nextReviewDate: string; // YYYY-MM-DD
  intervalDays: number; // current interval in days (e.g., 1, 3, 7, 14, 30)
  streak: number; // consecutive correct answers
  lastReviewedDate?: string;
}

export interface UserProgress {
  answeredQuestions: Record<string, boolean>; // id -> isCorrect
  reviewList: string[]; // array of question ids to review
  mockExamScores: { date: string; score: number; total: number; subject: Subject }[];
  coins?: number;
  unlockedCards?: string[];
  gachaRates?: Record<string, number>;
  customQuestions?: Question[];
  reviewSchedules?: Record<string, ReviewSchedule>;
  showReportToChild?: boolean; // 子ども本人のホーム画面にレポートを表示するかどうか
}

export type ViewState = 'home' | 'practice' | 'review' | 'mock-exam' | 'mock-exam-result' | 'gacha' | 'album' | 'parent-report';
