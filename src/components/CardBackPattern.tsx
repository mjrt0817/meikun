import React from 'react';
import { Card } from '../cards';
import { Sparkles, BookOpen, Cpu, Shield, HelpCircle } from 'lucide-react';

interface Props {
  card: Card;
  className?: string;
}

export default function CardBackPattern({ card, className = '' }: Props) {
  const pattern = card.backPattern || getDefaultPattern(card);
  const title = card.backTitle || card.name;
  const explanation = card.backExplanation || card.description;
  const subtitle = card.backSubtitle || `${card.rarity} Rank Card`;

  // Render different themed card backs based on selected pattern
  switch (pattern) {
    case 'academic':
      return (
        <div className={`absolute inset-0 bg-[#fbf8f3] text-[#2c1d11] p-5 rounded-2xl flex flex-col justify-between border-4 border-[#8c6d53]/30 shadow-inner ${className}`}>
          {/* Subtle parchment watermark background */}
          <div className="absolute inset-2 border border-[#8c6d53]/10 rounded-xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className="flex items-center space-x-1.5 text-[#8c6d53] text-[10px] font-black tracking-widest uppercase mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ACADEMIC ARCHIVE</span>
            </div>
            <h3 className="font-serif text-lg font-bold border-b-2 border-[#8c6d53]/30 pb-1 w-full text-[#3d2414] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[10px] font-semibold text-[#8c6d53]/80 italic mt-1">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center my-4 overflow-y-auto px-1">
            <p className="font-serif text-xs leading-relaxed text-[#4a3525] text-justify font-medium">
              {explanation}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#8c6d53]/20 pt-2 text-[#8c6d53] text-[9px] font-bold">
            <span>NO. {card.id}</span>
            <span className="bg-[#8c6d53]/10 px-2 py-0.5 rounded font-mono text-[10px] text-[#8c6d53]">
              {card.rarity}
            </span>
          </div>
        </div>
      );

    case 'cyber':
      return (
        <div className={`absolute inset-0 bg-slate-950 text-cyan-400 p-5 rounded-2xl flex flex-col justify-between border-4 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ${className}`}>
          {/* Tech grid layout */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b208_1px,transparent_1px),linear-gradient(to_bottom,#0891b208_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          <div className="absolute top-2 right-2 flex space-x-1">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
          </div>

          <div className="flex flex-col mt-1">
            <div className="flex items-center space-x-1 text-cyan-500/70 text-[9px] font-mono tracking-widest uppercase">
              <Cpu className="w-3 h-3" />
              <span>SYS_DATABASE //</span>
            </div>
            <h3 className="font-mono text-base font-black tracking-tight text-white mt-1 border-l-2 border-cyan-400 pl-2">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-wider pl-2 mt-0.5">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center my-3 bg-slate-900/60 p-3 rounded-lg border border-cyan-500/10 overflow-y-auto">
            <p className="font-mono text-[11px] leading-relaxed text-cyan-100 text-left">
              {explanation}
            </p>
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] text-cyan-500/70">
            <span>ID_REF: {card.id.toUpperCase()}</span>
            <span className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-black text-[10px]">
              {card.rarity}
            </span>
          </div>
        </div>
      );

    case 'fantasy':
      return (
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-amber-100 p-5 rounded-2xl flex flex-col justify-between border-4 border-amber-500/45 shadow-[0_0_15px_rgba(245,158,11,0.1)] ${className}`}>
          {/* Celestial decoration */}
          <div className="absolute inset-1.5 border border-amber-500/10 rounded-xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className="flex items-center space-x-1 text-amber-400/80 text-[9px] font-bold tracking-widest uppercase mb-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>MYTHICAL COLLECTION</span>
            </div>
            <h3 className="font-sans text-lg font-extrabold text-white tracking-tight drop-shadow-md">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[9px] font-bold text-amber-300/70 tracking-wide mt-0.5">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center my-4 overflow-y-auto px-1">
            <p className="font-sans text-xs leading-relaxed text-slate-100 text-center font-medium drop-shadow-sm">
              {explanation}
            </p>
          </div>

          <div className="flex items-center justify-between text-amber-400/60 text-[9px] font-bold">
            <span>LEGEND #{card.id}</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black">
              {card.rarity}
            </span>
          </div>
        </div>
      );

    case 'japanese':
      return (
        <div className={`absolute inset-0 bg-gradient-to-b from-purple-950 via-[#2d1130] to-[#120514] text-rose-100 p-5 rounded-2xl flex flex-col justify-between border-4 border-purple-500/40 shadow-inner ${className}`}>
          {/* Traditional motif elements */}
          <div className="absolute inset-2 border border-purple-500/10 rounded-xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className="text-[9px] font-bold text-purple-300 tracking-[0.2em] mb-1">
              【 幻想郷ノ調書 】
            </div>
            <h3 className="font-sans text-lg font-black text-purple-50 tracking-wide border-b border-purple-500/20 pb-1 w-full drop-shadow">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[10px] font-medium text-pink-300/80 mt-1">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center my-4 overflow-y-auto px-1">
            <p className="font-sans text-xs leading-relaxed text-pink-50 text-justify font-medium tracking-wide">
              {explanation}
            </p>
          </div>

          <div className="flex items-center justify-between text-purple-400 text-[9px] font-bold">
            <span>其ノ {card.id}</span>
            <span className="bg-purple-900/50 text-pink-200 border border-purple-400/20 px-2 py-0.5 rounded font-black text-[10px]">
              {card.rarity}
            </span>
          </div>
        </div>
      );

    case 'minimalist':
    default:
      return (
        <div className={`absolute inset-0 bg-gray-50 text-gray-900 p-5 rounded-2xl flex flex-col justify-between border-2 border-gray-200 shadow-md ${className}`}>
          <div className="flex flex-col mt-2">
            <div className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
              CARD SPECIFICATION
            </div>
            <h3 className="text-lg font-black tracking-tight text-gray-900 mt-0.5">
              {title}
            </h3>
            {subtitle && (
              <span className="text-[10px] font-bold text-gray-500 tracking-wide">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center my-4 overflow-y-auto">
            <p className="text-xs leading-relaxed text-gray-700 font-semibold">
              {explanation}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-2.5 text-gray-400 text-[9px] font-black">
            <span>SPEC: {card.id.toUpperCase()}</span>
            <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-extrabold text-[10px]">
              {card.rarity}
            </span>
          </div>
        </div>
      );
  }
}

// Automatically assign a suitable default pattern based on rarity or style
function getDefaultPattern(card: Card): string {
  if (card.rarity === 'SEC') return 'cyber';
  if (card.rarity === 'UR') return 'japanese';
  if (card.rarity === 'SR') return 'fantasy';
  if (card.rarity === 'R') return 'academic';
  return 'minimalist';
}
