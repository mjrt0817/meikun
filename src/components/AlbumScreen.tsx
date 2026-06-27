import React, { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { Card, Rarity } from '../cards';
import { Undo2, Lock, Sparkles, Filter, X, RotateCw, Eye } from 'lucide-react';
import CardBackPattern from './CardBackPattern';

interface Props {
  progress: UserProgress;
  onBack: () => void;
  cardsList: Card[];
}

const RARITY_ORDER: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'SEC'];

const getRarityBadgeColor = (rarity: Rarity) => {
  switch (rarity) {
    case 'SEC': return 'bg-red-500 text-white shadow-sm shadow-red-100';
    case 'UR': return 'bg-purple-600 text-white shadow-sm shadow-purple-100';
    case 'SSR': return 'bg-emerald-500 text-white shadow-sm shadow-emerald-100';
    case 'SR': return 'bg-yellow-500 text-gray-900 shadow-sm shadow-yellow-100';
    case 'R': return 'bg-blue-500 text-white shadow-sm shadow-blue-100';
    default: return 'bg-gray-400 text-white';
  }
};

const getRarityLabel = (rarity: Rarity) => {
  switch (rarity) {
    case 'SEC': return 'SECRET';
    case 'UR': return 'ULTRA RARE';
    case 'SSR': return 'SPECIALLY SUPER RARE';
    case 'SR': return 'SUPER RARE';
    case 'R': return 'RARE';
    default: return 'NORMAL';
  }
};

