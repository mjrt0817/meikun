import React from 'react';
import { loginWithGoogle } from '../lib/firebase';
import { BookOpen, UserCircle } from 'lucide-react';

interface Props {
  onContinueAsGuest: () => void;
}

export default function LoginScreen({ onContinueAsGuest }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-3">新潟明訓中学<br/>受験対策アプリ</h1>
          <p className="text-gray-500 font-medium">スマホやタブレットでデータを共有するには、Googleアカウントでログインしてね！</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="Google" />
            Googleでログイン
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 font-medium text-sm">または</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={onContinueAsGuest}
            className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95"
          >
            <UserCircle className="w-6 h-6 mr-2 text-gray-500" />
            ログインせずに使う
          </button>
        </div>
        
        <p className="text-xs text-center text-gray-400 mt-6">
          「ログインせずに使う」を選ぶと、この端末にだけデータが保存されます。
        </p>
      </div>
    </div>
  );
}
