import React, { useState } from 'react';
import { UserProgress } from '../types';
import { Card } from '../cards';
import { Undo2, Lock, Sparkles } from 'lucide-react';
import CardBackPattern from './CardBackPattern';

interface Props {
  progress: UserProgress;
  onBack: () => void;
  cardsList: Card[];
}

export default function AlbumScreen({ progress, onBack, cardsList }: Props) {
  const unlocked = progress.unlockedCards || [];
  const completionRate = cardsList.length > 0 ? Math.round((unlocked.length / cardsList.length) * 100) : 0;
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer font-bold bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200">
          <Undo2 className="w-5 h-5 mr-2" /> 戻る
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-gray-800">カード図鑑</h2>
          <div className="text-sm font-bold text-gray-500 mt-1">コンプリート率：{completionRate}% ({unlocked.length}/{cardsList.length})</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cardsList.map(card => {
          const isUnlocked = unlocked.includes(card.id);
          const isFlipped = flippedCardIds.includes(card.id);
          
          if (!isUnlocked) {
            return (
              <div key={card.id} className="aspect-[1/1.397] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 relative group">
                <Lock className="w-8 h-8 text-gray-300 mb-2" />
                <div className="text-6xl filter grayscale opacity-20">{card.icon}</div>
                <div className="absolute top-2 left-2 bg-gray-200 text-gray-400 text-xs font-bold px-1.5 py-0.5 rounded">
                  {card.rarity}
                </div>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              onClick={() => {
                setFlippedCardIds(prev => 
                  prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]
                );
              }}
              className="aspect-[1/1.397] relative cursor-pointer group animate-none"
              style={{ perspective: '1000px' }}
            >
              <div
                className="w-full h-full relative transform transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front of Card */}
                <div
                  className={`absolute inset-0 rounded-xl shadow-md flex flex-col overflow-hidden text-white group-hover:scale-[1.02] transition-transform duration-300 ${
                    card.imageUrl ? '' : `bg-gradient-to-br ${card.color} p-3 items-center`
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    WebkitTransform: 'rotateY(0deg)',
                  }}
                >
                  {card.imageUrl ? (
                    <div className="w-full h-full relative">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-white/10">
                        {card.rarity}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-2 left-2 bg-white/30 backdrop-blur text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                        {card.rarity}
                      </div>
                      <div className="text-4xl mt-6 mb-2 drop-shadow-md">{card.icon}</div>
                      <h3 className="text-sm font-black text-center leading-tight mb-2 flex-1 drop-shadow-md">{card.name}</h3>
                      <p className="text-[10px] bg-black/20 p-1.5 rounded w-full text-center leading-snug">
                        {card.description}
                      </p>
                    </>
                  )}
                </div>

                {/* Back of Card (Patterned design with explanations) */}
                <div
                  className="absolute inset-0 rounded-xl shadow-md overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    WebkitTransform: 'rotateY(180deg)',
                  }}
                >
                  <CardBackPattern card={card} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
