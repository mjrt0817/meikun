import { UserProgress } from '../types';

const STORAGE_KEY = 'meikun_prep_progress';

export const loadProgress = (): UserProgress => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return {
        answeredQuestions: parsed.answeredQuestions || {},
        reviewList: parsed.reviewList || [],
        mockExamScores: parsed.mockExamScores || [],
        coins: parsed.coins || 0,
        unlockedCards: parsed.unlockedCards || [],
        gachaRates: parsed.gachaRates
      };
    } catch (e) {
      console.error("Failed to parse progress from localStorage");
    }
  }
  return { answeredQuestions: {}, reviewList: [], mockExamScores: [], coins: 0, unlockedCards: [] };
};

export const saveProgress = (progress: UserProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};
