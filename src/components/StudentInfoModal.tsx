import React, { useState } from 'react';
import { StudentProfile } from '../types/chemistry';
import { UserCheck, Sparkles, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StudentInfoModalProps {
  initialProfile: StudentProfile;
  isOpen: boolean;
  onSave: (profile: StudentProfile) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const StudentInfoModal: React.FC<StudentInfoModalProps> = ({
  initialProfile,
  isOpen,
  onSave,
  onClose,
  isMandatory = false,
}) => {
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [classGroup, setClassGroup] = useState(initialProfile.classGroup);
  const [schoolName, setSchoolName] = useState(initialProfile.schoolName);
  const [studentId, setStudentId] = useState(initialProfile.studentId);
  const [mode, setMode] = useState<'practice' | 'exam'>(initialProfile.mode);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFullName(initialProfile.fullName);
      setClassGroup(initialProfile.classGroup);
      setSchoolName(initialProfile.schoolName);
      setStudentId(initialProfile.studentId);
      setMode(initialProfile.mode);
      setError(null);
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của học sinh.');
      soundManager.playWrong();
      return;
    }
    if (!classGroup.trim()) {
      setError('Vui lòng nhập lớp học (ví dụ: 11A1, 11B2).');
      soundManager.playWrong();
      return;
    }

    soundManager.playSuccess();
    onSave({
      fullName: fullName.trim(),
      classGroup: classGroup.trim().toUpperCase(),
      schoolName: schoolName.trim() || 'Trường THPT',
      studentId: studentId.trim() || `HS-${Math.floor(1000 + Math.random() * 9000)}`,
      mode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Hồ Sơ Học Sinh Học Tập</span>
          </div>
          <h3 className="text-xl font-bold mt-1 text-white">Thông Tin Học Sinh</h3>
          <p className="text-xs text-teal-100/80 mt-0.5">
            Nhập thông tin để ghi nhận kết quả và xuất phiếu chấm điểm chuẩn GDPT 2018
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn An"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lớp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="11A1"
                value={classGroup}
                onChange={(e) => {
                  setClassGroup(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số báo danh / Mã HS
              </label>
              <input
                type="text"
                placeholder="SBD-1105"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trường THPT
            </label>
            <input
              type="text"
              placeholder="Trường THPT Chuyên hoặc Phổ thông..."
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-900"
            />
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hình thức học tập
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mode === 'practice'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Luyện Tập</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Có gợi ý từ khoá, không áp lực thời gian
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('exam')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mode === 'exam'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kiểm Tra 15p</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tính giờ 15 phút, nộp bài lấy điểm chính thức
                </p>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            {!isMandatory && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Đóng
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Xác Nhận & Bắt Đầu Học</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
