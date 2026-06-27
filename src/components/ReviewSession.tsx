import React, { useState } from 'react';
import { Question, UserProgress } from '../types';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Trophy } from 'lucide-react';
import VideoLinkBadge from './VideoLinkBadge';
import { getActiveReviewQuestions, updateReviewSchedule } from '../utils/ebbinghaus';

interface Props {
  questions: Question[];
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
  onFinish: () => void;
}

export default function ReviewSession({ questions, progress, onUpdateProgress, onFinish }: Props) {
  const reviewQuestions = getActiveReviewQuestions(questions, progress);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState<number | null>(null);

  if (reviewQuestions.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-green-100">
        <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">復習する問題がありません！</h2>
        <p className="text-gray-600 mb-8 font-medium">素晴らしいです！間違えた問題はすべてクリアしました。</p>
        <button
          onClick={onFinish}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow transition-all active:scale-95 cursor-pointer"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  // Handle out of bounds if questions form shrinks
  if (currentIndex >= reviewQuestions.length) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">復習セッション完了！</h2>
        <p className="text-gray-600 mb-8 font-medium">よくがんばりました。また間違えた問題を復習しましょう。</p>
        <button
          onClick={onFinish}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow transition-all active:scale-95 cursor-pointer"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const currentQ = reviewQuestions[currentIndex];
  const isCorrect = selectedOption === currentQ.correctAnswerIndex;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCurrentlyCorrect = index === currentQ.correctAnswerIndex;
    
    // Update progress
    const newProgress = { ...progress };
    newProgress.answeredQuestions = { ...newProgress.answeredQuestions, [currentQ.id]: isCurrentlyCorrect };
    
    // Update Ebbinghaus schedule
    newProgress.reviewSchedules = updateReviewSchedule(currentQ.id, isCurrentlyCorrect, newProgress.reviewSchedules);
    
    if (isCurrentlyCorrect) {
      // Remove from legacy list if correct
      newProgress.reviewList = newProgress.reviewList.filter(id => id !== currentQ.id);
      
      const coinsToEarn = showHint ? 15 : 30; // Revenge correct bonus
      newProgress.coins = (newProgress.coins || 0) + coinsToEarn;
      setEarnedCoins(coinsToEarn);
    } else {
      // Add to legacy list for fallback
      if (!newProgress.reviewList.includes(currentQ.id)) {
        newProgress.reviewList = [...newProgress.reviewList, currentQ.id];
      }
    }
    
    onUpdateProgress(newProgress);
  };

  const handleVideoWatch = () => {
    const newProgress = { ...progress };
    newProgress.coins = (newProgress.coins || 0) + 20;
    setEarnedCoins(20);
    onUpdateProgress(newProgress);
  };

  const handleNext = () => {
    if (isCorrect) {
      // If correct, the question is removed from review list, so don't increment index
      // The array shrinks, so currentIndex points to the next question automatically
    } else {
      // If still wrong, keep it in the list and move to next question if possible
      setCurrentIndex(currentIndex + 1);
    }
    
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setEarnedCoins(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-purple-100">
      <div className="flex justify-between items-center mb-6">
        <span className="bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-bold flex items-center">
          復習モード：あと {reviewQuestions.length} 問
        </span>
        <span className="text-gray-500 font-medium text-sm border border-gray-200 px-3 py-1 rounded-full">
          {currentQ.subject === 'math' ? '算数' : '国語'} / {currentQ.category}
        </span>
      </div>

      <div className="mb-8">
        <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
          {currentQ.text}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {currentQ.options.map((option, idx) => {
          let btnClass = "w-full text-left p-5 rounded-xl border-2 transition-all font-medium text-lg ";
          if (isAnswered) {
            if (idx === currentQ.correctAnswerIndex) {
              btnClass += "bg-green-50 border-green-500 text-green-800 shadow-sm";
            } else if (idx === selectedOption) {
              btnClass += "bg-red-50 border-red-400 text-red-700";
            } else {
              btnClass += "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
            }
          } else {
            btnClass += "bg-white border-blue-100 text-gray-700 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 shadow-sm";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={btnClass}
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 mr-4 text-sm font-bold shadow-sm">
                  {idx + 1}
                </span>
                {option}
                {isAnswered && idx === currentQ.correctAnswerIndex && (
                  <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctAnswerIndex && (
                  <XCircle className="w-6 h-6 text-red-500 ml-auto" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isAnswered && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowHint(!showHint)}
            className="flex items-center text-purple-600 hover:text-purple-800 font-medium px-4 py-2 rounded-full hover:bg-purple-50 transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            ヒントを見る
          </button>
        </div>
      )}

      {showHint && !isAnswered && (
        <div className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100 animate-in fade-in zoom-in duration-200">
          <p className="flex items-start text-purple-800 font-medium whitespace-pre-wrap">
            <span className="text-xl mr-2">💡</span>
            {currentQ.hint}
          </p>
        </div>
      )}

      {isAnswered && (
        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-6">
            <h3 className="flex items-center text-lg font-bold mb-3 text-gray-800">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm mr-3">解説</span>
            </h3>
            {earnedCoins !== null && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl flex items-center font-bold animate-in slide-in-from-top-2">
                🪙 {earnedCoins} コインゲット！
              </div>
            )}
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100 whitespace-pre-wrap text-[17px]">
              {currentQ.explanation}
            </p>
            <VideoLinkBadge text={currentQ.explanation} onWatch={handleVideoWatch} />
            {isCorrect ? (
             <p className="text-green-600 font-bold mt-4 flex items-center">
               <CheckCircle2 className="w-5 h-5 mr-1"/> 正解したので復習リストから外れました！
             </p> 
            ) : (
             <p className="text-red-500 font-bold mt-4 flex items-center">
               <XCircle className="w-5 h-5 mr-1"/> もう少し！次また復習しましょう。
             </p> 
            )}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full sm:w-auto sm:float-right flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-md transition-all active:scale-95"
          >
            次へ進む
            <ArrowRight className="w-6 h-6 ml-2" />
          </button>
          <div className="clear-both"></div>
        </div>
      )}
    </div>
  );
}
