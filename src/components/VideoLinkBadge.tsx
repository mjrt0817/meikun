import React from 'react';
import { Video, ExternalLink } from 'lucide-react';

interface Props {
  text: string;
  onWatch?: () => void;
}

// ご自身のNotebookLM解説動画URLや参考動画URLにいつでも差し替えられるよう一覧化しています
const KEYWORD_VIDEO_MAP: Record<string, { title: string; url: string }> = {
  'つるかめ算': {
    title: 'つるかめ算の基本と面積図を使ったスピード解法',
    url: 'https://notebooklm.google.com/' 
  },
  '旅人算': {
    title: '旅人算（追いつき・出会い）の公式と図解ポイント',
    url: 'https://notebooklm.google.com/'
  },
  '連除法': {
    title: 'すだれ算（連除法）で最小公倍数・最大公約数を一瞬で解く鉄則',
    url: 'https://notebooklm.google.com/'
  },
  '最小公倍数': {
    title: 'すだれ算（連除法）で最小公倍数・最大公約数を一瞬で解く鉄則',
    url: 'https://notebooklm.google.com/'
  },
  '最大公約数': {
    title: 'すだれ算（連除法）で最小公倍数・最大公約数を一瞬で解く鉄則',
    url: 'https://notebooklm.google.com/'
  },
  '食塩水': {
    title: '食塩水の濃度と天秤図（てんびんず）を使ったパーフェクト解法',
    url: 'https://notebooklm.google.com/'
  },
  '割合': {
    title: 'もとにする量とくらべる量の関係・割合スピード計算術',
    url: 'https://notebooklm.google.com/'
  },
  '図形': {
    title: '図形の面積・3.14の掛け算クローク暗記テクニック',
    url: 'https://notebooklm.google.com/'
  },
  '四字熟語': {
    title: '私立中学受験でよく出る四字熟語と言葉の組み立て',
    url: 'https://notebooklm.google.com/'
  },
  'ことわざ': {
    title: '対義・類義のことわざ完全頻出マニュアル',
    url: 'https://notebooklm.google.com/'
  },
  '敬語': {
    title: '尊敬語と謙譲語の「主語」を見分けるポイント動画',
    url: 'https://notebooklm.google.com/'
  }
};

export default function VideoLinkBadge({ text, onWatch }: Props) {
  // text（解説文）に含まれているキーワードを探す
  const matchedEntries = Object.entries(KEYWORD_VIDEO_MAP).filter(([keyword]) => 
    text.includes(keyword)
  );

  if (matchedEntries.length === 0) return null;

  return (
    <div className="my-4 space-y-2">
      <div className="text-xs font-bold text-gray-500 uppercase flex items-center mb-1">
        <Video className="w-4 h-4 mr-1 text-indigo-500" />
        NotebookLM AI解説動画ピックアップ（タップで動画視聴）
      </div>
      <div className="grid grid-cols-1 gap-2">
        {matchedEntries.map(([keyword, info]) => (
          <a
            key={keyword}
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWatch && onWatch()}
            className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center space-x-3 truncate">
              <span className="bg-white/20 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg flex-shrink-0">
                {keyword}
              </span>
              <span className="font-bold text-sm truncate">
                {info.title}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 ml-2 opacity-80 group-hover:opacity-100 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
