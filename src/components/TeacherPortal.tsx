import React, { useState, useMemo } from 'react';
import { TestSubmission } from '../types/chemistry';
import {
  Lock,
  Unlock,
  KeyRound,
  Download,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Users,
  Award,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Search,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TeacherPortalProps {
  submissions: TestSubmission[];
  onDeleteSubmission: (id: string) => void;
  onClearAllSubmissions: () => void;
  onViewSubmissionDetail: (sub: TestSubmission) => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  submissions,
  onDeleteSubmission,
  onClearAllSubmissions,
  onViewSubmissionDetail,
}) => {
  // Password authentication state
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('chemistry_teacher_auth') === 'true';
  });
  const [authError, setAuthError] = useState<string | null>(null);

  // Stored Teacher Password (default: 15111992)
  const [teacherPin, setTeacherPin] = useState<string>(() => {
    return localStorage.getItem('chemistry_teacher_pin') || '15111992';
  });
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  // UI state
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Verify Password
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === teacherPin) {
      soundManager.playSuccess();
      setIsAuthenticated(true);
      sessionStorage.setItem('chemistry_teacher_auth', 'true');
      setAuthError(null);
    } else {
      soundManager.playWrong();
      setAuthError('Mật khẩu không chính xác. Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    soundManager.playPop();
    setIsAuthenticated(false);
    sessionStorage.removeItem('chemistry_teacher_auth');
    setPinInput('');
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      soundManager.playWrong();
      setAuthError('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }
    setTeacherPin(newPin);
    localStorage.setItem('chemistry_teacher_pin', newPin);
    setIsChangingPin(false);
    setNewPin('');
    soundManager.playSuccess();
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchSearch =
        sub.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.student.classGroup.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'all' || sub.student.classGroup === classFilter;
      return matchSearch && matchClass;
    });
  }, [submissions, searchTerm, classFilter]);

  // Unique classes for filter
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.student.classGroup) set.add(s.student.classGroup);
    });
    return Array.from(set);
  }, [submissions]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (submissions.length === 0) {
      return {
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        excellentRate: 0,
        goodRate: 0,
        avgNhanBiet: 0,
        avgThongHieu: 0,
        avgVanDung: 0,
      };
    }

    const total = submissions.length;
    const scores = submissions.map((s) => s.scoreScale10);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / total;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const excellentCount = submissions.filter((s) => s.scoreScale10 >= 9.0).length;
    const goodCount = submissions.filter((s) => s.scoreScale10 >= 8.0 && s.scoreScale10 < 9.0).length;

    const avgNB =
      submissions.reduce((acc, s) => acc + s.levelStats.nhan_biet.percent, 0) / total;
    const avgTH =
      submissions.reduce((acc, s) => acc + s.levelStats.thong_hieu.percent, 0) / total;
    const avgVD =
      submissions.reduce((acc, s) => acc + s.levelStats.van_dung.percent, 0) / total;

    return {
      avgScore: Math.round(avg * 10) / 10,
      highestScore: max,
      lowestScore: min,
      excellentRate: Math.round((excellentCount / total) * 100),
      goodRate: Math.round((goodCount / total) * 100),
      avgNhanBiet: Math.round(avgNB),
      avgThongHieu: Math.round(avgTH),
      avgVanDung: Math.round(avgVD),
    };
  }, [submissions]);

  // Export to CSV formatted for Google Sheets / Excel
  const handleExportCSV = () => {
    soundManager.playPop();
    if (submissions.length === 0) return;

    // Header row
    const headers = [
      'STT',
      'Mã học sinh / SBD',
      'Họ và tên',
      'Lớp',
      'Trường THPT',
      'Điểm thang 10',
      'Điểm thang 100 (%)',
      'Số câu đúng',
      'Nhận biết (%)',
      'Thông hiểu (%)',
      'Vận dụng (%)',
      'Xếp loại',
      'Thời gian làm bài',
      'Thời điểm nộp',
    ];

    // Data rows
    const rows = submissions.map((sub, idx) => {
      const minutes = Math.floor(sub.durationSeconds / 60);
      const seconds = sub.durationSeconds % 60;
      const durationStr = `${minutes}p ${seconds}s`;

      return [
        idx + 1,
        `"${sub.student.studentId}"`,
        `"${sub.student.fullName}"`,
        `"${sub.student.classGroup}"`,
        `"${sub.student.schoolName}"`,
        sub.scoreScale10.toFixed(1),
        sub.scoreScale100,
        `"${sub.totalCorrect}/${sub.totalBlanks}"`,
        `${sub.levelStats.nhan_biet.percent}%`,
        `${sub.levelStats.thong_hieu.percent}%`,
        `${sub.levelStats.van_dung.percent}%`,
        `"${sub.rankBadge}"`,
        `"${durationStr}"`,
        `"${sub.submittedAt}"`,
      ].join(',');
    });

    // Add BOM for proper UTF-8 Vietnamese rendering in Excel and Google Sheets
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_Diem_Hoa11_CanBang_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy as Tab-Separated Values for instant Paste (Ctrl+V) into Google Sheets
  const handleCopyForGoogleSheets = async () => {
    soundManager.playPop();
    if (submissions.length === 0) return;

    const headers = [
      'STT',
      'Mã HS / SBD',
      'Họ và Tên',
      'Lớp',
      'Trường',
      'Điểm (10)',
      'Tỷ lệ đúng (%)',
      'Số câu đúng',
      'Nhận biết (%)',
      'Thông hiểu (%)',
      'Vận dụng (%)',
      'Xếp loại',
      'Thời gian làm bài',
      'Thời điểm nộp',
    ].join('\t');

    const rows = submissions
      .map((sub, idx) => {
        const minutes = Math.floor(sub.durationSeconds / 60);
        const seconds = sub.durationSeconds % 60;
        const durationStr = `${minutes}p ${seconds}s`;

        return [
          idx + 1,
          sub.student.studentId,
          sub.student.fullName,
          sub.student.classGroup,
          sub.student.schoolName,
          sub.scoreScale10.toFixed(1),
          `${sub.scoreScale100}%`,
          `${sub.totalCorrect}/${sub.totalBlanks}`,
          `${sub.levelStats.nhan_biet.percent}%`,
          `${sub.levelStats.thong_hieu.percent}%`,
          `${sub.levelStats.van_dung.percent}%`,
          sub.rankBadge,
          durationStr,
          sub.submittedAt,
        ].join('\t');
      })
      .join('\n');

    const fullContent = `${headers}\n${rows}`;

    try {
      await navigator.clipboard.writeText(fullContent);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
      soundManager.playSuccess();
    } catch {
      // Fallback
    }
  };

  // If not authenticated, show PIN Login lock screen (NO HINTS SHOWN)
  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md mx-auto my-8 shadow-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-teal-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Khu Vực Dành Cho Giáo Viên</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Khu vực lưu trữ điểm số và xuất dữ liệu sang Google Sheets được bảo mật chỉ dành cho giáo viên.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {authError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-left">
              Mật khẩu đăng nhập giáo viên:
            </label>
            <input
              type="password"
              autoFocus
              placeholder="Nhập mật khẩu..."
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (authError) setAuthError(null);
              }}
              className="w-full text-center text-lg tracking-widest font-mono py-2.5 px-4 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Mở Khoá Bảng Điểm</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teacher Top Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Quản Lý Chuyên Môn
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" /> Đã xác thực giáo viên
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Sổ Điểm & Báo Cáo Học Sinh (Tích hợp Google Sheets)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ thông tin học sinh, kết quả làm bài và xuất bảng tính sang Google Sheets hoặc Excel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsChangingPin(!isChangingPin)}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg bg-white transition-colors"
          >
            Đổi mật khẩu
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 rounded-lg bg-rose-50/50 transition-colors"
          >
            Khoá màn hình
          </button>
        </div>
      </div>

      {/* Change Password Form */}
      {isChangingPin && (
        <form
          onSubmit={handleSaveNewPin}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3"
        >
          <span className="text-xs font-semibold text-slate-700">Mật khẩu mới (tối thiểu 4 ký tự):</span>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Nhập mật khẩu mới..."
            className="text-xs px-3 py-1.5 rounded-md border border-slate-300 bg-white focus:border-teal-600 outline-none font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-md transition-colors"
          >
            Lưu mật khẩu
          </button>
          <button
            type="button"
            onClick={() => setIsChangingPin(false)}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
          >
            Huỷ
          </button>
        </form>
      )}

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng lượt làm bài</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-formula">
            {submissions.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Học sinh đã nộp bài</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Điểm trung bình lớp</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-800 mt-1 font-formula">
            {stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 10</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cao nhất: {stats.highestScore} · Thấp nhất: {stats.lowestScore}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tỷ lệ Giỏi & Xuất sắc</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-formula">
            {stats.excellentRate + stats.goodRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.excellentRate}% Xuất sắc · {stats.goodRate}% Giỏi
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tỷ lệ đạt theo YCCĐ</span>
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xs font-formula text-slate-700 mt-1.5 space-y-0.5">
            <div className="flex justify-between">
              <span>Nhận biết:</span>
              <strong className="text-teal-800">{stats.avgNhanBiet}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Thông hiểu:</span>
              <strong className="text-teal-800">{stats.avgThongHieu}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Vận dụng:</span>
              <strong className="text-teal-800">{stats.avgVanDung}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Export to Google Sheets Actions Panel */}
      <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-white border border-teal-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Xuất Bảng Điểm Sang Google Sheets & Excel
              </h4>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Hỗ trợ 2 cách đưa dữ liệu vào Google Sheets tiện lợi:
              <br />
              <strong>Cách 1:</strong> Bấm <em>"Sao Chép Cho Google Sheets"</em> rồi nhấn <strong>Ctrl+V</strong> vào trang tính Google Sheets của bạn.
              <br />
              <strong>Cách 2:</strong> Tải file <em>CSV (UTF-8)</em> rồi kéo thả trực tiếp vào Google Drive / Sheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Copy button */}
            <button
              onClick={handleCopyForGoogleSheets}
              disabled={submissions.length === 0}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                copiedSuccess
                  ? 'bg-emerald-700 text-white'
                  : submissions.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-800 hover:bg-teal-900 text-white shadow-2xs'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã Sao Chép Dữ Liệu!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Cho Google Sheets</span>
                </>
              )}
            </button>

            {/* CSV Download button */}
            <button
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                submissions.length === 0
                  ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                  : 'border-slate-300 hover:border-slate-400 bg-white text-slate-800 shadow-2xs'
              }`}
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Tải File CSV / Excel</span>
            </button>

            {/* Open Google Sheets blank button */}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg bg-white transition-colors flex items-center gap-1"
              title="Mở một trang tính Google Sheets mới trên tab khác"
            >
              <span>Mở Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Student Submissions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm học sinh, SBD, lớp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-teal-600 outline-none"
              />
            </div>

            {uniqueClasses.length > 0 && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none"
              >
                <option value="all">Tất cả lớp ({uniqueClasses.length})</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {submissions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử điểm số của lớp?')) {
                    soundManager.playWrong();
                    onClearAllSubmissions();
                  }
                }}
                className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xoá tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có bài kiểm tra nào được lưu</p>
            <p className="text-xs text-slate-400 mt-1">
              Khi học sinh hoàn thành bài tập và bấm "Nộp Bài & Chấm Điểm", kết quả sẽ tự động lưu vào đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">STT</th>
                  <th className="py-3 px-4">Mã HS / SBD</th>
                  <th className="py-3 px-4">Họ và Tên</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4 text-center">Điểm (10)</th>
                  <th className="py-3 px-4 text-center">Nhận Biết</th>
                  <th className="py-3 px-4 text-center">Thông Hiểu</th>
                  <th className="py-3 px-4 text-center">Vận Dụng</th>
                  <th className="py-3 px-4 text-center">Xếp Loại</th>
                  <th className="py-3 px-4 text-right">Thời Điểm Nộp</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub, index) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-formula">{index + 1}</td>
                    <td className="py-3 px-4 font-formula font-semibold text-slate-700">
                      {sub.student.studentId}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {sub.student.fullName}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {sub.student.schoolName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-formula text-teal-800 font-semibold">
                      {sub.student.classGroup}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-formula font-extrabold text-sm text-slate-900">
                        {sub.scoreScale10.toFixed(1)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {sub.totalCorrect}/{sub.totalBlanks} ô đúng
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-formula">
                      <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-medium">
                        {sub.levelStats.nhan_biet.percent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-formula">
                      <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-medium">
                        {sub.levelStats.thong_hieu.percent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-formula">
                      <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-medium">
                        {sub.levelStats.van_dung.percent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-sm text-[11px] font-bold ${
                          sub.scoreScale10 >= 9.0
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.scoreScale10 >= 8.0
                            ? 'bg-teal-100 text-teal-800'
                            : sub.scoreScale10 >= 6.5
                            ? 'bg-sky-100 text-sky-800'
                            : sub.scoreScale10 >= 5.0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.rankBadge}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px] font-formula">
                      {sub.submittedAt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            soundManager.playPop();
                            onViewSubmissionDetail(sub);
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                          title="Xem chi tiết phiếu điểm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa kết quả của học sinh ${sub.student.fullName}?`)) {
                              soundManager.playPop();
                              onDeleteSubmission(sub.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Xóa bài làm này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
};
