import React, { useState } from 'react';
import { ClozeExercise, BlankAnswerResult } from '../types/chemistry';
import { HelpCircle, Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FillBlankExerciseProps {
  exercise: ClozeExercise;
  userAnswers: Record<string, string>;
  onAnswerChange: (blankId: string, value: string) => void;
  showResults: boolean;
  isPracticeMode: boolean;
  onClearExercise: () => void;
}

export const FillBlankExercise: React.FC<FillBlankExerciseProps> = ({
  exercise,
  userAnswers,
  onAnswerChange,
  showResults,
  isPracticeMode,
  onClearExercise,
}) => {
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);
  const [activeHintBlankId, setActiveHintBlankId] = useState<string | null>(null);

  // Normalize string for comparison (case-insensitive, trim whitespace, normalize unicode)
  const isAnswerCorrect = (blankId: string, rawAnswer: string): boolean => {
    if (!rawAnswer) return false;
    const blank = exercise.blanks[blankId];
    if (!blank) return false;

    const cleanInput = rawAnswer.trim().toLowerCase().normalize('NFC');
    return blank.correctAnswers.some((ans) => {
      const cleanExpected = ans.trim().toLowerCase().normalize('NFC');
      return cleanInput === cleanExpected;
    });
  };

  // Find next empty blank
  const getNextEmptyBlankId = (): string | null => {
    const blankIds = Object.keys(exercise.blanks);
    for (const id of blankIds) {
      if (!userAnswers[id] || userAnswers[id].trim() === '') {
        return id;
      }
    }
    return null;
  };

  // When student clicks a word in the word bank
  const handleWordBankSelect = (word: string) => {
    soundManager.playPop();
    let targetId = activeBlankId;
    if (!targetId || !exercise.blanks[targetId]) {
      targetId = getNextEmptyBlankId() || Object.keys(exercise.blanks)[0];
    }
    if (targetId) {
      onAnswerChange(targetId, word);
      // Advance to next blank if available
      const blankKeys = Object.keys(exercise.blanks);
      const currentIndex = blankKeys.indexOf(targetId);
      if (currentIndex !== -1 && currentIndex + 1 < blankKeys.length) {
        setActiveBlankId(blankKeys[currentIndex + 1]);
      } else {
        setActiveBlankId(null);
      }
    }
  };

  const filledCount = Object.keys(exercise.blanks).filter(
    (id) => userAnswers[id] && userAnswers[id].trim() !== ''
  ).length;
  const totalCount = Object.keys(exercise.blanks).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs transition-all">
      {/* Exercise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span>{exercise.levelLabel}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>YCCĐ: {exercise.targetAchievement}</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mt-1">{exercise.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{exercise.description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-formula">
            Đã điền: <span className="font-bold text-teal-700">{filledCount}</span>/{totalCount}
          </div>
          {!showResults && filledCount > 0 && (
            <button
              onClick={() => {
                soundManager.playPop();
                onClearExercise();
              }}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-sm"
              title="Xoá làm lại bài này"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xoá làm lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Paragraph with Blanks */}
      <div className="my-6 text-[15px] leading-relaxed text-slate-800 bg-slate-50/70 p-5 rounded-lg border border-slate-200/80 font-normal">
        {exercise.parts.map((part, index) => {
          if (part.type === 'text') {
            // Render newlines properly
            return (
              <span key={index} className="whitespace-pre-line">
                {part.content}
              </span>
            );
          }

          if (part.type === 'blank' && part.blankId) {
            const blankId = part.blankId;
            const blank = exercise.blanks[blankId];
            const currentValue = userAnswers[blankId] || '';
            const isActive = activeBlankId === blankId;
            const isCorrect = isAnswerCorrect(blankId, currentValue);
            const blankIndex = Object.keys(exercise.blanks).indexOf(blankId) + 1;

            return (
              <span
                key={index}
                className="inline-flex items-center align-middle mx-1 my-1 relative group"
              >
                <div className="relative inline-flex items-center">
                  <input
                    type="text"
                    disabled={showResults}
                    placeholder={`[${blankIndex}] ...`}
                    value={currentValue}
                    onFocus={() => setActiveBlankId(blankId)}
                    onChange={(e) => onAnswerChange(blankId, e.target.value)}
                    className={`text-sm font-medium py-1 px-2.5 rounded-md border transition-all text-center min-w-[120px] max-w-[200px] outline-none ${
                      showResults
                        ? isCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                          : 'bg-rose-50 border-rose-500 text-rose-900 line-through decoration-rose-500/80'
                        : isActive
                        ? 'border-teal-500 bg-white ring-2 ring-teal-400/20 shadow-xs text-slate-900'
                        : currentValue
                        ? 'border-slate-300 bg-white text-teal-800 font-medium'
                        : 'border-slate-300 border-dashed bg-white/90 text-slate-400 placeholder:text-slate-400 hover:border-slate-400'
                    }`}
                  />

                  {/* Feedback indicator when showing results */}
                  {showResults && (
                    <span className="ml-1 shrink-0">
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <X className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200 font-formula">
                            {blank.correctAnswers[0]}
                          </span>
                        </span>
                      )}
                    </span>
                  )}

                  {/* Practice Mode Hint Button */}
                  {isPracticeMode && !showResults && blank.hint && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveHintBlankId(
                          activeHintBlankId === blankId ? null : blankId
                        )
                      }
                      className="ml-1 text-slate-400 hover:text-teal-600 transition-colors"
                      title="Xem gợi ý"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Hint popup */}
                {activeHintBlankId === blankId && blank.hint && (
                  <div className="absolute bottom-full mb-1 left-0 z-20 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-md shadow-lg">
                    <span className="text-teal-300 font-bold">Gợi ý:</span> {blank.hint}
                  </div>
                )}
              </span>
            );
          }

          return null;
        })}
      </div>

      {/* Word Bank: Click to Fill */}
      {!showResults && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Ngân hàng từ khoá (Bấm để điền vào ô trống tiếp theo):
            </span>
            <span className="text-[11px] text-slate-500">
              Có thể gõ bàn phím trực tiếp vào ô
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {exercise.wordBank.map((word, wIdx) => {
              // Check if word is already used in any blank
              const isUsed = Object.values(userAnswers).some(
                (v) => v.trim().toLowerCase() === word.trim().toLowerCase()
              );
              return (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => handleWordBankSelect(word)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                    isUsed
                      ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:text-teal-800 shadow-2xs hover:shadow-xs active:scale-95'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation when results are displayed */}
      {showResults && (
        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
          <div className="font-bold text-slate-900 text-sm">Lời giải chi tiết & Cơ sở lý thuyết SGK:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {Object.entries(exercise.blanks).map(([bId, bItem], idx) => {
              const uAns = userAnswers[bId] || '(Chưa điền)';
              const correct = isAnswerCorrect(bId, userAnswers[bId] || '');
              return (
                <div
                  key={bId}
                  className={`p-2.5 rounded-md border ${
                    correct
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-formula font-semibold mb-1">
                    <span className="text-slate-900">Ô trống [{idx + 1}]:</span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-xs ${
                        correct ? 'text-emerald-800 bg-emerald-100' : 'text-rose-800 bg-rose-100'
                      }`}
                    >
                      {correct ? 'Đúng' : 'Chưa chính xác'}
                    </span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-slate-500">Đã điền: </span>
                    <strong className={correct ? 'text-emerald-700' : 'text-rose-700'}>
                      {uAns}
                    </strong>
                    {!correct && (
                      <span className="ml-2 text-emerald-800 font-semibold">
                        → Đáp án chuẩn: {bItem.correctAnswers[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 italic leading-relaxed">
                    {bItem.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
