import React, { useState, useRef } from 'react';
import { UserProgress, Question, Subject } from '../types';
import { parseQuestionsCSV } from '../utils/csvParser';
import { Upload, FileSpreadsheet, Plus, AlertCircle, Trash2, Check, Download } from 'lucide-react';

interface Props {
  progress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
}

export default function CsvQuestionManager({ progress, onUpdateProgress }: Props) {
  const [csvText, setCsvText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customList = progress.customQuestions || [];

  // CSV template string for easy copy-pasting
  const csvTemplate = `教科,カテゴリ,問題文,選択肢1,選択肢2,選択肢3,選択肢4,正解番号(1-4),解説,ヒント
算数,計算,8 × 7 - 12 はいくつですか？,34,44,54,24,2,かけ算を先に計算します。 56 - 12 = 44 です。,8 × 7 = 56 です。
国語,ことわざ,「弘法筆を（　）」に入る正しい言葉はどれですか？,選ばず,洗わず,飾らず,落とさず,1,「弘法筆を選ばず」は、実力がある人は道具の良し悪しに関わらず素晴らしい成果を出せるという意味です。,有名なことわざです。`;

  const handleParse = (textToParse: string) => {
    try {
      setParseError(null);
      const parsed = parseQuestionsCSV(textToParse);
      if (parsed.length === 0) {
        setParseError('有効な問題が検出されませんでした。フォーマットを確認してください。');
        setPreviewQuestions([]);
      } else {
        setPreviewQuestions(parsed);
      }
    } catch (err) {
      setParseError('CSVの解析に失敗しました。カンマやクォーテーションの位置を確認してください。');
      setPreviewQuestions([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      handleParse(text);
    };
    reader.onerror = () => {
      setParseError('ファイルの読み込みに失敗しました。');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleAddPreviewQuestions = () => {
    if (previewQuestions.length === 0) return;
    
    const newProgress = { ...progress };
    newProgress.customQuestions = [
      ...customList,
      ...previewQuestions
    ];
    
    onUpdateProgress(newProgress);
    setPreviewQuestions([]);
    setCsvText('');
    alert(`${previewQuestions.length}問の問題を追加しました！`);
  };

  const handleDeleteCustomQuestion = (id: string) => {
    if (!window.confirm('この問題を削除しますか？')) return;
    const newProgress = { ...progress };
    newProgress.customQuestions = customList.filter(q => q.id !== id);
    // Also remove from review lists if needed
    newProgress.reviewList = (newProgress.reviewList || []).filter(qid => qid !== id);
    if (newProgress.reviewSchedules) {
      delete newProgress.reviewSchedules[id];
    }
    onUpdateProgress(newProgress);
  };

  const downloadTemplate = () => {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "meikun_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 mt-6 animate-in fade-in duration-300">
      <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
        <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
        国語・算数 CSV問題インポート
      </h4>

      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        新潟明訓中受験用の国語や算数の問題を、エクセルやスプレッドシートで作ったCSVファイルから一括で追加できます。
      </p>

      {/* Grid for template & file uploader */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Template Information */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <h5 className="font-bold text-gray-800 text-sm mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 text-blue-500" />
              CSVファイルの書き方
            </h5>
            <ul className="text-xs text-gray-600 space-y-2 leading-relaxed list-disc list-inside mb-4">
              <li>1列目: <strong>国語</strong> または <strong>算数</strong></li>
              <li>2列目: 分類カテゴリ（例: 四字熟語、分数）</li>
              <li>3列目: 問題文（改行も含められます）</li>
              <li>4〜7列目: 選択肢1〜選択肢4</li>
              <li>8列目: 正解の番号（1から4までの半角数字）</li>
              <li>9列目: 解説の文章</li>
              <li>10列目: ヒント（未入力でもOK）</li>
            </ul>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer w-full"
          >
            <Download className="w-4 h-4 mr-1.5" />
            サンプルCSVをダウンロード
          </button>
        </div>

        {/* Drag and Drop Uploader */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
            dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-10 h-10 text-gray-400 mb-3 animate-bounce" />
          <p className="text-sm font-bold text-gray-700 mb-1">CSVファイルをドラッグ＆ドロップ</p>
          <p className="text-xs text-gray-400">または クリックしてファイルを選択</p>
          <p className="text-[10px] text-gray-400 mt-2">※ UTF-8形式のCSVを推奨します</p>
        </div>
      </div>

      {/* Manual CSV input Textarea */}
      <div className="mb-6">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">または CSVテキストを直接貼り付け</label>
        <textarea
          rows={5}
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            if (e.target.value.trim()) {
              handleParse(e.target.value);
            } else {
              setPreviewQuestions([]);
              setParseError(null);
            }
          }}
          placeholder="教科,カテゴリ,問題文,選択肢1,選択肢2..."
          className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all leading-relaxed"
        />
      </div>

      {/* Parser Messages & Preview */}
      {parseError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-center text-sm font-bold animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500" />
          {parseError}
        </div>
      )}

      {previewQuestions.length > 0 && (
        <div className="mb-8 p-5 bg-green-50/50 border border-green-100 rounded-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-extrabold text-green-900 text-sm flex items-center">
              <Check className="w-4 h-4 mr-1.5 bg-green-200 text-green-800 rounded-full p-0.5" />
              インポートプレビュー（{previewQuestions.length}問 検出）
            </h5>
            <button
              onClick={handleAddPreviewQuestions}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              この内容で追加する
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border border-green-200/50 rounded-xl bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-green-50 text-green-800 font-bold border-b border-green-100">
                  <th className="p-2.5 w-16 text-center">教科</th>
                  <th className="p-2.5 w-24">カテゴリ</th>
                  <th className="p-2.5">問題文</th>
                  <th className="p-2.5 w-16 text-center">正解</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewQuestions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${q.subject === 'math' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {q.subject === 'math' ? '算数' : '国語'}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-gray-500">{q.category}</td>
                    <td className="p-2.5 font-medium text-gray-700 truncate max-w-xs">{q.text}</td>
                    <td className="p-2.5 text-center font-black text-green-600">{q.correctAnswerIndex + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Currently Added Custom Questions List */}
      <div>
        <h5 className="font-extrabold text-gray-800 text-sm mb-3">登録済みの追加問題（{customList.length}問）</h5>
        {customList.length === 0 ? (
          <p className="text-xs text-gray-400 bg-slate-50 rounded-xl p-4 text-center border border-slate-100 border-dashed">
            追加された問題はありません。CSVから問題を取り込んでみましょう！
          </p>
        ) : (
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-slate-50 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50 text-gray-600 font-bold border-b border-gray-100">
                  <th className="p-3 w-16 text-center">教科</th>
                  <th className="p-3 w-28">カテゴリ</th>
                  <th className="p-3">問題</th>
                  <th className="p-3 w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customList.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${q.subject === 'math' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {q.subject === 'math' ? '算数' : '国語'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-500 truncate max-w-[100px]">{q.category}</td>
                    <td className="p-3 font-medium text-gray-800 truncate max-w-[200px]">{q.text}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteCustomQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
