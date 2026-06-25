import React, { useState } from 'react';
import { UserProgress } from '../types';
import { Card, drawGacha, GACHA_COST } from '../cards';
import { Coins, Sparkles, RefreshCw, Undo2 } from 'lucide-react';
import CardBackPattern from './CardBackPattern';

interface Props {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onBack: () => void;
  cardsList: Card[];
}

export default function GachaScreen({ progress, onUpdateProgress, onBack, cardsList }: Props) {
  const [result, setResult] = useState<Card | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleDraw = () => {
    if ((progress.coins || 0) < GACHA_COST) return;
    
    setIsDrawing(true);
    setResult(null);
    setIsFlipped(false);
    setIsRevealed(false);

    // deduct coins
    const newProgress = { ...progress, coins: (progress.coins || 0) - GACHA_COST };
    
    setTimeout(() => {
      const card = drawGacha(progress.gachaRates, cardsList);
      setResult(card);
      setIsDrawing(false);
      
      // add card to unlockedCards if not already there
      if (!newProgress.unlockedCards) newProgress.unlockedCards = [];
      if (!newProgress.unlockedCards.includes(card.id)) {
        newProgress.unlockedCards = [...newProgress.unlockedCards, card.id];
      }
      onUpdateProgress(newProgress);
    }, 1500); // 1.5s animation
  };

  const handleCardClick = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setIsFlipped(true); // Flip to show the front image
    } else {
      setIsFlipped(prev => !prev); // Toggle between front and back
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100">
          <Undo2 className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full font-bold">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span>{progress.coins || 0} コイン</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">カードガチャ</h2>
      <p className="text-sm text-gray-500 mb-8">1回 {GACHA_COST} コインで引けるよ！</p>

      <div className="relative w-64 h-80 mb-6" style={{ perspective: '1000px', WebkitPerspective: '1000px' }}>
        {isDrawing ? (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center animate-pulse">
            <RefreshCw className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : result ? (
          <div
            onClick={handleCardClick}
            className={`w-full h-full cursor-pointer relative ${
              isFlipped && (result.rarity === 'UR' || result.rarity === 'SEC') ? 'animate-bounce' : ''
            }`}
          >
            <div
              className="w-full h-full relative transition-transform duration-700 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front of Card (appears when rotated 180deg) */}
              <div
                className={`absolute inset-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
                  result.rarity === 'UR' || result.rarity === 'SEC' ? 'ring-4 ring-yellow-400 ring-offset-2 shadow-yellow-400/50' : ''
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  WebkitTransform: 'rotateY(180deg)',
                }}
              >
                {result.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Subtle small overlay badge for consistency, matching the style */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded font-black text-xs text-white shadow-sm border border-white/20">
                      {result.rarity}
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${result.color} flex flex-col items-center p-6 text-white`}>
                    {/* Rarity badge */}
                    <div className="absolute top-4 left-4 bg-white/30 backdrop-blur-sm px-2 py-1 rounded font-black text-sm shadow-sm">
                      {result.rarity}
                    </div>
                    
                    <div className="text-6xl mt-8 mb-6 drop-shadow-lg filter">{result.icon}</div>
                    <h3 className="text-xl font-black mb-2 text-center drop-shadow-md">{result.name}</h3>
                    <p className="text-sm font-medium text-center bg-black/20 p-3 rounded-xl w-full leading-relaxed backdrop-blur-sm">
                      {result.description}
                    </p>
                    
                    {(result.rarity === 'UR' || result.rarity === 'SEC') && (
                      <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-300 animate-spin-slow" />
                    )}
                  </div>
                )}
              </div>

              {/* Back of Card (shows Mystery Back when unrevealed, otherwise card's explanation back) */}
              {isRevealed ? (
                <CardBackPattern card={result} />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 rounded-2xl shadow-xl border-4 border-yellow-500/60 p-4 flex flex-col items-center justify-between text-white"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    WebkitTransform: 'rotateY(0deg)',
                  }}
                >
                  <div className="absolute inset-2 border border-yellow-500/20 rounded-xl pointer-events-none" />
                  
                  <div className="text-yellow-500/40 text-xs font-bold tracking-widest uppercase mt-2">
                    ★ MYSTERY CARD ★
                  </div>
                  
                  <div className="relative flex items-center justify-center w-24 h-24">
                    <div className="absolute inset-0 border-2 border-yellow-500/20 rounded-full animate-ping duration-1000" />
                    <div className="absolute inset-2 border border-yellow-500/30 rounded-full animate-spin-slow" />
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>

                  <div className="mb-2 text-center">
                    <div className="text-sm font-bold text-yellow-400">TAP TO REVEAL</div>
                    <div className="text-[10px] text-gray-400 mt-1">タップしてめくろう！</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-100 rounded-2xl shadow-inner border-4 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-400 font-bold">カードがここに出るよ</span>
          </div>
        )}
      </div>

      {result && (
        <p className="text-sm font-bold text-indigo-600 animate-pulse mb-4">
          ✨ タップすると裏返るよ！ ✨
        </p>
      )}

      <button
        onClick={handleDraw}
        disabled={isDrawing || (progress.coins || 0) < GACHA_COST}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-md flex justify-center items-center ${
          isDrawing || (progress.coins || 0) < GACHA_COST
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white cursor-pointer'
        }`}
      >
        {isDrawing ? 'ガチャを回しています...' : 'ガチャを回す！'}
      </button>
      
      {(progress.coins || 0) < GACHA_COST && !isDrawing && (
        <p className="mt-4 text-sm font-bold text-red-500">コインが足りないよ！問題を解いて集めよう！</p>
      )}
    </div>
  );
}
