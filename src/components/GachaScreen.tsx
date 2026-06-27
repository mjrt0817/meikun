import React, { useState } from 'react';
import { UserProgress } from '../types';
import { Card, drawGacha, GACHA_COST, Rarity } from '../cards';
import { Coins, Sparkles, RefreshCw, Undo2 } from 'lucide-react';
import CardBackPattern from './CardBackPattern';

interface Props {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onBack: () => void;
  cardsList: Card[];
}

const getRarityGlowClasses = (rarity: Rarity) => {
  switch (rarity) {
    case 'SEC':
      return {
        outerGlow: 'bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500 animate-rainbow-glow animate-glow-pulse',
        ringClass: 'ring-4 ring-pink-500 ring-offset-2 shadow-[0_0_50px_rgba(236,72,153,0.8)] border border-yellow-300',
        cardSparkles: 'text-yellow-300 animate-spin-slow',
        titleColor: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-extrabold',
        soundText: '🎉 神引き！！ シークレットカード出現！ 🌈'
      };
    case 'UR':
      return {
        outerGlow: 'bg-gradient-to-r from-yellow-400 via-amber-300 via-yellow-500 to-orange-500 animate-glow-pulse',
        ringClass: 'ring-4 ring-yellow-400 ring-offset-2 shadow-[0_0_40px_rgba(234,179,8,0.7)] border border-yellow-200',
        cardSparkles: 'text-yellow-300 animate-pulse',
        titleColor: 'text-yellow-600 font-extrabold',
        soundText: '✨ 超激レア！！ 黄金のURカード出現！ ✨'
      };
    case 'SSR':
      return {
        outerGlow: 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 animate-glow-pulse opacity-90',
        ringClass: 'ring-3 ring-emerald-400 ring-offset-1 shadow-[0_0_30px_rgba(16,185,129,0.6)] border border-emerald-200',
        cardSparkles: 'text-emerald-300 animate-pulse',
        titleColor: 'text-emerald-600 font-extrabold',
        soundText: '💖 奇跡の一枚！ SSRカード出現！ 💖'
      };
    case 'SR':
      return {
        outerGlow: 'bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 animate-glow-pulse opacity-85',
        ringClass: 'ring-2 ring-purple-500 ring-offset-1 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
        cardSparkles: 'text-purple-300 animate-bounce',
        titleColor: 'text-purple-600 font-extrabold',
        soundText: '💎 激レア！ SRカード出現！ 💎'
      };
    case 'R':
      return {
        outerGlow: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 animate-pulse opacity-70',
        ringClass: 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
        cardSparkles: 'text-blue-300',
        titleColor: 'text-blue-600 font-bold',
        soundText: '🌟 レア！ Rカード出現！ 🌟'
      };
    default: // 'N'
      return {
        outerGlow: 'bg-gradient-to-r from-slate-200 to-slate-300 opacity-40',
        ringClass: 'ring border-slate-300 shadow-sm',
        cardSparkles: 'text-slate-400',
        titleColor: 'text-gray-700 font-bold',
        soundText: 'ノーマルカード！👍'
      };
  }
};

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

      <div className="relative w-72 sm:w-80 md:w-[380px] aspect-[1/1.397] mb-6" style={{ perspective: '1000px', WebkitPerspective: '1000px' }}>
        {isDrawing ? (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center animate-pulse">
            <RefreshCw className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : result ? (
          <>
            {/* BACKGROUND RADIANT GLOW - レアリティに応じた光り輝く背景 */}
            <div className={`absolute -inset-8 md:-inset-12 rounded-[40px] filter blur-3xl opacity-80 transition-all duration-1000 ${getRarityGlowClasses(result.rarity).outerGlow}`} />
            
            {/* Spinning background rays for premium rarities to enhance card draw excitement */}
            {result.rarity !== 'N' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                <div className="absolute w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_60%)] rounded-full animate-spin-slow" />
                {(result.rarity === 'UR' || result.rarity === 'SEC' || result.rarity === 'SSR') && (
                  <div className="absolute w-[125%] h-[125%] bg-[radial-gradient(circle,rgba(253,224,71,0.1)_0%,rgba(0,0,0,0)_65%)] rounded-full animate-spin-reverse" />
                )}
              </div>
            )}

            <div
              onClick={handleCardClick}
              className={`w-full h-full cursor-pointer relative ${
                isFlipped && (result.rarity === 'UR' || result.rarity === 'SEC' || result.rarity === 'SSR') ? 'animate-bounce' : ''
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
                    getRarityGlowClasses(result.rarity).ringClass
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
                      
                      {/* Interactive Sparkles Floating for SSR, UR and SEC Images */}
                      {(result.rarity === 'UR' || result.rarity === 'SEC' || result.rarity === 'SSR') && (
                        <div className="absolute inset-0 pointer-events-none">
                          <Sparkles className={`absolute top-4 right-4 w-6 h-6 ${getRarityGlowClasses(result.rarity).cardSparkles}`} />
                          <Sparkles className="absolute bottom-6 left-6 w-4 h-4 text-white/80 animate-ping" />
                          <Sparkles className="absolute top-1/3 right-8 w-5 h-5 text-yellow-300 animate-pulse" />
                        </div>
                      )}
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
                      
                      <Sparkles className={`absolute top-4 right-4 w-6 h-6 ${getRarityGlowClasses(result.rarity).cardSparkles}`} />
                    </div>
                  )}
                </div>

              {/* Back of Card (shows Mystery Back when unrevealed, otherwise card's explanation back) */}
              {isRevealed ? (
                <div
                  className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    WebkitTransform: 'rotateY(0deg)',
                  }}
                >
                  <CardBackPattern card={result} />
                </div>
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
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-100 rounded-2xl shadow-inner border-4 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-400 font-bold">カードがここに出るよ</span>
          </div>
        )}
      </div>

      {result && (
        <div className="text-center mb-4 min-h-[52px] flex flex-col items-center justify-center">
          {isRevealed ? (
            <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center">
              <p className={`text-base font-black tracking-wide ${getRarityGlowClasses(result.rarity).titleColor}`}>
                {getRarityGlowClasses(result.rarity).soundText}
              </p>
              <p className="text-xs text-gray-500 font-bold mt-1">
                カードをもう一度タップすると、裏側の解説が読めるよ！
              </p>
            </div>
          ) : (
            <p className="text-sm font-black text-indigo-600 animate-pulse">
              ✨ タップして運命のカードをめくろう！ ✨
            </p>
          )}
        </div>
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
