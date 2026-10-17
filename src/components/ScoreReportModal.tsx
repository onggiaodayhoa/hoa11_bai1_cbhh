import React from 'react';
import { TestSubmission } from '../types/chemistry';
import { Award, CheckCircle2, XCircle, Printer, RotateCcw, BookOpen, Clock, User, School } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';

interface ScoreReportModalProps {
  submission: TestSubmission;
  isOpen: boolean;
  onClose: () => void;
  onRetake: () => void;
}

export const ScoreReportModal: React.FC<ScoreReportModalProps> = ({
  submission,
  isOpen,
  onClose,
  onRetake,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    soundManager.playPop();
    window.print();
  };

  const minutes = Math.floor(submission.durationSeconds / 60);
  const seconds = submission.durationSeconds % 60;
  const timeFormatted = `${minutes} phút ${seconds < 10 ? '0' : ''}${seconds} giây`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 card-print">
        {/* Printable Scorecard Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Phiếu Đánh Giá Kết Quả Học Tập Môn Hoá Học 11</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                Chuyên Đề: Cân Bằng Hoá Học
              </h2>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Học sinh: <strong className="text-white">{submission.student.fullName}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Lớp: <strong className="text-white">{submission.student.classGroup}</strong></span>
                <span aria-hidden="true">·</span>
                <span>SBD: <strong className="text-white">{submission.student.studentId}</strong></span>
                <span aria-hidden="true">·</span>
                <span>{submission.student.schoolName}</span>
              </div>
            </div>

            {/* Score Big Display */}
            <div className="bg-teal-700/80 border border-teal-500/40 rounded-xl px-5 py-3 text-center shrink-0">
              <div className="text-[11px] text-teal-200 uppercase font-semibold">Điểm số (Thang 10)</div>
              <div className="text-4xl font-extrabold text-white tracking-tight font-formula">
                {submission.scoreScale10.toFixed(1)}
              </div>
              <div className="text-xs text-teal-200 font-medium">
                {submission.totalCorrect}/{submission.totalBlanks} ô đúng ({submission.scoreScale100}%)
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Rank Badge & Teacher Pedagogy Feedback */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Xếp loại năng lực
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-base font-extrabold px-3 py-1 rounded-md ${
                  submission.scoreScale10 >= 9.0
                    ? 'bg-emerald-100 text-emerald-800'
                    : submission.scoreScale10 >= 8.0
                    ? 'bg-teal-100 text-teal-800'
                    : submission.scoreScale10 >= 6.5
                    ? 'bg-sky-100 text-sky-800'
                    : submission.scoreScale10 >= 5.0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {submission.rankBadge}
                </span>
                <span className="text-xs text-slate-500 font-formula">
                  Thời gian làm bài: {timeFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
                {submission.teacherFeedback}
              </p>
            </div>
          </div>

          {/* Cognitive Levels Breakdown (GDPT 2018) */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Đánh giá theo 3 mức độ nhận thức (Chuẩn YCCĐ GDPT 2018)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Nhận biết */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">1. Nhận Biết</span>
                  <span className="text-xs font-semibold text-slate-500 font-formula">
                    {submission.levelStats.nhan_biet.percent}%
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1 font-formula">
                  {submission.levelStats.nhan_biet.correct} / {submission.levelStats.nhan_biet.total}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all"
                    style={{ width: `${submission.levelStats.nhan_biet.percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Khái niệm thuận nghịch & Biểu thức Kc
                </div>
              </div>

              {/* Thông hiểu */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">2. Thông Hiểu</span>
                  <span className="text-xs font-semibold text-slate-500 font-formula">
                    {submission.levelStats.thong_hieu.percent}%
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1 font-formula">
                  {submission.levelStats.thong_hieu.correct} / {submission.levelStats.thong_hieu.total}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all"
                    style={{ width: `${submission.levelStats.thong_hieu.percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Thí nghiệm 2NO₂ ⇌ N₂O₄ & CH₃COONa
                </div>
              </div>

              {/* Vận dụng */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">3. Vận Dụng</span>
                  <span className="text-xs font-semibold text-slate-500 font-formula">
                    {submission.levelStats.van_dung.percent}%
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 mt-1 font-formula">
                  {submission.levelStats.van_dung.correct} / {submission.levelStats.van_dung.total}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all"
                    style={{ width: `${submission.levelStats.van_dung.percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Nguyên lí Le Chatelier & Thực tế
                </div>
              </div>
            </div>
          </div>

          {/* Summary table of answers */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Bảng Tổng Hợp Chi Tiết Từng Bài Tập
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {submission.exerciseResults.map((exRes, eIdx) => (
                <div key={exRes.exerciseId} className="border border-slate-200 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">{exRes.title}</span>
                    <span className="font-formula font-semibold text-teal-800">
                      {exRes.correctBlanks} / {exRes.totalBlanks} đúng
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {exRes.blankResults.map((bRes, bIdx) => (
                      <div
                        key={bRes.blankId}
                        className={`p-2 rounded-sm border ${
                          bRes.isCorrect
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-rose-200 bg-rose-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-formula font-medium">
                          <span>Ô [{bIdx + 1}]</span>
                          {bRes.isCorrect ? (
                            <span className="text-emerald-700 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                            </span>
                          ) : (
                            <span className="text-rose-700 flex items-center gap-1 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] mt-1">
                          <span className="text-slate-500">Đã điền: </span>
                          <strong className={bRes.isCorrect ? 'text-emerald-800' : 'text-rose-800'}>
                            {bRes.userAnswer || '(Bỏ trống)'}
                          </strong>
                          {!bRes.isCorrect && (
                            <div className="text-emerald-800 font-semibold mt-0.5">
                              → Đáp án: {bRes.correctAnswer}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <button
            onClick={onRetake}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm Lại Bài Thi Mới</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Điểm / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
            >
              Xem Chi Tiết Bài Làm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
