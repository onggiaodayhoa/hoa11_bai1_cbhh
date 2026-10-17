import React from 'react';
import { Volume2, VolumeX, Atom } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: 'exercises' | 'simulator' | 'theory') => void;
  onOpenProfile: () => void;
  onSubmitTest: () => void;
  hasSubmitted: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  scoreScale10?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  onOpenProfile,
  onSubmitTest,
  hasSubmitted,
  soundEnabled,
  onToggleSound,
  scoreScale10,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
            <Atom className="w-5 h-5 text-teal-200" />
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('exercises');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-teal-800 transition-colors"
          >
            Cân Bằng Hoá Học 11
          </a>
        </div>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('exercises')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors py-1 ${
              activeTab === 'exercises' ? 'text-teal-800 font-semibold border-b-2 border-teal-700' : ''
            }`}
          >
            Bài Tập Điền Khuyết
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors py-1 ${
              activeTab === 'simulator' ? 'text-teal-800 font-semibold border-b-2 border-teal-700' : ''
            }`}
          >
            Thí Nghiệm Ảo
          </button>
          <button
            onClick={() => onNavigate('theory')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors py-1 ${
              activeTab === 'theory' ? 'text-teal-800 font-semibold border-b-2 border-teal-700' : ''
            }`}
          >
            Lý Thuyết SGK
          </button>
          <button
            onClick={onOpenProfile}
            className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors py-1"
          >
            Hồ Sơ Học Sinh
          </button>
        </nav>

        {/* Zone 3: 1 primary action + sound toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onSubmitTest}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs ${
              hasSubmitted
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-teal-800 text-white hover:bg-teal-900'
            }`}
          >
            {hasSubmitted
              ? `Điểm: ${scoreScale10 !== undefined ? scoreScale10.toFixed(1) : ''}/10 (Xem Lại)`
              : 'Nộp Bài & Chấm Điểm'}
          </button>
        </div>
      </div>
    </header>
  );
};
