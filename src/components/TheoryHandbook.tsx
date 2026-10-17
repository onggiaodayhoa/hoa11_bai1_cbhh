import React, { useState } from 'react';
import { THEORY_SUMMARY } from '../data/curriculumData';
import { BookOpen, ChevronRight, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const TheoryHandbook: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nhanBiet' | 'thongHieu' | 'vanDung'>('nhanBiet');

  const handleTab = (tab: 'nhanBiet' | 'thongHieu' | 'vanDung') => {
    soundManager.playPop();
    setActiveTab(tab);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Tóm Tắt Lý Thuyết Cốt Lõi SGK Hoá Học 11
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cẩm nang tra cứu nhanh các định nghĩa, công thức Kc và quy luật Le Chatelier
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => handleTab('nhanBiet')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'nhanBiet'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhận Biết (Kc)
          </button>
          <button
            onClick={() => handleTab('thongHieu')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'thongHieu'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thông Hiểu (Thí Nghiệm)
          </button>
          <button
            onClick={() => handleTab('vanDung')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'vanDung'
                ? 'bg-white text-teal-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vận Dụng (Le Chatelier)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(THEORY_SUMMARY[activeTab] || []).map((item: { title: string; content: string }, idx: number) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs uppercase tracking-wide">
                <Bookmark className="w-3.5 h-3.5 text-teal-600" />
                <span>Mục {idx + 1}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
              <p className="text-xs text-slate-700 mt-2 whitespace-pre-line leading-relaxed">
                {item.content}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-formula">
              Chuẩn GDPT 2018 · Hoá học 11
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
