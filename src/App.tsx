import React, { useState, useEffect, useMemo } from 'react';
import {
  CognitiveLevel,
  StudentProfile,
  TestSubmission,
  ExerciseResult,
  BlankAnswerResult,
} from './types/chemistry';
import { CURRICULUM_EXERCISES } from './data/curriculumData';
import { Header } from './components/Header';
import { FillBlankExercise } from './components/FillBlankExercise';
import { LabSimulator } from './components/LabSimulator';
import { TheoryHandbook } from './components/TheoryHandbook';
import { StudentInfoModal } from './components/StudentInfoModal';
import { ScoreReportModal } from './components/ScoreReportModal';
import { soundManager } from './utils/audio';
import confetti from 'canvas-confetti';
import {
  User,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Award,
  Filter,
  Check,
  RotateCcw,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_PROFILE: StudentProfile = {
  fullName: 'Nguyễn Văn An',
  classGroup: '11A1',
  schoolName: 'Trường THPT',
  studentId: 'HS-1101',
  mode: 'practice',
};

export const App: React.FC = () => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'exercises' | 'simulator' | 'theory'>('exercises');
  const [levelFilter, setLevelFilter] = useState<'all' | CognitiveLevel>('all');

  // Student Profile
  const [student, setStudent] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('chemistry_student_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User Answers State: record of blankId -> answer string
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('chemistry_user_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Test state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submission, setSubmission] = useState<TestSubmission | null>(() => {
    try {
      const saved = localStorage.getItem('chemistry_last_submission');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer state for Exam mode
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chemistry_student_profile', JSON.stringify(student));
    } catch {
      // Ignore
    }
  }, [student]);

  // Save answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chemistry_user_answers', JSON.stringify(userAnswers));
    } catch {
      // Ignore
    }
  }, [userAnswers]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!hasSubmitted) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasSubmitted]);

  // Sound toggle
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.enabled = nextState;
    if (nextState) soundManager.playPop();
  };

  // Answer change handler
  const handleAnswerChange = (blankId: string, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [blankId]: value,
    }));
  };

  // Clear single exercise
  const handleClearExercise = (exerciseId: string) => {
    const exercise = CURRICULUM_EXERCISES.find((e) => e.id === exerciseId);
    if (!exercise) return;
    setUserAnswers((prev) => {
      const next = { ...prev };
      Object.keys(exercise.blanks).forEach((bId) => {
        delete next[bId];
      });
      return next;
    });
  };

  // Total Blanks in curriculum
  const totalBlanksCount = useMemo(() => {
    return CURRICULUM_EXERCISES.reduce(
      (acc, ex) => acc + Object.keys(ex.blanks).length,
      0
    );
  }, []);

  // Filled blanks count
  const filledBlanksCount = useMemo(() => {
    return Object.values(userAnswers).filter((v) => v && v.trim() !== '').length;
  }, [userAnswers]);

  // Check if an individual blank is correct
  const checkIsBlankCorrect = (blankId: string, input: string): boolean => {
    if (!input || !input.trim()) return false;
    for (const ex of CURRICULUM_EXERCISES) {
      if (ex.blanks[blankId]) {
        const acceptable = ex.blanks[blankId].correctAnswers;
        const cleanInput = input.trim().toLowerCase().normalize('NFC');
        return acceptable.some(
          (ans) => ans.trim().toLowerCase().normalize('NFC') === cleanInput
        );
      }
    }
    return false;
  };

  // Submit and Grade the test
  const handleGradeSubmission = () => {
    soundManager.playPop();

    let totalCorrect = 0;
    const levelCounts: Record<CognitiveLevel, { total: number; correct: number }> = {
      nhan_biet: { total: 0, correct: 0 },
      thong_hieu: { total: 0, correct: 0 },
      van_dung: { total: 0, correct: 0 },
    };

    const exerciseResults: ExerciseResult[] = CURRICULUM_EXERCISES.map((ex) => {
      let exCorrect = 0;
      const blankResults: BlankAnswerResult[] = Object.entries(ex.blanks).map(
        ([bId, bItem]) => {
          const uAns = userAnswers[bId] || '';
          const isCorrect = checkIsBlankCorrect(bId, uAns);
          if (isCorrect) {
            exCorrect++;
            totalCorrect++;
            levelCounts[ex.level].correct++;
          }
          levelCounts[ex.level].total++;

          return {
            blankId: bId,
            userAnswer: uAns,
            isCorrect,
            correctAnswer: bItem.correctAnswers[0],
            explanation: bItem.explanation,
          };
        }
      );

      return {
        exerciseId: ex.id,
        title: ex.title,
        level: ex.level,
        totalBlanks: Object.keys(ex.blanks).length,
        correctBlanks: exCorrect,
        blankResults,
      };
    });

    const scoreScale10 = totalBlanksCount > 0 ? (totalCorrect / totalBlanksCount) * 10 : 0;
    const scoreScale100 = totalBlanksCount > 0 ? Math.round((totalCorrect / totalBlanksCount) * 100) : 0;

    // Determine rank badge
    let rankBadge: TestSubmission['rankBadge'] = 'Cần cố gắng';
    let teacherFeedback = '';

    if (scoreScale10 >= 9.0) {
      rankBadge = 'Xuất sắc';
      teacherFeedback =
        'Học sinh nắm vững toàn diện lý thuyết phản ứng thuận nghịch, biểu thức hằng số cân bằng Kc và vận dụng xuất sắc nguyên lí Le Chatelier vào thực tiễn cũng như giải thích sâu sắc các thí nghiệm SGK!';
    } else if (scoreScale10 >= 8.0) {
      rankBadge = 'Giỏi';
      teacherFeedback =
        'Học sinh có tư duy hoá học tốt, hiểu rõ bản chất động của trạng thái cân bằng và các yếu tố ảnh hưởng (nhiệt độ, nồng độ, áp suất). Cần rèn luyện thêm tính chính xác tuyệt đối ở các chi tiết phản ứng dị thể.';
    } else if (scoreScale10 >= 6.5) {
      rankBadge = 'Khá';
      teacherFeedback =
        'Học sinh nắm được kiến thức nền tảng về phản ứng thuận nghịch và quy luật Le Chatelier, tuy nhiên cần chú ý phân biệt rõ chiều toả nhiệt (ΔrH < 0) và thu nhiệt (ΔrH > 0) khi thay đổi nhiệt độ trong thí nghiệm.';
    } else if (scoreScale10 >= 5.0) {
      rankBadge = 'Trung bình';
      teacherFeedback =
        'Đã đạt mức chuẩn cơ bản. Cần xem lại cẩm nang lý thuyết SGK Hoá học 11, đặc biệt là quy ước nồng độ chất rắn trong biểu thức Kc và hiện tượng đổi màu chỉ thị.';
    } else {
      rankBadge = 'Cần cố gắng';
      teacherFeedback =
        'Chưa đạt yêu cầu cần đạt. Học sinh nên đọc kỹ lại bài học Cân bằng hoá học trong SGK và thực hiện lại thí nghiệm mô phỏng ảo trước khi kiểm tra lại.';
    }

    const newSubmission: TestSubmission = {
      id: `sub_${Date.now()}`,
      student,
      submittedAt: new Date().toLocaleString('vi-VN'),
      durationSeconds: elapsedSeconds,
      totalBlanks: totalBlanksCount,
      totalCorrect,
      scoreScale10,
      scoreScale100,
      levelStats: {
        nhan_biet: {
          total: levelCounts.nhan_biet.total,
          correct: levelCounts.nhan_biet.correct,
          percent:
            levelCounts.nhan_biet.total > 0
              ? Math.round((levelCounts.nhan_biet.correct / levelCounts.nhan_biet.total) * 100)
              : 0,
        },
        thong_hieu: {
          total: levelCounts.thong_hieu.total,
          correct: levelCounts.thong_hieu.correct,
          percent:
            levelCounts.thong_hieu.total > 0
              ? Math.round((levelCounts.thong_hieu.correct / levelCounts.thong_hieu.total) * 100)
              : 0,
        },
        van_dung: {
          total: levelCounts.van_dung.total,
          correct: levelCounts.van_dung.correct,
          percent:
            levelCounts.van_dung.total > 0
              ? Math.round((levelCounts.van_dung.correct / levelCounts.van_dung.total) * 100)
              : 0,
        },
      },
      exerciseResults,
      teacherFeedback,
      rankBadge,
    };

    setSubmission(newSubmission);
    setHasSubmitted(true);
    setIsReportOpen(true);

    try {
      localStorage.setItem('chemistry_last_submission', JSON.stringify(newSubmission));
    } catch {
      // Ignore
    }

    // Trigger celebration if high score
    if (scoreScale10 >= 8.0) {
      soundManager.playFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }
    } else {
      soundManager.playSuccess();
    }
  };

  // Retake test
  const handleRetake = () => {
    soundManager.playPop();
    setUserAnswers({});
    setHasSubmitted(false);
    setSubmission(null);
    setIsReportOpen(false);
    setElapsedSeconds(0);
    try {
      localStorage.removeItem('chemistry_user_answers');
      localStorage.removeItem('chemistry_last_submission');
    } catch {
      // Ignore
    }
  };

  // Filter exercises
  const filteredExercises = useMemo(() => {
    if (levelFilter === 'all') return CURRICULUM_EXERCISES;
    return CURRICULUM_EXERCISES.filter((ex) => ex.level === levelFilter);
  }, [levelFilter]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerDisplay = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar adhering to the Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onNavigate={(tab) => {
          soundManager.playPop();
          setActiveTab(tab);
        }}
        onOpenProfile={() => {
          soundManager.playPop();
          setIsProfileModalOpen(true);
        }}
        onSubmitTest={handleGradeSubmission}
        hasSubmitted={hasSubmitted}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        scoreScale10={submission ? submission.scoreScale10 : undefined}
      />

      {/* Student Profile & Progress Banner */}
      <div className="bg-white border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold shrink-0">
              <GraduationCap className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{student.fullName}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-teal-800 font-formula">Lớp {student.classGroup}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-formula">{student.studentId}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{student.schoolName}</span>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-teal-700 hover:underline font-medium"
                >
                  Đổi thông tin
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Mode */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Progress indicator */}
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-slate-500 font-medium">Tiến độ điền khuyết</span>
              <span className="text-xs font-bold text-slate-900 font-formula">
                {filledBlanksCount}/{totalBlanksCount} ô ({Math.round((filledBlanksCount / totalBlanksCount) * 100)}%)
              </span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 font-formula text-xs font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{timerDisplay}</span>
            </div>

            {/* Mode badge */}
            <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
              {student.mode === 'exam' ? 'Kiểm tra 15p' : 'Luyện tập'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs (Mobile & secondary tab selector) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 no-print">
          <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-lg">
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('exercises');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'exercises'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Bài Tập Điền Khuyết (9 Bài)
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('simulator');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Phòng Thí Nghiệm Ảo
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTab('theory');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'theory'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Tra Cứu Lý Thuyết SGK
            </button>
          </div>

          {/* Quick CTA to grade */}
          <div className="hidden sm:flex items-center gap-2">
            {!hasSubmitted ? (
              <button
                onClick={handleGradeSubmission}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Nộp Bài & Chấm Điểm Ngay</span>
              </button>
            ) : (
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Xem Phiếu Điểm ({submission?.scoreScale10.toFixed(1)}/10)</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Exercises */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Filter by cognitive level */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Hệ Thống Bài Tập Điền Khuyết Cân Bằng Hoá Học
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn ô trống rồi bấm từ khóa ở ngân hàng từ hoặc gõ trực tiếp bàn phím tiếng Việt
                </p>
              </div>

              {/* Segmented control for levels */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setLevelFilter('all');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    levelFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({CURRICULUM_EXERCISES.length})
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setLevelFilter('nhan_biet');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    levelFilter === 'nhan_biet'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Nhận biết (4)
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setLevelFilter('thong_hieu');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    levelFilter === 'thong_hieu'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thông hiểu (2)
                </button>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    setLevelFilter('van_dung');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    levelFilter === 'van_dung'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vận dụng (3)
                </button>
              </div>
            </div>

            {/* If has submitted: notification banner */}
            {hasSubmitted && submission && (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-teal-700 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-teal-950">
                      Bài kiểm tra đã được chấm điểm tự động!
                    </span>
                    <span className="text-xs text-teal-800 block">
                      Điểm: <strong>{submission.scoreScale10.toFixed(1)}/10</strong> · Xếp loại:{' '}
                      <strong>{submission.rankBadge}</strong> · Số câu đúng: {submission.totalCorrect}/{submission.totalBlanks}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors"
                  >
                    Xem Phiếu Điểm
                  </button>
                  <button
                    onClick={handleRetake}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
                  >
                    Làm lại
                  </button>
                </div>
              </div>
            )}

            {/* List of Cloze Exercises */}
            <div className="space-y-6">
              {filteredExercises.map((exercise) => (
                <FillBlankExercise
                  key={exercise.id}
                  exercise={exercise}
                  userAnswers={userAnswers}
                  onAnswerChange={handleAnswerChange}
                  showResults={hasSubmitted}
                  isPracticeMode={student.mode === 'practice'}
                  onClearExercise={() => handleClearExercise(exercise.id)}
                />
              ))}
            </div>

            {/* Bottom Floating/Fixed CTA to Grade */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs no-print">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Trạng thái làm bài
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  Đã hoàn thành {filledBlanksCount} trên tổng số {totalBlanksCount} ô trống
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGradeSubmission}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Chấm Điểm & Đánh Giá Năng Lực</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Virtual Laboratory Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <LabSimulator />

            {/* Educational bridge to exercises */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Đã quan sát và hiểu rõ hiện tượng thí nghiệm?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hãy chuyển sang phần bài tập điền khuyết Thông hiểu (Bài 5 & Bài 6) để kiểm tra kiến thức!
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playPop();
                  setLevelFilter('thong_hieu');
                  setActiveTab('exercises');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Làm Bài Tập Thí Nghiệm</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: SGK Theory Handbook */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            <TheoryHandbook />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>
            Phần mềm game học tập Hoá học 11 · Chuyên đề Cân bằng hoá học · Chương trình GDPT 2018
          </p>
          <p className="mt-1 text-slate-400">
            Hỗ trợ 3 mức độ Nhận biết - Thông hiểu - Vận dụng và mô phỏng thí nghiệm trực quan
          </p>
        </div>
      </footer>

      {/* Student Profile Modal */}
      <StudentInfoModal
        initialProfile={student}
        isOpen={isProfileModalOpen}
        onSave={(updated) => {
          setStudent(updated);
          setIsProfileModalOpen(false);
        }}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Score Report & Printable Card Modal */}
      {submission && (
        <ScoreReportModal
          submission={submission}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
};

export default App;
