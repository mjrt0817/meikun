import React, { useState } from 'react';
import { Question, UserProgress, Subject } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { 
  ShieldAlert, ShieldCheck, Undo2, Award, TrendingUp, AlertTriangle, 
  Eye, EyeOff, Sparkles, BookOpen, CheckCircle2, XCircle, HelpCircle, Lock 
} from 'lucide-react';

interface Props {
  progress: UserProgress;
  questions: Question[];
  onBack: () => void;
  onUpdateProgress: (newProgress: UserProgress) => void;
}

interface CategoryStat {
  category: string;
  subject: Subject;
  total: number;
  answered: number;
  correct: number;
  accuracy: number; // 0 - 100
}

export default function ParentReportScreen({ progress, questions, onBack, onUpdateProgress }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'ALL'>('ALL');
  const answeredMap = progress.answeredQuestions || {};
  const showToChild = progress.showReportToChild ?? false;

  // カテゴリー（単元）ごとの集計
  const categoryStatsMap = new Map<string, CategoryStat>();

  questions.forEach(q => {
    const key = `${q.subject}___${q.category}`;
    if (!categoryStatsMap.has(key)) {
      categoryStatsMap.set(key, {
        category: q.category,
        subject: q.subject,
        total: 0,
        answered: 0,
        correct: 0,
        accuracy: 0
      });
    }
    const stat = categoryStatsMap.get(key)!;
    stat.total += 1;
    
    if (q.id in answeredMap) {
      stat.answered += 1;
      if (answeredMap[q.id] === true) {
        stat.correct += 1;
      }
    }
  });

  const allStats = Array.from(categoryStatsMap.values()).map(stat => ({
    ...stat,
    accuracy: stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0
  }));

  // 科目でフィルタリング
  const filteredStats = selectedSubject === 'ALL' 
    ? allStats 
    : allStats.filter(s => s.subject === selectedSubject);

  // 解答済みが1問以上ある単元で、正答率順にソート
  const activeStats = filteredStats.filter(s => s.answered > 0);
  const sortedByAccuracy = [...activeStats].sort((a, b) => b.accuracy - a.accuracy);

  // 強みベスト3（正答率70%以上などで上位）
  const strengths = sortedByAccuracy.slice(0, 3);
  // 弱みワースト3（正答率が低い下位3つ）
  const weaknesses = [...activeStats].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

  // 全体正答率
  const totalAnswered = Object.keys(answeredMap).length;
  const totalCorrect = Object.values(answeredMap).filter(v => v === true).length;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // 模擬試験データ
  const mockScores = progress.mockExamScores || [];
  const chartDataScores = [...mockScores].map((m, idx) => ({
    name: `${idx + 1}回目`,
    date: m.date.slice(5), // MM-DD
    scoreRate: Math.round((m.score / m.total) * 100),
    score: m.score,
    total: m.total
  }));

  const handleToggleShowToChild = () => {
    onUpdateProgress({
      ...progress,
      showReportToChild: !showToChild
    });
  };

  const getSubjectName = (sub: Subject) => sub === 'math' ? '算数' : '国語';
  const getSubjectBadge = (sub: Subject) => (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded ml-1.5 ${
      sub === 'math' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
    }`}>
      {getSubjectName(sub)}
    </span>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* 画面ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-900 font-extrabold bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition-all cursor-pointer text-sm"
          >
            <Undo2 className="w-4 h-4 mr-2" /> ホームへ戻る
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-black text-slate-800">学習分析レポート・強み弱み診断</h1>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-0.5">お子様のこれまでの学習データから得意単元と苦手単元を分析します</p>
          </div>
        </div>

        {/* 子どもへの表示トグル設定カード */}
        <div className={`flex items-center justify-between md:justify-start gap-4 p-4 rounded-2xl border transition-all ${
          showToChild 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            {showToChild ? (
              <Eye className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <EyeOff className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>子ども本人への画面表示</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  showToChild ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {showToChild ? '公開中（見える）' : '保護者専用（隠す）'}
                </span>
              </div>
              <p className="text-[11px] opacity-80 font-bold mt-0.5">
                {showToChild 
                  ? 'お子様のホーム画面にレポートボタンが表示されます' 
                  : '普段は非表示となり、保護者メニューから確認できます'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleShowToChild}
            className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors cursor-pointer focus:outline-none shrink-0 ${
              showToChild ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                showToChild ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* サマリー統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-black text-xl">
            📊
          </div>
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">全体の正答率</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{overallAccuracy}%</div>
            <div className="text-[11px] text-slate-400 font-bold mt-0.5">正解 {totalCorrect} / 解答 {totalAnswered}問</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 font-black text-xl">
            ✨
          </div>
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">最大の強み（得意単元）</div>
            <div className="text-lg font-black text-slate-800 mt-1 truncate max-w-[160px]">
              {strengths[0] ? strengths[0].category : 'データ未集計'}
            </div>
            <div className="text-[11px] text-emerald-600 font-black mt-0.5">
              {strengths[0] ? `正答率 ${strengths[0].accuracy}%` : '問題を解くと表示されます'}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 font-black text-xl">
            💡
          </div>
          <div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">最優先の克服課題（弱み）</div>
            <div className="text-lg font-black text-slate-800 mt-1 truncate max-w-[160px]">
              {weaknesses[0] ? weaknesses[0].category : 'データ未集計'}
            </div>
            <div className="text-[11px] text-amber-600 font-black mt-0.5">
              {weaknesses[0] ? `正答率 ${weaknesses[0].accuracy}%` : '問題を解くと表示されます'}
            </div>
          </div>
        </div>
      </div>

      {/* 科目選択タブ */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          単元別の診断詳細
        </h2>
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {(['ALL', 'math', 'japanese'] as const).map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sub === 'ALL' ? '全科目' : sub === 'math' ? '算数のみ' : '国語のみ'}
            </button>
          ))}
        </div>
      </div>

      {/* ハイライトパネル：強み vs 弱み */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 強みカード */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
          <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-yellow-300" />
            <h3 className="text-lg font-black tracking-tight">お子様の強みベスト3 ✨</h3>
          </div>
          <p className="text-xs opacity-90 font-bold mb-4">正答率が高く、しっかり定着している得意な単元です。</p>

          {strengths.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-6 text-center text-xs font-bold">まだ学習履歴がありません</div>
          ) : (
            <div className="space-y-3">
              {strengths.map((st, i) => (
                <div key={st.category} className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white text-teal-800 font-black text-xs flex items-center justify-center shrink-0 shadow">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-sm block">{st.category}</span>
                      <span className="text-[10px] opacity-85 font-bold">解答数: {st.answered}問 / 全{st.total}問中</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-yellow-300 block leading-none">{st.accuracy}%</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider">正答率</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 弱みカード */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
          <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
            <h3 className="text-lg font-black tracking-tight">重点克服のおすすめ単元 ⚠️</h3>
          </div>
          <p className="text-xs opacity-90 font-bold mb-4">つまずきやすく、少し復習を増やしてあげたい弱点単元です。</p>

          {weaknesses.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-6 text-center text-xs font-bold">まだ学習履歴がありません</div>
          ) : (
            <div className="space-y-3">
              {weaknesses.map((wk, i) => (
                <div key={wk.category} className="bg-white/15 backdrop-blur-sm p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white text-orange-800 font-black text-xs flex items-center justify-center shrink-0 shadow">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-sm block">{wk.category}</span>
                      <span className="text-[10px] opacity-85 font-bold">解答数: {wk.answered}問 / 全{wk.total}問中</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white block leading-none">{wk.accuracy}%</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider">正答率</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* カテゴリー別グラフセクション */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
          📊 単元別の正答率一覧グラフ（％）
        </h3>
        
        {filteredStats.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold text-sm">問題データがありません</div>
        ) : (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredStats} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                  unit="%"
                />
                <Tooltip 
                  formatter={(val: number) => [`${val}%`, '正答率']}
                  labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {filteredStats.map((entry, index) => {
                    let color = '#6366f1'; // Default Indigo
                    if (entry.answered === 0) color = '#cbd5e1'; // Slate gray for unanswered
                    else if (entry.accuracy >= 80) color = '#10b981'; // Emerald for strength
                    else if (entry.accuracy <= 40) color = '#f59e0b'; // Amber for weakness
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 text-xs font-extrabold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>得意単元（正答率80%以上）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <span>標準単元</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>弱点単元（正答率40%以下）</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
            <span>未挑戦</span>
          </div>
        </div>
      </div>

      {/* 全単元の詳細テーブルリスト */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800">📋 全単元の学習ステータス詳細</h3>
          <span className="text-xs font-bold text-slate-400">全{filteredStats.length}単元</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">科目 / 単元名</th>
                <th className="py-3 px-6 text-center">挑戦問題数</th>
                <th className="py-3 px-6 text-center">正解数</th>
                <th className="py-3 px-6 text-right">正答率</th>
                <th className="py-3 px-6 text-center">診断ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {filteredStats.map(stat => {
                let statusBadge = <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[10px]">未学習</span>;
                if (stat.answered > 0) {
                  if (stat.accuracy >= 80) statusBadge = <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] flex items-center justify-center gap-1 w-fit mx-auto"><CheckCircle2 className="w-3 h-3"/> 得意 ✨</span>;
                  else if (stat.accuracy <= 40) statusBadge = <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] flex items-center justify-center gap-1 w-fit mx-auto"><AlertTriangle className="w-3 h-3"/> 要復習 ⚠️</span>;
                  else statusBadge = <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] block w-fit mx-auto">順調 👍</span>;
                }

                return (
                  <tr key={`${stat.subject}___${stat.category}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-black text-slate-800">
                      {stat.category}
                      {getSubjectBadge(stat.subject)}
                    </td>
                    <td className="py-4 px-6 text-center font-mono">{stat.answered} / {stat.total}</td>
                    <td className="py-4 px-6 text-center font-mono text-emerald-600">{stat.correct}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full ${stat.accuracy >= 80 ? 'bg-emerald-500' : stat.accuracy <= 40 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            style={{ width: `${stat.accuracy}%` }}
                          />
                        </div>
                        <span className="font-black text-sm w-9">{stat.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模擬試験スコア推移グラフ */}
      {chartDataScores.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
            📈 模擬試験の得点率推移（％）
          </h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataScores} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} unit="%" />
                <Tooltip 
                  formatter={(val: number) => [`${val}%`, '得点率']}
                  labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="scoreRate" 
                  name="模試得点率 (%)" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
