import { Question, UserProgress, ReviewSchedule } from '../types';

/**
 * Updates the Ebbinghaus spaced repetition schedule for a question based on user response.
 * Intervals follow: 1 day -> 3 days -> 7 days -> 14 days -> 30 days -> 90 days.
 */
export function updateReviewSchedule(
  questionId: string,
  isCorrect: boolean,
  currentSchedules: Record<string, ReviewSchedule> = {}
): Record<string, ReviewSchedule> {
  const schedules = { ...currentSchedules };
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  const current = schedules[questionId];
  
  if (isCorrect) {
    let nextInterval = 1;
    let streak = 1;
    
    if (current) {
      streak = current.streak + 1;
      // Interval transitions: 1 -> 3 -> 7 -> 14 -> 30 -> 90
      if (current.intervalDays === 1) nextInterval = 3;
      else if (current.intervalDays === 3) nextInterval = 7;
      else if (current.intervalDays === 7) nextInterval = 14;
      else if (current.intervalDays === 14) nextInterval = 30;
      else if (current.intervalDays >= 30) nextInterval = 90;
      else nextInterval = current.intervalDays * 2;
    }
    
    const nextDate = new Date();
    nextDate.setDate(now.getDate() + nextInterval);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    
    schedules[questionId] = {
      questionId,
      nextReviewDate: nextDateStr,
      intervalDays: nextInterval,
      streak,
      lastReviewedDate: todayStr
    };
  } else {
    // Reset interval to 1 day on error to reinforce retention
    const nextDate = new Date();
    nextDate.setDate(now.getDate() + 1); // due tomorrow
    const nextDateStr = nextDate.toISOString().split('T')[0];
    
    schedules[questionId] = {
      questionId,
      nextReviewDate: nextDateStr,
      intervalDays: 1,
      streak: 0,
      lastReviewedDate: todayStr
    };
  }
  
  return schedules;
}

/**
 * Returns the list of active review questions based on current date.
 * If a question is in the legacy reviewList and has no schedule, it is included.
 */
export function getActiveReviewQuestions(
  questionsList: Question[],
  progress: UserProgress
): Question[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const schedules = progress.reviewSchedules || {};
  const legacyList = progress.reviewList || [];
  
  return questionsList.filter(q => {
    const schedule = schedules[q.id];
    if (schedule) {
      return schedule.nextReviewDate <= todayStr;
    }
    // Fallback to legacy wrong answer list
    return legacyList.includes(q.id);
  });
}

/**
 * Calculates Ebbinghaus memory retention statistics for UI visualization.
 */
export function getRetentionStats(
  questionsList: Question[],
  progress: UserProgress
) {
  const todayStr = new Date().toISOString().split('T')[0];
  const schedules = progress.reviewSchedules || {};
  const legacyList = progress.reviewList || [];
  
  let dueCount = 0;
  let stage1Count = 0; // 1 day
  let stage2Count = 0; // 3 days
  let stage3Count = 0; // 7 days
  let stage4Count = 0; // 14 days
  let stage5Count = 0; // 30+ days (Mastered)
  let legacyCount = 0;
  
  questionsList.forEach(q => {
    const s = schedules[q.id];
    if (s) {
      if (s.nextReviewDate <= todayStr) {
        dueCount++;
      }
      if (s.intervalDays === 1) stage1Count++;
      else if (s.intervalDays === 3) stage2Count++;
      else if (s.intervalDays === 7) stage3Count++;
      else if (s.intervalDays === 14) stage4Count++;
      else if (s.intervalDays >= 30) stage5Count++;
    } else if (legacyList.includes(q.id)) {
      dueCount++;
      legacyCount++;
    }
  });
  
  const totalLearned = Object.keys(schedules).length + legacyCount;
  
  return {
    dueCount,
    stage1Count,
    stage2Count,
    stage3Count,
    stage4Count,
    stage5Count,
    legacyCount,
    totalLearned
  };
}
