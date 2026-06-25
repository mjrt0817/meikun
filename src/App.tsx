import React, { useState, useEffect } from 'react';
import { Subject, ViewState, UserProgress } from './types';
import { questions } from './data';
import { loadProgress as loadLocalProgress, saveProgress as saveLocalProgress } from './utils/storage';
import type { User } from 'firebase/auth';
import PracticeSession from './components/PracticeSession';
import ReviewSession from './components/ReviewSession';
import MockExamSession from './components/MockExamSession';
import LoginScreen from './components/LoginScreen';
import GachaScreen from './components/GachaScreen';
import AlbumScreen from './components/AlbumScreen';
import CardBackPattern from './components/CardBackPattern';
import { DEFAULT_GACHA_RATES, Rarity, Card, initialCards } from './cards';
import { BookOpen, Calculator, PlayCircle, RefreshCw, Award, Home, Brain, Target, ChevronRight, LogOut, Loader2, Sparkles, Image, Coins, Plus, Trash2 } from 'lucide-react';
import { auth, subscribeToAuth, loadProgress as loadFirebaseProgress, saveProgress as saveFirebaseProgress, logout, loadCards, saveCard, removeCard } from './lib/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [viewState, setViewState] = useState<ViewState>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [progress, setProgress] = useState<UserProgress>({
    answeredQuestions: {},
    reviewList: [],
    mockExamScores: []
  });
  const [showSettings, setShowSettings] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [cardsList, setCardsList] = useState<Card[]>(initialCards);

  // Custom Card Form States
  const [newCardId, setNewCardId] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardRarity, setNewCardRarity] = useState<Rarity>('N');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardColor, setNewCardColor] = useState('from-blue-200 to-blue-300');
  const [newCardIcon, setNewCardIcon] = useState('🃏');
  const [newCardImageUrl, setNewCardImageUrl] = useState('');
  
  // Custom Card Back States
  const [newCardBackTitle, setNewCardBackTitle] = useState('');
  const [newCardBackSubtitle, setNewCardBackSubtitle] = useState('');
  const [newCardBackExplanation, setNewCardBackExplanation] = useState('');
  const [newCardBackPattern, setNewCardBackPattern] = useState('minimalist');
  const [imageSource, setImageSource] = useState<'upload' | 'preset'>('preset');
  const [previewFlipped, setPreviewFlipped] = useState(false);

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('カードを登録するには、Googleアカウントでログインする必要があります（ゲストモードでは保存できません）。');
      return;
    }
    if (!newCardName.trim()) {
      alert('カード名を入力してください。');
      return;
    }
    
    const cardId = newCardId.trim() || `custom_${Date.now()}`;
    
    if (cardsList.some(c => c.id === cardId)) {
      alert('そのカードIDはすでに存在します。');
      return;
    }

    const finalBackTitle = newCardBackTitle.trim() || newCardName.trim();
    const finalBackExplanation = newCardBackExplanation.trim() || newCardDescription.trim() || '説明はありません。';
    const finalBackSubtitle = newCardBackSubtitle.trim() || `${newCardRarity} Rank Card`;

    const newCard: Card = {
      id: cardId,
      name: newCardName.trim(),
      rarity: newCardRarity,
      description: finalBackExplanation, // fallback
      color: newCardColor,
      icon: newCardIcon.trim() || '🃏',
      imageUrl: newCardImageUrl.trim() || undefined,
      backTitle: finalBackTitle,
      backSubtitle: finalBackSubtitle,
      backExplanation: finalBackExplanation,
      backPattern: newCardBackPattern
    };

    try {
      await saveCard(newCard);
      const updatedList = await loadCards();
      setCardsList(updatedList);
      
      setNewCardId('');
      setNewCardName('');
      setNewCardDescription('');
      setNewCardColor('from-blue-200 to-blue-300');
      setNewCardIcon('🃏');
      setNewCardImageUrl('');
      setNewCardBackTitle('');
      setNewCardBackSubtitle('');
      setNewCardBackExplanation('');
      setNewCardBackPattern('minimalist');
      setImageSource('preset');
      alert('新しいカードを追加しました！');
    } catch (err) {
      console.error(err);
      alert('カードの追加に失敗しました。');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentUser) {
      alert('カードを削除するには、Googleアカウントでログインする必要があります（ゲストモードでは削除できません）。');
      return;
    }
    if (!window.confirm('本当にこのカードを削除しますか？ガチャや図鑑からも消去されます。')) return;
    try {
      await removeCard(cardId);
      const updatedList = await loadCards();
      setCardsList(updatedList);
      alert('カードを削除しました。');
    } catch (err) {
      console.error(err);
      alert('カードの削除に失敗しました。');
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setGuestMode(false); // Auth exists, disable guest mode
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If auth state is determined
    if (!authLoading) {
      if (currentUser) {
        // Load from Firebase
        setDataLoading(true);
        loadFirebaseProgress(currentUser.uid).then(prog => {
          setProgress(prog);
          setDataLoading(false);
        });
      } else if (guestMode) {
        // Load from local storage
        setProgress(loadLocalProgress());
      }
    }
  }, [currentUser, authLoading, guestMode]);

  useEffect(() => {
    // Load dynamic cards list from Firestore
    loadCards().then(list => {
      setCardsList(list);
    }).catch(err => {
      console.error("Failed to load cards, falling back to initial cards", err);
    });
  }, [currentUser]);

  const handleUpdateProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    if (currentUser) {
      saveFirebaseProgress(currentUser.uid, newProgress);
    } else if (guestMode) {
      saveLocalProgress(newProgress);
    }
  };

  const handleLogout = async () => {
    await logout();
    setGuestMode(false);
    setProgress({ answeredQuestions: {}, reviewList: [], mockExamScores: [] });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Show login screen if no user and not in guest mode
  if (!currentUser && !guestMode) {
    return <LoginScreen onContinueAsGuest={() => setGuestMode(true)} />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">データを読み込み中...</p>
      </div>
    );
  }

  const renderHome = () => {
    const mathCount = questions.filter(q => q.subject === 'math').length;
    const jaCount = questions.filter(q => q.subject === 'japanese').length;
    
    // Recent mock exam score
    const recentScores = [...progress.mockExamScores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestScore = recentScores[0];

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header/Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              新潟明訓中学<br className="sm:hidden" /> 受験対策アプリ
            </h1>
            <p className="text-blue-100 text-lg max-w-xl font-medium leading-relaxed">
              小学5年生向けの公式傾向に合わせた学習アプリです。何度も練習して本番にそなえよう！
            </p>
          </div>
          <Award className="absolute -bottom-6 -right-6 w-48 h-48 text-white opacity-10" />
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Subject: Math */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                <Calculator className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">算数（さんすう）</h2>
                <p className="text-sm font-medium text-gray-500">収録問題: {mathCount}問</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => { setSelectedSubject('math'); setViewState('practice'); }}
                className="w-full flex items-center justify-between bg-orange-50 hover:bg-orange-100 text-orange-800 p-4 rounded-xl font-bold transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <PlayCircle className="w-6 h-6 mr-3 text-orange-500" />
                  練習問題を解く
                </div>
                <ChevronRight className="w-5 h-5 text-orange-400" />
              </button>
              <button
                onClick={() => { setSelectedSubject('math'); setViewState('mock-exam'); }}
                className="w-full flex items-center justify-between bg-white border-2 border-orange-100 hover:border-orange-200 text-gray-700 p-4 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <Target className="w-6 h-6 mr-3 text-gray-400" />
                  模擬試験（タイマーあり）
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Subject: Japanese */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">国語（こくご）</h2>
                <p className="text-sm font-medium text-gray-500">収録問題: {jaCount}問</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => { setSelectedSubject('japanese'); setViewState('practice'); }}
                className="w-full flex items-center justify-between bg-emerald-50 hover:bg-emerald-100 text-emerald-800 p-4 rounded-xl font-bold transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <PlayCircle className="w-6 h-6 mr-3 text-emerald-500" />
                  練習問題を解く
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </button>
              <button
                onClick={() => { setSelectedSubject('japanese'); setViewState('mock-exam'); }}
                className="w-full flex items-center justify-between bg-white border-2 border-emerald-100 hover:border-emerald-200 text-gray-700 p-4 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <Target className="w-6 h-6 mr-3 text-gray-400" />
                  模擬試験（タイマーあり）
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
          
          {/* Gacha Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">カードガチャ</h2>
                <p className="text-sm font-medium text-gray-500">所持コイン: {progress.coins || 0}🪙</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setViewState('gacha')}
                className="w-full flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 text-yellow-800 p-4 rounded-xl font-bold transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <Coins className="w-6 h-6 mr-3 text-yellow-500" />
                  ガチャを回す
                </div>
                <ChevronRight className="w-5 h-5 text-yellow-500" />
              </button>
              <button
                onClick={() => setViewState('album')}
                className="w-full flex items-center justify-between bg-white border-2 border-yellow-100 hover:border-yellow-200 text-gray-700 p-4 rounded-xl font-bold transition-all active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <Image className="w-6 h-6 mr-3 text-yellow-400" />
                  カード図鑑を見る
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic lower section: Review / Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-3xl p-6 sm:p-8 border border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-2 flex items-center">
              <RefreshCw className="w-6 h-6 mr-2" />
              復習リスト
            </h3>
            <p className="text-purple-700 mb-6 font-medium text-sm">
              まちがえた問題が自動でここに入ります。完璧になるまで何度もチャレンジしよう！
            </p>
            {progress.reviewList.length > 0 ? (
              <button
                onClick={() => setViewState('review')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow transition-all active:scale-[0.98] flex items-center justify-center text-lg"
              >
                復習スタート（残り {progress.reviewList.length} 問）
              </button>
            ) : (
              <div className="bg-white/60 rounded-xl p-4 text-center text-purple-600 font-bold border border-purple-200 border-dashed">
                復習する問題は今ゼロ！すごい！🎉
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-gray-500" />
              最近の成績
            </h3>
            {latestScore ? (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-600 text-sm">最新の模擬試験 ({latestScore.subject === 'math' ? '算数' : '国語'})</span>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {new Date(latestScore.date).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="flex items-end">
                  <span className="text-4xl font-black text-gray-800">{Math.round((latestScore.score / latestScore.total) * 100)}</span>
                  <span className="text-xl font-bold text-gray-500 mb-1 ml-1">点</span>
                  <span className="ml-auto text-sm font-medium text-gray-500">
                    {latestScore.score} / {latestScore.total} 満点
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-5 text-center text-gray-500 font-medium text-sm border border-gray-100">
                まだ受験のきろくがありません。<br/>模擬試験にチャレンジしてみよう！
              </div>
            )}
          </div>
        </div>

        {/* Settings / Debug Section */}
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200 mt-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">設定・デバッグ</h3>
          {!showSettings ? (
            <div className="flex items-center space-x-2">
              <input
                type="password"
                placeholder="パスワード(4桁)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="border-2 border-gray-200 focus:border-gray-400 focus:ring-0 rounded-xl p-2 w-40 text-sm font-bold bg-white"
              />
              <button
                onClick={() => {
                  if (passwordInput === '6431') {
                    setShowSettings(true);
                    setPasswordInput('');
                  } else {
                    alert('パスワードが間違っています。');
                  }
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer"
              >
                ロック解除
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-green-600 font-bold">✓ ロック解除済み</p>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-sm text-gray-500 underline hover:text-gray-800 cursor-pointer"
                >
                  ロックする
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => {
                    handleUpdateProgress({
                      ...progress,
                      coins: (progress.coins || 0) + 1000
                    });
                    alert('1000コイン追加しました！');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
                >
                  テストモード (+1000コイン)
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('集めたカードをすべてリセットしますか？')) {
                      handleUpdateProgress({
                        ...progress,
                        unlockedCards: []
                      });
                      alert('カードをリセットしました。');
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
                >
                  カードをリセット
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('学習履歴（正解状況・復習リスト・模試成績・コイン）をすべてリセットしますか？')) {
                      handleUpdateProgress({
                        answeredQuestions: {},
                        reviewList: [],
                        mockExamScores: [],
                        coins: 0,
                        unlockedCards: [],
                        gachaRates: DEFAULT_GACHA_RATES
                      });
                      alert('学習履歴をリセットしました。');
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-colors text-sm cursor-pointer"
                >
                  学習履歴をリセット
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  ガチャの排出率設定 (%)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {(['N', 'R', 'SR', 'UR', 'SEC'] as Rarity[]).map((r) => (
                    <div key={r} className="flex flex-col">
                      <label className="text-xs font-bold text-gray-500 mb-1">{r}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progress.gachaRates?.[r] ?? DEFAULT_GACHA_RATES[r]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          handleUpdateProgress({
                            ...progress,
                            gachaRates: {
                              ...(progress.gachaRates || DEFAULT_GACHA_RATES),
                              [r]: val
                            }
                          });
                        }}
                        className="border-2 border-gray-200 focus:border-yellow-400 focus:ring-0 rounded-xl p-2 text-sm text-gray-700 font-bold w-full transition-colors"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-400 mt-3 bg-gray-50 p-2 rounded-lg inline-block">
                  ※ 合計が100%にならなくても、入力された比率で自動計算されます。
                </p>
              </div>

              {/* カード管理 (追加・削除) */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mt-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-indigo-500" />
                  カード管理（追加・削除）
                </h4>

                {/* 新規追加フォーム (表面・裏面の見直し) */}
                <form onSubmit={handleAddCardSubmit} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h5 className="text-base font-extrabold text-slate-800 flex items-center mb-4 border-b border-slate-200 pb-2">
                    <Plus className="w-5 h-5 mr-1 text-green-500" />
                    新規カードの登録・デザイン
                  </h5>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 左側：入力パネル */}
                    <div className="lg:col-span-8 space-y-5">
                      
                      {/* 基本設定 */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                        <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">基本情報</h6>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">カードID (自動生成は空欄)</label>
                            <input
                              type="text"
                              placeholder="例: custom_yakumo"
                              value={newCardId}
                              onChange={(e) => setNewCardId(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">カード名</label>
                            <input
                              type="text"
                              placeholder="例: 八雲紫"
                              value={newCardName}
                              onChange={(e) => setNewCardName(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">レアリティ</label>
                            <select
                              value={newCardRarity}
                              onChange={(e) => setNewCardRarity(e.target.value as Rarity)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold bg-white cursor-pointer"
                            >
                              <option value="N">Normal (N)</option>
                              <option value="R">Rare (R)</option>
                              <option value="SR">Super Rare (SR)</option>
                              <option value="UR">Ultra Rare (UR)</option>
                              <option value="SEC">Secret (SEC)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">絵文字アイコン (画像がない時のフォールバック)</label>
                            <input
                              type="text"
                              placeholder="例: 🔮"
                              value={newCardIcon}
                              onChange={(e) => setNewCardIcon(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">背景色グラデーション (画像がない時の背景)</label>
                            <input
                              type="text"
                              placeholder="from-purple-900 via-violet-800 to-fuchsia-950"
                              value={newCardColor}
                              onChange={(e) => setNewCardColor(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 表面設定 (画像登録) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest">表面の設定 (カードイラスト)</h6>
                          <div className="flex space-x-1.5 bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => {
                                setImageSource('preset');
                                setNewCardImageUrl('/src/assets/images/yakumo_yukari_card_1782296737485.jpg');
                              }}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                imageSource === 'preset' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              プリセット
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setImageSource('upload');
                                setNewCardImageUrl('');
                              }}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                imageSource === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              アップロード
                            </button>
                          </div>
                        </div>

                        {imageSource === 'preset' ? (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500">画像選択 (プリセット)</label>
                            <select
                              value={newCardImageUrl}
                              onChange={(e) => setNewCardImageUrl(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold bg-white"
                            >
                              <option value="/src/assets/images/yakumo_yukari_card_1782296737485.jpg">
                                八雲紫 UR (オイラーの一筆書き定理カードイラスト)
                              </option>
                              <option value="">画像なし (カラー &amp; アイコン)</option>
                            </select>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              ※ アップロード済みの八雲紫のカードイラストをそのまま表面画像として使用します。
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-gray-500">画像ファイル選択</label>
                            <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100/70 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                  <Plus className="w-6 h-6 text-slate-400 mb-1" />
                                  <p className="text-xs text-slate-500 font-bold">クリックして画像を選択</p>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">PNG, JPG (推奨比率 3:4, 3MB以下)</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 3 * 1024 * 1024) {
                                        alert('画像サイズは3MB未満にしてください。');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setNewCardImageUrl(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 裏面設定 (デザインパターン & 解説) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                        <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">裏面の設定 (デザインパターン &amp; 解説文)</h6>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">裏面デザインパターン</label>
                            <select
                              value={newCardBackPattern}
                              onChange={(e) => setNewCardBackPattern(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold bg-white cursor-pointer"
                            >
                              <option value="minimalist">ミニマル・クリーン (すっきり読みやすい)</option>
                              <option value="academic">アカデミック (クラシックな書物風)</option>
                              <option value="cyber">サイバー・フューチャー (ネオン輝く近未来SF)</option>
                              <option value="fantasy">ファンタジー・ゴールド (神話・伝説の金縁)</option>
                              <option value="japanese">和風モダン (幻想的な紫和風模様)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">裏面タイトル (空欄時はカード名)</label>
                            <input
                              type="text"
                              placeholder="例: 八雲紫"
                              value={newCardBackTitle}
                              onChange={(e) => setNewCardBackTitle(e.target.value)}
                              className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-bold text-gray-500 mb-1">裏面肩書き / サブタイトル (任意)</label>
                          <input
                            type="text"
                            placeholder="例: オイラーの一筆書き定理 (トポロジー)"
                            value={newCardBackSubtitle}
                            onChange={(e) => setNewCardBackSubtitle(e.target.value)}
                            className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 text-xs w-full font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">裏面詳細解説文 (文字が見やすく調整されます)</label>
                          <textarea
                            placeholder="境界を操る私にふさわしい幾何が、図形のつながりだけ見る位相幾何学。交点に集まる線の数が「奇数」である点が、0個か2個の時だけ一筆書きができるが、難関の幾何よ。"
                            value={newCardBackExplanation}
                            onChange={(e) => setNewCardBackExplanation(e.target.value)}
                            className="border border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-lg p-2.5 text-xs w-full font-semibold h-24 resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all text-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                      >
                        このカードをデータベースに登録する！
                      </button>

                    </div>

                    {/* 右側：3D ライブプレビュー */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                      <div className="sticky top-20 w-full flex flex-col items-center space-y-4">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                          仕上がりプレビュー (3D反転)
                        </div>

                        {/* プレビューカード本体 */}
                        <div 
                          className="relative w-56 h-72 cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
                          style={{ perspective: '1000px' }}
                          onClick={() => setPreviewFlipped(prev => !prev)}
                        >
                          <div
                            className="w-full h-full relative transition-transform duration-500"
                            style={{
                              transformStyle: 'preserve-3d',
                              WebkitTransformStyle: 'preserve-3d',
                              transform: previewFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              WebkitTransform: previewFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            }}
                          >
                            {/* Front Preview */}
                            <div
                              className={`absolute inset-0 rounded-2xl shadow-xl flex flex-col overflow-hidden text-white border border-slate-200 ${
                                newCardImageUrl ? '' : `bg-gradient-to-br ${newCardColor} p-4 items-center justify-center`
                              }`}
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(0deg)',
                                WebkitTransform: 'rotateY(0deg)',
                              }}
                            >
                              {newCardImageUrl ? (
                                <div className="w-full h-full relative">
                                  <img
                                    src={newCardImageUrl}
                                    alt={newCardName || 'Preview'}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-white/10">
                                    {newCardRarity}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="absolute top-3 left-3 bg-white/30 backdrop-blur-sm text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                                    {newCardRarity}
                                  </div>
                                  <div className="text-5xl mb-4">{newCardIcon}</div>
                                  <h3 className="text-sm font-black text-center leading-tight mb-2 drop-shadow-sm">{newCardName || 'カード名未入力'}</h3>
                                </>
                              )}
                            </div>

                            {/* Back Preview */}
                            <div
                              className="absolute inset-0 rounded-2xl shadow-xl overflow-hidden"
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                WebkitTransform: 'rotateY(180deg)',
                              }}
                            >
                              <CardBackPattern
                                card={{
                                  id: newCardId || 'PREVIEW',
                                  name: newCardName || 'カード名未入力',
                                  rarity: newCardRarity,
                                  description: newCardBackExplanation || newCardDescription || '説明解説がここに表示されます。',
                                  color: newCardColor,
                                  icon: newCardIcon,
                                  imageUrl: newCardImageUrl || undefined,
                                  backTitle: newCardBackTitle || newCardName || undefined,
                                  backSubtitle: newCardBackSubtitle || undefined,
                                  backExplanation: newCardBackExplanation || undefined,
                                  backPattern: newCardBackPattern
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 操作説明 */}
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setPreviewFlipped(prev => !prev)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs py-1.5 px-4 rounded-full border border-indigo-200 transition-colors shadow-sm cursor-pointer inline-flex items-center"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1 text-indigo-600 animate-spin-slow" />
                            プレビューを裏返す
                          </button>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-normal">
                            ※ カードをクリックするか、上のボタンで<br />
                            表面（画像）と裏面（解説）を切り替えられます。
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                </form>

                {/* 現在のカード一覧 */}
                <h5 className="text-sm font-bold text-gray-700 mb-2">登録されているカード一覧 ({cardsList.length})</h5>
                <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                  {cardsList.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{card.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-gray-800">{card.name}</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white ${
                              card.rarity === 'SEC' ? 'bg-red-500' :
                              card.rarity === 'UR' ? 'bg-purple-600' :
                              card.rarity === 'SR' ? 'bg-yellow-500 text-gray-900' :
                              card.rarity === 'R' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}>
                              {card.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium truncate max-w-xs sm:max-w-md">{card.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="このカードを削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 pb-20 selection:bg-blue-200">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center font-bold text-lg text-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setViewState('home')}
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2 text-sm">明</span>
            明訓アプリ
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {viewState !== 'home' && (
              <button
                onClick={() => setViewState('home')}
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <Home className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">ホームへ戻る</span>
              </button>
            )}

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 font-medium text-sm bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded">ゲスト</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 mt-4">
        {viewState === 'home' && renderHome()}
        
        {viewState === 'gacha' && (
          <div className="animate-in slide-in-from-right duration-300">
            <GachaScreen
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              onBack={() => setViewState('home')}
              cardsList={cardsList}
            />
          </div>
        )}

        {viewState === 'album' && (
          <div className="animate-in slide-in-from-right duration-300">
            <AlbumScreen
              progress={progress}
              onBack={() => setViewState('home')}
              cardsList={cardsList}
            />
          </div>
        )}

        {viewState === 'practice' && (
          <div className="animate-in slide-in-from-right duration-300">
            <PracticeSession
              questions={questions}
              subject={selectedSubject}
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              onFinish={() => setViewState('home')}
            />
          </div>
        )}
        
        {viewState === 'review' && (
          <div className="animate-in slide-in-from-bottom duration-300">
            <ReviewSession
              questions={questions}
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              onFinish={() => setViewState('home')}
            />
          </div>
        )}
        
        {viewState === 'mock-exam' && (
          <div className="animate-in zoom-in-95 duration-300">
            <MockExamSession
              questions={questions}
              subject={selectedSubject}
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              onFinish={() => setViewState('home')}
            />
          </div>
        )}
      </main>

    </div>
  );
}

