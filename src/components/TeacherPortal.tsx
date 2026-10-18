import React, { useState, useMemo, useEffect } from 'react';
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
  RefreshCw,
  Radio,
  Settings,
  Code2,
  CheckCircle2,
  HelpCircle,
  X,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { syncService, GoogleSheetConfig } from '../utils/syncService';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  SHEET_COLUMNS_INFO,
  SAMPLE_SHEET_PREVIEW_ROWS,
  downloadSampleGoogleSheetCsv,
  downloadGoogleAppsScriptCode,
} from '../data/googleSheetTemplate';

interface TeacherPortalProps {
  submissions: TestSubmission[];
  onDeleteSubmission: (id: string) => void;
  onClearAllSubmissions: () => void;
  onViewSubmissionDetail: (sub: TestSubmission) => void;
  isSyncing?: boolean;
  isRealtimeConnected?: boolean;
  onManualRefresh?: () => Promise<void>;
  lastSyncedAt?: Date | null;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  submissions,
  onDeleteSubmission,
  onClearAllSubmissions,
  onViewSubmissionDetail,
  isSyncing = false,
  isRealtimeConnected = true,
  onManualRefresh,
  lastSyncedAt,
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

  // Google Sheets Apps Script Configuration State
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>({
    appsScriptUrl: '',
    autoSync: true,
    lastSyncTime: null,
  });
  const [urlInput, setUrlInput] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPullingSheet, setIsPullingSheet] = useState(false);
  const [isPushingSheet, setIsPushingSheet] = useState(false);
  const [sheetSyncNotice, setSheetSyncNotice] = useState<string | null>(null);

  // Modal Guides
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // UI state
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Load Google Sheets config on mount
  useEffect(() => {
    syncService.getSheetConfig().then((cfg) => {
      setSheetConfig(cfg);
      setUrlInput(cfg.appsScriptUrl || '');
    });
  }, []);

  // When teacher logs in or visits, auto sync with server and Google Sheet if configured
  useEffect(() => {
    if (isAuthenticated) {
      if (onManualRefresh) {
        onManualRefresh();
      }
      // Auto pull from Google Sheet if URL exists
      if (sheetConfig.appsScriptUrl && sheetConfig.autoSync) {
        handlePullFromGoogleSheet(false);
      }
    }
  }, [isAuthenticated, sheetConfig.appsScriptUrl]);

  // Verify Password
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === teacherPin) {
      soundManager.playSuccess();
      setIsAuthenticated(true);
      sessionStorage.setItem('chemistry_teacher_auth', 'true');
      setAuthError(null);
      if (onManualRefresh) {
        onManualRefresh();
      }
      if (sheetConfig.appsScriptUrl) {
        handlePullFromGoogleSheet(false);
      }
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

  // Save Google Sheet Apps Script URL
  const handleSaveSheetConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingConfig(true);
    soundManager.playPop();
    try {
      const updated = await syncService.saveSheetConfig(urlInput, sheetConfig.autoSync);
      if (updated) {
        setSheetConfig(updated);
        soundManager.playSuccess();
        setSheetSyncNotice('Đã lưu cấu hình Google Apps Script thành công!');
        setTimeout(() => setSheetSyncNotice(null), 4000);
      }
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Test Google Sheet Connection
  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      soundManager.playWrong();
      setTestResult({ success: false, message: 'Vui lòng dán URL Google Apps Script Web App trước khi kiểm tra.' });
      return;
    }
    setIsTestingConfig(true);
    soundManager.playPop();
    setTestResult(null);
    try {
      const res = await syncService.testSheetConnection(urlInput.trim());
      setTestResult(res);
      if (res.success) {
        soundManager.playSuccess();
      } else {
        soundManager.playWrong();
      }
    } finally {
      setIsTestingConfig(false);
    }
  };

  // Pull data from Google Sheet to App (2-way sync)
  const handlePullFromGoogleSheet = async (showNotice: boolean = true) => {
    if (!sheetConfig.appsScriptUrl) return;
    setIsPullingSheet(true);
    if (showNotice) soundManager.playPop();
    try {
      const res = await syncService.pullFromSheet();
      if (res.success && res.submissions) {
        if (showNotice) {
          soundManager.playSuccess();
          setSheetSyncNotice(`Đã đồng bộ ${res.submissions.length} bài nộp từ Google Sheet về sổ điểm!`);
          setTimeout(() => setSheetSyncNotice(null), 5000);
        }
        if (onManualRefresh) {
          onManualRefresh();
        }
      } else if (showNotice && res.error) {
        soundManager.playWrong();
        setSheetSyncNotice(`Lỗi đồng bộ từ Google Sheet: ${res.error}`);
        setTimeout(() => setSheetSyncNotice(null), 5000);
      }
    } finally {
      setIsPullingSheet(false);
    }
  };

  // Push all local data to Google Sheet
  const handlePushAllToGoogleSheet = async () => {
    if (!sheetConfig.appsScriptUrl) {
      soundManager.playWrong();
      setSheetSyncNotice('Vui lòng cấu hình URL Google Apps Script trước.');
      setTimeout(() => setSheetSyncNotice(null), 4000);
      return;
    }
    setIsPushingSheet(true);
    soundManager.playPop();
    try {
      const res = await syncService.pushAllToSheet();
      if (res.success) {
        soundManager.playSuccess();
        setSheetSyncNotice(`Đã đẩy thành công dữ liệu sang Google Sheet!`);
        setTimeout(() => setSheetSyncNotice(null), 5000);
      } else if (res.error) {
        soundManager.playWrong();
        setSheetSyncNotice(`Lỗi đẩy dữ liệu: ${res.error}`);
        setTimeout(() => setSheetSyncNotice(null), 5000);
      }
    } finally {
      setIsPushingSheet(false);
    }
  };

  // Copy Apps Script code
  const handleCopyAppsScript = async () => {
    soundManager.playPop();
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      soundManager.playSuccess();
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Download Sample Google Sheets CSV Template
  const handleDownloadSampleCsv = () => {
    soundManager.playSuccess();
    downloadSampleGoogleSheetCsv();
    setSheetSyncNotice('Đã tải xuống file mẫu Google Sheets (Mau_Google_Sheets_So_Diem_Hoa_11.csv)!');
    setTimeout(() => setSheetSyncNotice(null), 4000);
  };

  // Download Google Apps Script file
  const handleDownloadAppsScript = () => {
    soundManager.playSuccess();
    downloadGoogleAppsScriptCode();
    setSheetSyncNotice('Đã tải xuống file mã nguồn Code.gs!');
    setTimeout(() => setSheetSyncNotice(null), 4000);
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
          Khu vực lưu trữ điểm số và đồng bộ Google Sheets được bảo mật chỉ dành cho giáo viên bộ môn Hoá học.
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
            <span>Mở Khoá & Đồng Bộ Sổ Điểm</span>
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Quản Lý Chuyên Môn
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" /> Đã xác thực giáo viên
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
                sheetConfig.appsScriptUrl
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3 text-teal-700" />
              <span>
                {sheetConfig.appsScriptUrl ? 'Google Sheet: Đã kết nối' : 'Google Sheet: Chưa gắn link'}
              </span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Sổ Điểm & Báo Cáo Học Sinh (Đồng Bộ 2 Chiều Google Sheets)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tự động đồng bộ khi học sinh nộp bài và khi giáo viên đăng nhập kiểm tra kết quả
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGuideModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Mã Apps Script & Mẫu Sheet</span>
          </button>

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

      {/* Notice Banner */}
      {sheetSyncNotice && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="font-medium">{sheetSyncNotice}</span>
          </div>
          <button onClick={() => setSheetSyncNotice(null)} className="text-teal-600 hover:text-teal-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* Google Sheets Apps Script 2-Way Synchronization Dashboard Card */}
      <div className="bg-white border border-teal-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-4 h-4 text-teal-100" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Đồng Bộ 2 Chiều Với Google Sheets (Google Apps Script)
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Học sinh nộp bài → <strong>tự động ghi vào Google Sheet</strong> · Giáo viên đăng nhập → <strong>tự động kéo điểm từ Google Sheet về</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Download Sample Sheet CSV button */}
            <button
              onClick={handleDownloadSampleCsv}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Tải file mẫu Google Sheets định dạng .csv chuẩn tiếng Việt UTF-8"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tải File Sheet Mẫu</span>
            </button>

            {/* Pull button */}
            <button
              onClick={() => handlePullFromGoogleSheet(true)}
              disabled={isPullingSheet || !sheetConfig.appsScriptUrl}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                !sheetConfig.appsScriptUrl
                  ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                  : 'border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100'
              }`}
              title="Kéo toàn bộ kết quả từ Google Sheet về sổ điểm ứng dụng"
            >
              <DownloadCloud className={`w-4 h-4 text-teal-700 ${isPullingSheet ? 'animate-bounce' : ''}`} />
              <span>{isPullingSheet ? 'Đang kéo...' : 'Đồng bộ từ Sheet về (Pull)'}</span>
            </button>

            {/* Push button */}
            <button
              onClick={handlePushAllToGoogleSheet}
              disabled={isPushingSheet || !sheetConfig.appsScriptUrl || submissions.length === 0}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                !sheetConfig.appsScriptUrl || submissions.length === 0
                  ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Đẩy tất cả điểm hiện tại trong app lên Google Sheet"
            >
              <UploadCloud className={`w-4 h-4 text-slate-600 ${isPushingSheet ? 'animate-bounce' : ''}`} />
              <span>{isPushingSheet ? 'Đang đẩy...' : 'Đẩy tất cả lên Sheet (Push)'}</span>
            </button>

            {/* Open Google Sheets link */}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg bg-white transition-colors flex items-center gap-1"
            >
              <span>Mở Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Configuration input row */}
        <div className="mt-4 pt-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            URL Google Apps Script Web App:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setTestResult(null);
              }}
              className="flex-1 text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-500 font-mono"
            />
            <button
              onClick={() => handleSaveSheetConfig()}
              disabled={isSavingConfig}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors shrink-0"
            >
              {isSavingConfig ? 'Đang lưu...' : 'Lưu URL'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isTestingConfig || !urlInput.trim()}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConfig ? 'animate-spin' : ''}`} />
              <span>{isTestingConfig ? 'Đang thử...' : 'Kiểm tra kết nối'}</span>
            </button>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Setup Hint */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>
              {sheetConfig.lastSyncTime ? (
                <span>Lần đồng bộ Google Sheet gần nhất: <strong className="text-teal-800">{sheetConfig.lastSyncTime}</strong></span>
              ) : (
                <span>Chưa có lịch sử đồng bộ.</span>
              )}
            </span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="text-teal-700 hover:underline font-semibold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Xem hướng dẫn 3 bước cài đặt Google Sheet mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng học sinh đã nộp</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-formula">
            {submissions.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {lastSyncedAt ? `Đồng bộ máy chủ: ${lastSyncedAt.toLocaleTimeString('vi-VN')}` : 'Đã kết nối'}
          </div>
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

      {/* Export to CSV / Quick Copy Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <span>Công cụ xuất dự phòng offline: Sao chép nhanh bảng tính hoặc tải tệp CSV</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyForGoogleSheets}
            disabled={submissions.length === 0}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              copiedSuccess
                ? 'bg-emerald-700 text-white'
                : submissions.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-800 hover:bg-teal-900 text-white'
            }`}
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? 'Đã sao chép!' : 'Sao chép (Ctrl+V)'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
              submissions.length === 0
                ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                : 'border-slate-300 hover:border-slate-400 bg-white text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Tải CSV / Excel</span>
          </button>
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
                  if (window.confirm('Thầy/Cô có chắc chắn muốn xóa toàn bộ lịch sử điểm số của lớp trên hệ thống?')) {
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
            <p className="text-sm font-semibold text-slate-700">Chưa có bài kiểm tra nào được nộp</p>
            <p className="text-xs text-slate-400 mt-1">
              Khi học sinh hoàn thành bài và bấm "Nộp Bài & Chấm Điểm", kết quả sẽ tự động lưu và đồng bộ lên Google Sheet.
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

      {/* Guide & Apps Script Code Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-300" />
                <h3 className="text-base font-bold">Hướng Dẫn Cài Đặt Google Apps Script & Google Sheet Mẫu</h3>
              </div>
              <button onClick={() => setShowGuideModal(false)} className="text-teal-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
              {/* Quick Downloads Bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm mb-1.5">
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>Tải Về Tệp Mẫu Cài Đặt Sẵn (Một Chạm)</span>
                </div>
                <p className="text-slate-600 mb-3">
                  Thầy/Cô có thể tải trực tiếp file mẫu đã cấu hình sẵn 14 cột điểm và mã nguồn Google Apps Script để cài đặt nhanh chóng:
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDownloadSampleCsv}
                    className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Google Sheets Mẫu (.csv)</span>
                  </button>

                  <button
                    onClick={handleDownloadAppsScript}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Code2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>Tải File Mã Nguồn (Code.gs)</span>
                  </button>

                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-white border border-teal-300 hover:bg-teal-50 text-teal-800 font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Mở sheets.new</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1">
                  Bước 1: Tạo hoặc Nhập Trang Tính Google Sheet
                </div>
                <div className="space-y-2 mt-1.5">
                  <p>
                    <strong>Cách A (Khuyên Dùng):</strong> Bấm nút <strong>"Tải File Google Sheets Mẫu (.csv)"</strong> ở trên. Mở trang{' '}
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 font-bold underline inline-flex items-center gap-0.5"
                    >
                      <span>sheets.new</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    → Vào thanh menu chọn <strong>Tệp (File)</strong> → <strong>Nhập (Import)</strong> → chọn thẻ <strong>Tải lên (Upload)</strong> và chọn file vừa tải. Toàn bộ 14 cột và dữ liệu mẫu sẽ hiển thị ngay lập tức!
                  </p>
                  <p>
                    <strong>Cách B:</strong> Mở một Google Sheet trống bất kỳ, đặt tên trang tính (ví dụ: <em>"So_Diem_Hoa_Hoc_11_Can_Bang"</em>).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1">
                  Bước 2: Mở Apps Script & Dán mã nguồn đồng bộ 2 chiều
                </div>
                <p className="mb-2">
                  Trên thanh menu của Google Sheet, chọn: <strong>Tiện ích mở rộng (Extensions)</strong> →{' '}
                  <strong>Apps Script</strong>.
                  Xoá toàn bộ nội dung trong tệp <code>Code.gs</code> và dán đoạn mã bên dưới vào:
                </p>

                <div className="relative">
                  <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-3 py-1.5 rounded-t-lg text-[11px] font-mono">
                    <span>Code.gs (Hỗ trợ 2 chiều: tự ghi nhận khi HS nộp & tự trả kết quả khi GV đăng nhập)</span>
                    <button
                      onClick={handleCopyAppsScript}
                      className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-600 text-white font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép toàn bộ mã'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-b-lg overflow-x-auto max-h-48 leading-tight">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1">
                  Bước 3: Triển khai dưới dạng Ứng dụng web (Deploy as Web App)
                </div>
                <ol className="list-decimal list-inside space-y-1.5 mt-2">
                  <li>Bấm nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải → chọn <strong>Lần triển khai mới (New deployment)</strong>.</li>
                  <li>Bấm vào biểu tượng bánh răng chọn loại: <strong>Ứng dụng web (Web app)</strong>.</li>
                  <li>Mô tả: <em>"Đồng bộ sổ điểm Hoá 11"</em>.</li>
                  <li>Thực thi dưới dạng: <strong>Tôi (My account)</strong>.</li>
                  <li>
                    Ai có quyền truy cập (Who has access): Chọn <strong>Bất kỳ ai (Anyone)</strong>.
                  </li>
                  <li>Bấm <strong>Triển khai (Deploy)</strong> → Chọn tài khoản và Cấp quyền truy cập cho Google Sheet của bạn.</li>
                  <li>
                    Sao chép <strong>URL Ứng dụng web (Web app URL)</strong> nhận được (kết thúc bằng <code>/exec</code>) và dán vào ô <em>"URL Google Apps Script Web App"</em> ngoài Sổ điểm!
                  </li>
                </ol>
              </div>

              {/* Live Preview of Google Sheet Template */}
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">Bản Xem Trước Trang Tính Mẫu (Google Sheets Preview):</h4>
                  <button
                    onClick={handleDownloadSampleCsv}
                    className="text-teal-700 hover:underline font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải tệp này (.csv)</span>
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-teal-800 text-white font-bold">
                        {SHEET_COLUMNS_INFO.map((col) => (
                          <th key={col.index} className="py-2 px-2.5 whitespace-nowrap border-r border-teal-700 text-center">
                            {col.name} ({col.index})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                      {SAMPLE_SHEET_PREVIEW_ROWS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-teal-50/50">
                          <td className="py-2 px-2 whitespace-nowrap">{row.submittedAt}</td>
                          <td className="py-2 px-2 font-bold text-slate-700">{row.studentId}</td>
                          <td className="py-2 px-2 font-bold font-sans text-slate-900">{row.fullName}</td>
                          <td className="py-2 px-2 text-teal-800 font-bold">{row.classGroup}</td>
                          <td className="py-2 px-2 font-sans">{row.schoolName}</td>
                          <td className="py-2 px-2 font-bold text-center text-teal-700">{row.scoreScale10}</td>
                          <td className="py-2 px-2 text-center">{row.scoreScale100}</td>
                          <td className="py-2 px-2 text-center">{row.totalCorrect}</td>
                          <td className="py-2 px-2 text-center">{row.nhanBiet}</td>
                          <td className="py-2 px-2 text-center">{row.thongHieu}</td>
                          <td className="py-2 px-2 text-center">{row.vanDung}</td>
                          <td className="py-2 px-2 font-sans font-bold text-center text-emerald-800">{row.rankBadge}</td>
                          <td className="py-2 px-2 whitespace-nowrap">{row.duration}</td>
                          <td className="py-2 px-2 text-slate-400">{row.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Columns reference */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Chi tiết giải nghĩa 14 cột tiêu chuẩn:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHEET_COLUMNS_INFO.map((col) => (
                    <div key={col.index} className="p-2 border border-slate-200 rounded-md bg-slate-50">
                      <strong className="text-teal-800">Cột {col.index}:</strong> {col.name}
                      <span className="block text-[10px] text-slate-400 mt-0.5">{col.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors"
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
