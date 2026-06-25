export type Rarity = 'N' | 'R' | 'SR' | 'UR' | 'SEC';

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  color: string;
  icon: string;
  imageUrl?: string;
  backTitle?: string;
  backSubtitle?: string;
  backExplanation?: string;
  backPattern?: string;
}

export const GACHA_COST = 100; // 1回ガチャを回すのに必要なコイン

export const initialCards: Card[] = [
  // Normal (N)
  { id: 'n1', name: 'スライムくん', rarity: 'N', description: 'どこにでもいる普通のスライム。ぷにぷに。', color: 'from-blue-200 to-blue-300', icon: '💧' },
  { id: 'n2', name: '木の剣', rarity: 'N', description: '初心者用の木の剣。すこし重い。', color: 'from-amber-200 to-amber-300', icon: '🗡️' },
  { id: 'n3', name: '薬草', rarity: 'N', description: 'そこらへんに生えている草。食べると苦い。', color: 'from-green-200 to-green-300', icon: '🌿' },
  { id: 'n4', name: '銅の盾', rarity: 'N', description: '使い古された銅の盾。', color: 'from-orange-200 to-orange-300', icon: '🛡️' },
  { id: 'n5', name: 'コウモリ', rarity: 'N', description: '洞窟によくいる。夜行性。', color: 'from-purple-200 to-purple-300', icon: '🦇' },
  // Rare (R)
  { id: 'r1', name: '炎の魔法使い', rarity: 'R', description: 'メラメラと燃える炎をあやつる。', color: 'from-red-400 to-orange-500', icon: '🔥' },
  { id: 'r2', name: '銀のよろい', rarity: 'R', description: 'ピカピカに磨かれた美しい鎧。', color: 'from-slate-300 to-slate-400', icon: '👕' },
  { id: 'r3', name: 'ユニコーン', rarity: 'R', description: '一本角の幻獣。とても足が速い。', color: 'from-pink-300 to-purple-400', icon: '🦄' },
  { id: 'r4', name: '魔法の地図', rarity: 'R', description: '隠された宝の場所がわかるかも。', color: 'from-yellow-200 to-yellow-500', icon: '🗺️' },
  // Super Rare (SR)
  { id: 'sr1', name: '伝説の勇者', rarity: 'SR', description: '世界を救う運命にある若き勇者。', color: 'from-yellow-400 to-yellow-600', icon: '⚔️' },
  { id: 'sr2', name: '大魔神', rarity: 'SR', description: '大地をゆるがす巨大な魔神。', color: 'from-stone-600 to-stone-800', icon: '🗿' },
  { id: 'sr3', name: '黄金のドラゴン', rarity: 'SR', description: 'まばゆい光を放つ伝説のドラゴン。', color: 'from-yellow-500 to-orange-600', icon: '🐉' },
  // Ultra Rare (UR)
  { id: 'ur1', name: '星くずの剣', rarity: 'UR', description: '宇宙の星くずから作られた最強の剣。', color: 'from-indigo-500 via-purple-500 to-pink-500', icon: '✨' },
  { id: 'ur2', name: '光の女神', rarity: 'UR', description: 'すべてを癒やす慈愛の女神。', color: 'from-yellow-200 via-yellow-400 to-yellow-500', icon: '👼' },
  { id: 'ur3', name: '八雲紫 × オイラーの一筆書き定理', rarity: 'UR', description: '「境界を操る私にふさわしいのが、図形のつながりだけを見出す位相幾何学よ。」 一筆書きの定理を操る美しい大妖怪。', color: 'from-purple-900 via-violet-800 to-fuchsia-950', icon: '👁️', imageUrl: '/src/assets/images/yakumo_yukari_card_1782296737485.jpg' },
  // Secret (SEC)
  { id: 'sec1', name: 'お父さんの肩たたき券', rarity: 'SEC', description: 'お父さんの肩を10分間たたく権利！いつもありがとう！', color: 'from-red-500 via-yellow-500 to-blue-500', icon: '👨' },
  { id: 'sec2', name: '家族で焼肉に行く券', rarity: 'SEC', description: '週末に家族で焼肉に行ける最高の一枚！やったね！', color: 'from-red-600 via-red-500 to-orange-600', icon: '🍖' },
];

export const DEFAULT_GACHA_RATES: Record<Rarity, number> = {
  SEC: 1,
  UR: 5,
  SR: 14,
  R: 30,
  N: 50
};

export const drawGacha = (
  rates: Record<Rarity, number> | Record<string, number> = DEFAULT_GACHA_RATES,
  cardsList: Card[] = initialCards
): Card => {
  const rSEC = rates.SEC ?? DEFAULT_GACHA_RATES.SEC;
  const rUR = rates.UR ?? DEFAULT_GACHA_RATES.UR;
  const rSR = rates.SR ?? DEFAULT_GACHA_RATES.SR;
  const rR = rates.R ?? DEFAULT_GACHA_RATES.R;
  const rN = rates.N ?? DEFAULT_GACHA_RATES.N;

  const total = rSEC + rUR + rSR + rR + rN;
  const rand = Math.random() * total;
  
  let rarity: Rarity;
  let current = 0;
  
  if (rand < (current += rSEC)) {
    rarity = 'SEC';
  } else if (rand < (current += rUR)) {
    rarity = 'UR';
  } else if (rand < (current += rSR)) {
    rarity = 'SR';
  } else if (rand < (current += rR)) {
    rarity = 'R';
  } else {
    rarity = 'N';
  }

  const availableCards = cardsList.filter(c => c.rarity === rarity);
  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex] || cardsList[0] || initialCards[0];
};