export default function AlbumScreen({ progress, onBack, cardsList }: Props) {
  const unlocked = progress.unlockedCards || [];
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [modalFlipped, setModalFlipped] = useState(false);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const rarityIndex = (r: Rarity) => {
    const idx = RARITY_ORDER.indexOf(r);
    return idx === -1 ? 99 : idx;
  };

  // Sort cards: N -> R -> SR -> SSR -> UR -> SEC
  const sortedCards = [...cardsList].sort((a, b) => {
    const diff = rarityIndex(a.rarity) - rarityIndex(b.rarity);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  // Filter cards by selected rarity
  const filteredCards = selectedRarity === 'ALL'
    ? sortedCards
    : sortedCards.filter(card => card.rarity === selectedRarity);

  const completionRate = cardsList.length > 0 ? Math.round((unlocked.length / cardsList.length) * 100) : 0;

  // Count cards by rarity for the filter tabs
  const getRarityCount = (rarity: Rarity | 'ALL') => {
    if (rarity === 'ALL') return cardsList.length;
    return cardsList.filter(c => c.rarity === rarity).length;
  };

  const getRarityUnlockedCount = (rarity: Rarity | 'ALL') => {
    if (rarity === 'ALL') return unlocked.length;
    return cardsList.filter(c => c.rarity === rarity && unlocked.includes(c.id)).length;
  };

  const filterTabs: { value: Rarity | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'すべて' },
    { value: 'N', label: 'N' },
    { value: 'R', label: 'R' },
    { value: 'SR', label: 'SR' },
    { value: 'SSR', label: 'SSR' },
    { value: 'UR', label: 'UR' },
    { value: 'SEC', label: 'SEC' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
        <button onClick={onBack} className="self-start flex items-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer font-bold bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200">
          <Undo2 className="w-5 h-5 mr-2" /> 戻る
        </button>
        <div className="text-left sm:text-right">
          <h2 className="text-2xl font-black text-gray-800 flex items-center sm:justify-end gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            カード図鑑
          </h2>
          <div className="text-sm font-bold text-gray-500 mt-1">
            コンプリート率：{completionRate}% ({unlocked.length}/{cardsList.length})
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest mb-3 gap-1">
          <Filter className="w-3.5 h-3.5" />
          レア度でフィルター
        </div>
        <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          {filterTabs.map((tab) => {
            const isActive = selectedRarity === tab.value;
            const totalCount = getRarityCount(tab.value);
            const unlockedCount = getRarityUnlockedCount(tab.value);
            
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedRarity(tab.value)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.03]'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {unlockedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-gray-400 font-bold text-sm">該当するカードはありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map(card => {
            const isUnlocked = unlocked.includes(card.id);
            
            if (!isUnlocked) {
              return (
                <div key={card.id} className="aspect-[1/1.397] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 relative group">
                  <Lock className="w-8 h-8 text-gray-300 mb-2" />
                  <div className="text-6xl filter grayscale opacity-20">{card.icon}</div>
                  <div className={`absolute top-2 left-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm ${getRarityBadgeColor(card.rarity)}`}>
                    {card.rarity}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={card.id}
                onClick={() => {
                  setSelectedCard(card);
                  setModalFlipped(false);
                }}
                className="aspect-[1/1.397] relative cursor-pointer group hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Micro overlay to show "View Detail" on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl z-10 transition-colors flex items-center justify-center">
                  <div className="bg-white/95 text-slate-800 text-xs font-black px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    詳細を表示
                  </div>
                </div>

                {/* Front Preview */}
                <div
                  className={`w-full h-full rounded-xl shadow-md flex flex-col overflow-hidden text-white ${
                    card.imageUrl ? '' : `bg-gradient-to-br ${card.color} p-3 items-center`
                  }`}
                >
                  {card.imageUrl ? (
                    <div className="w-full h-full relative">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute top-2 left-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border border-white/10 ${getRarityBadgeColor(card.rarity)}`}>
                        {card.rarity}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`absolute top-2 left-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm ${getRarityBadgeColor(card.rarity)}`}>
                        {card.rarity}
                      </div>
                      <div className="text-4xl mt-6 mb-2 drop-shadow-md">{card.icon}</div>
                      <h3 className="text-sm font-black text-center leading-tight mb-2 flex-1 drop-shadow-md">{card.name}</h3>
                      <p className="text-[10px] bg-black/20 p-1.5 rounded w-full text-center leading-snug truncate">
                        {card.description}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {/* Left Column: Visual Flip Card Stage */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 relative min-h-[360px] md:min-h-[460px]">
              <div className="absolute top-4 left-4 text-xs font-bold text-slate-400">
                クリックでカードを裏返せます
              </div>
              
              <div 
                className="w-[200px] h-[279.4px] md:w-[240px] md:h-[335.2px] relative cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => setModalFlipped(!modalFlipped)}
              >
                <div
                  className="w-full h-full relative transform transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    transform: modalFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    WebkitTransform: modalFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front View */}
                  <div
                    className={`absolute inset-0 rounded-2xl shadow-xl flex flex-col overflow-hidden text-white ${
                      selectedCard.imageUrl ? '' : `bg-gradient-to-br ${selectedCard.color} p-5 items-center justify-between`
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(0deg)',
                      WebkitTransform: 'rotateY(0deg)',
                    }}
                  >
                    {selectedCard.imageUrl ? (
                      <div className="w-full h-full relative">
                        <img
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute top-4 left-4 text-xs font-black px-2.5 py-1 rounded shadow-md border border-white/20 ${getRarityBadgeColor(selectedCard.rarity)}`}>
                          {selectedCard.rarity}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`self-start text-xs font-black px-2.5 py-1 rounded shadow-md ${getRarityBadgeColor(selectedCard.rarity)}`}>
                          {selectedCard.rarity}
                        </div>
                        <div className="text-6xl my-4 drop-shadow-md animate-bounce">{selectedCard.icon}</div>
                        <div className="w-full">
                          <h3 className="text-lg font-black text-center leading-tight mb-3 drop-shadow-md">{selectedCard.name}</h3>
                          <p className="text-xs bg-black/25 p-3 rounded-xl text-center leading-relaxed">
                            {selectedCard.description}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Back View */}
                  <div
                    className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      WebkitTransform: 'rotateY(180deg)',
                    }}
                  >
                    <CardBackPattern card={selectedCard} />
                  </div>
                </div>
              </div>

              {/* Flip Button */}
              <button
                onClick={() => setModalFlipped(!modalFlipped)}
                className="mt-6 flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                <RotateCw className="w-4 h-4 text-slate-500" />
                カードを回転させる
              </button>
            </div>

            {/* Right Column: In-depth Explanations */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto" style={{ maxHeight: '100%' }}>
              <div>
                {/* Top Info Bar */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${getRarityBadgeColor(selectedCard.rarity)}`}>
                      {getRarityLabel(selectedCard.rarity)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-extrabold font-mono">ID: {selectedCard.id}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCard(null)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Card Title */}
                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2 flex items-center gap-2">
                  <span className="text-3xl">{selectedCard.icon}</span>
                  {selectedCard.name}
                </h3>
                
                <p className="text-sm text-slate-500 font-bold mb-6 border-l-4 border-slate-300 pl-3 italic">
                  {selectedCard.description}
                </p>

                {/* Backside Detailed Information & Explanation */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    裏面デザイン ＆ 詳細解説
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">裏面タイトル</span>
                      <p className="text-sm font-extrabold text-slate-800">
                        {selectedCard.backTitle || selectedCard.name}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">裏面サブタイトル</span>
                      <p className="text-xs font-bold text-slate-600">
                        {selectedCard.backSubtitle || `${selectedCard.rarity} Rank Card`}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">裏面の解説・ストーリー</span>
                      <div className="text-xs text-slate-700 leading-relaxed font-semibold bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-inner max-h-[160px] overflow-y-auto">
                        {selectedCard.backExplanation || selectedCard.description || '追加の説明解説はありません。'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-[10px] font-bold text-slate-400">
                      <span>裏面デザインパターン:</span>
                      <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        {selectedCard.backPattern || 'minimalist'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button / Bottom Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                  図鑑に戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
