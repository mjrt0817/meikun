import React, { useState, useEffect, useRef } from 'react';
import { Question, Subject, UserProgress } from '../types';
import { Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import VideoLinkBadge from './VideoLinkBadge';
import { updateReviewSchedule } from '../utils/ebbinghaus';

interface Props {
  questions: Question[];
  subject: Subject;
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
  onFinish: () => void;
}

export default function MockExamSession({ questions, subject, progress, onUpdateProgress, onFinish }: Props) {
  const examQuestions = questions.filter(q => q.subject === subject);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [examFinished, setExamFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 10); // 10分間に延長してじっくり解けるように変更
  const [showConfirm, setShowConfirm] = useState(false);

  // Stateの最新値を保持するRef（setInterval内からの古いクロージャアクセスを防止）
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const examFinishedRef = useRef(examFinished);
  examFinishedRef.current = examFinished;

  const finishExam = () => {
    if (examFinishedRef.current) return;
    setExamFinished(true);
    examFinishedRef.current = true;

    let correctCount = 0;
    const currentProgress = { ...progressRef.current };
    const latestAnswers = userAnswersRef.current;
    
    examQuestions.forEach(q => {
      const userAnswer = latestAnswers[q.id];
      const isCorrect = userAnswer === q.correctAnswerIndex;
      if (isCorrect) correctCount++;
      
      currentProgress.answeredQuestions = { ...currentProgress.answeredQuestions, [q.id]: isCorrect };
      
      // Update Ebbinghaus schedule
      currentProgress.reviewSchedules = updateReviewSchedule(q.id, isCorrect, currentProgress.reviewSchedules);
      
      // まちがえた問題や未回答のものを自動で復習リストに追加
      if (!isCorrect && !currentProgress.reviewList.includes(q.id)) {
        currentProgress.reviewList = [...currentProgress.reviewList, q.id];
      }
    });
    
    currentProgress.mockExamScores = [
      ...currentProgress.mockExamScores,
      { date: new Date().toISOString(), score: correctCount, total: examQuestions.length, subject }
    ];
    
    onUpdateProgress(currentProgress);
  };

  useEffect(() => {
    if (examFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [examFinished]);

  const handleSelectOption = (index: number) => {
    if (examFinished) return;
    const qId = examQuestions[currentIndex].id;
    setUserAnswers(prev => ({ ...prev, [qId]: index }));
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowConfirm(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowConfirm(false);
    }
  };

  if (examQuestions.length === 0) {
    return <div className="p-8 text-center text-gray-500">問題がありません。</div>;
  }

  if (examFinished) {
    const correctCount = examQuestions.filter(q => userAnswers[q.id] === q.correctAnswerIndex).length;
    const scorePercentage = Math.round((correctCount / examQuestions.length) * 100);
    
    return (
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-red-100 animate-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">模擬試験 結果</h2>
        
        <div className="flex flex-col items-center justify-center py-8 mb-8 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-gray-500 font-medium mb-2">あなたの得点 ({subject === 'math' ? '算数' : '国語'})</span>
          <div className="text-6xl font-black text-red-500 mb-2">{scorePercentage} <span className="text-3xl text-gray-400 font-bold">点</span></div>
          <div className="text-xl font-bold text-gray-600">
            {correctCount} / {examQuestions.length} 問正解
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-bold border-b border-gray-200 pb-3 text-gray-800">結果の内訳と詳しい解説</h3>
          {examQuestions.map((q, idx) => {
            const uAns = userAnswers[q.id];
            const isCorrect = uAns === q.correctAnswerIndex;
            return (
              <div key={q.id} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 mb-2 text-lg">第{idx + 1}問：{q.category}</h4>
                    <p className="text-gray-800 font-medium mb-3 whitespace-pre-wrap bg-white/70 p-3 rounded-xl border border-gray-100">{q.text}</p>
                    {isCorrect ? (
                      <p className="text-sm font-bold text-green-700 mb-2">★ 正解！</p>
                    ) : (
                      <div className="mb-3 space-y-1">
                        <p className="text-sm font-bold text-red-700">あなたの回答：{uAns !== undefined ? q.options[uAns] : '未回答'}</p>
                        <p className="text-sm font-bold text-green-700">正しい答え：{q.options[q.correctAnswerIndex]}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-700 mt-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs whitespace-pre-wrap leading-relaxed">
                      <span className="font-bold text-indigo-900 block mb-1">【解説】</span>
                      {q.explanation}
                    </div>
                    {/* 解説内にキーワードがあればNotebookLM解説動画へのバッジ＆リンクを表示 */}
                    <VideoLinkBadge text={q.explanation} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onFinish}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-12 rounded-full text-lg shadow-md transition-all active:scale-95 cursor-pointer"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const currentQ = examQuestions[currentIndex];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-sm border border-red-100 relative">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <span className="text-gray-600 font-bold bg-gray-100 px-4 py-1.5 rounded-full text-sm">
          第 {currentIndex + 1} 問 / {examQuestions.length} 問 ({subject === 'math' ? '算数' : '国語'})
        </span>
        <div className={`flex items-center font-mono font-bold text-lg px-4 py-1.5 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
          <Clock className="w-5 h-5 mr-2" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-8 min-h-[120px]">
        <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded inline-block mb-3">{currentQ.category}</span>
        <p className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
          {currentQ.text}
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {currentQ.options.map((option, idx) => {
          const isSelected = userAnswers[currentQ.id] === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-lg cursor-pointer ${
                isSelected 
                  ? "bg-red-50 border-red-500 text-red-900 shadow-sm" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-4 text-sm font-bold shadow-sm ${isSelected ? 'bg-red-500 text-white border-transparent' : 'bg-white border border-gray-300 text-gray-500'}`}>
                  {idx + 1}
                </span>
                {option}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`font-bold py-3 px-6 rounded-full transition-all cursor-pointer ${
            currentIndex === 0 ? 'text-gray-300 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-gray-200 hover:bg-gray-300 active:scale-95'
          }`}
        >
          前の問題
        </button>

        {currentIndex < examQuestions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 px-8 rounded-full shadow transition-all active:scale-95 cursor-pointer"
          >
            次の問題 <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-full shadow transition-all active:scale-95 cursor-pointer"
              >
                終了して採点する
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl border border-red-200 shadow-xs animate-in slide-in-from-right-4 duration-300">
                <span className="text-xs font-bold text-red-700 px-2">採点しますか？</span>
                <button
                  type="button"
                  onClick={() => finishExam()}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  はい
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer"
                >
                  いいえ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
