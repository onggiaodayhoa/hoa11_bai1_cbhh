/**
 * =========================================================================
 * GOOGLE APPS SCRIPT & GOOGLE SHEETS TEMPLATE CHO SỔ ĐIỂM HOÁ HỌC 11 (GDPT 2018)
 * Hỗ trợ đồng bộ 2 chiều tự động:
 * 1. Học sinh nộp bài -> tự động ghi/cập nhật vào Google Sheet
 * 2. Giáo viên đăng nhập -> tự động kéo dữ liệu từ Google Sheet về Sổ Điểm
 * =========================================================================
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * HỆ THỐNG ĐỒNG BỘ 2 CHIỀU SỔ ĐIỂM HOÁ HỌC 11 - GDPT 2018
 * Chuyên đề: Cân Bằng Hoá Học (Phản ứng thuận nghịch, Hằng số Kc, Le Chatelier)
 * =========================================================================
 */

// Tiêu đề chuẩn 14 cột của Sổ Điểm Google Sheet
var SHEET_HEADERS = [
  "Thời Điểm Nộp",
  "Mã HS / SBD",
  "Họ Và Tên",
  "Lớp",
  "Trường",
  "Điểm Thang 10",
  "Điểm Thang 100",
  "Số Câu Đúng",
  "Nhận Biết (%)",
  "Thông Hiểu (%)",
  "Vận Dụng (%)",
  "Xếp Loại",
  "Thời Gian Làm",
  "ID Bài Làm"
];

/**
 * Tự động tạo và định dạng cấu trúc bảng tính chuẩn giáo dục
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    var range = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
    range.setBackground("#0f766e"); // Màu Teal đậm chuẩn học đường
    range.setFontColor("#ffffff");
    range.setFontWeight("bold");
    range.setHorizontalAlignment("center");
    range.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);
    
    // Tự động căn chỉnh độ rộng các cột
    for (var col = 1; col <= SHEET_HEADERS.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }
  return sheet;
}

/**
 * 1. doGet: Được gọi khi giáo viên đăng nhập hoặc mở sổ điểm trong app
 * Trả về danh sách toàn bộ kết quả học sinh trong Google Sheet (JSON)
 */
function doGet(e) {
  try {
    var sheet = setupSheet();
    
    // Hỗ trợ fallback nộp bài qua GET query params nếu mạng hoặc proxy chuyển tiếp
    if (e && e.parameter && (e.parameter.action === "submit" || e.parameter.data)) {
      var rawPayload = e.parameter.data || e.parameter.submission;
      if (rawPayload) {
        var subData = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;
        return saveSubmissionToSheet(sheet, subData);
      }
    }
    
    var data = sheet.getDataRange().getValues();
    var submissions = [];
    
    if (data.length > 1) {
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[1] && !row[2]) continue; // Bỏ qua dòng trống
        
        var nhanBietVal = parseInt(String(row[8]).replace('%', '')) || 0;
        var thongHieuVal = parseInt(String(row[9]).replace('%', '')) || 0;
        var vanDungVal = parseInt(String(row[10]).replace('%', '')) || 0;
        
        var totalCorrectStr = String(row[7] || "");
        var correctMatch = totalCorrectStr.match(/(\\d+)/);
        var totalCorrectNum = correctMatch ? parseInt(correctMatch[1]) : Math.round((Number(row[5]) || 0) * 4.5);
        
        submissions.push({
          id: row[13] ? String(row[13]) : ("sheet_row_" + i),
          submittedAt: row[0] ? String(row[0]) : "",
          student: {
            studentId: String(row[1] || ""),
            fullName: String(row[2] || ""),
            classGroup: String(row[3] || ""),
            schoolName: String(row[4] || "Trường THPT"),
            mode: "exam"
          },
          scoreScale10: Number(row[5]) || 0,
          scoreScale100: Number(row[6]) || 0,
          totalCorrect: totalCorrectNum,
          totalBlanks: 45,
          levelStats: {
            nhan_biet: { total: 19, correct: Math.round((nhanBietVal * 19) / 100), percent: nhanBietVal },
            thong_hieu: { total: 13, correct: Math.round((thongHieuVal * 13) / 100), percent: thongHieuVal },
            van_dung: { total: 13, correct: Math.round((vanDungVal * 13) / 100), percent: vanDungVal }
          },
          rankBadge: String(row[11] || "Khá"),
          durationSeconds: 0,
          durationText: String(row[12] || ""),
          exerciseResults: [],
          teacherFeedback: "Đã đồng bộ từ Google Sheet"
        });
      }
    }
    
    var output = {
      status: "ok",
      total: submissions.length,
      submissions: submissions,
      syncedAt: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss")
    };
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 2. doPost: Tự động gọi khi học sinh nộp bài
 * Tự động ghi nhận bài làm mới hoặc cập nhật bài nộp đã có (idempotent)
 */
function doPost(e) {
  try {
    var sheet = setupSheet();
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    
    var sub = body.submission || body;
    return saveSubmissionToSheet(sheet, sub);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Hàm ghi hoặc cập nhật bài thi vào Google Sheet
 */
function saveSubmissionToSheet(sheet, sub) {
  if (!sub || !sub.student) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Dữ liệu học sinh không hợp lệ"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var duration = "";
  if (sub.durationSeconds) {
    var m = Math.floor(sub.durationSeconds / 60);
    var s = sub.durationSeconds % 60;
    duration = m + "p " + (s < 10 ? "0" : "") + s + "s";
  } else {
    duration = sub.durationText || "";
  }
  
  var subId = sub.id || ("sub_" + Date.now());
  
  var rowData = [
    sub.submittedAt || Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy, HH:mm:ss"),
    sub.student ? sub.student.studentId : "",
    sub.student ? sub.student.fullName : "",
    sub.student ? sub.student.classGroup : "",
    sub.student ? sub.student.schoolName : "",
    sub.scoreScale10 !== undefined ? Number(sub.scoreScale10).toFixed(1) : "0.0",
    sub.scoreScale100 !== undefined ? sub.scoreScale100 : 0,
    sub.totalCorrect !== undefined ? (sub.totalCorrect + "/" + (sub.totalBlanks || 45)) : "",
    sub.levelStats && sub.levelStats.nhan_biet ? sub.levelStats.nhan_biet.percent + "%" : "0%",
    sub.levelStats && sub.levelStats.thong_hieu ? sub.levelStats.thong_hieu.percent + "%" : "0%",
    sub.levelStats && sub.levelStats.van_dung ? sub.levelStats.van_dung.percent + "%" : "0%",
    sub.rankBadge || "",
    duration,
    subId
  ];
  
  // Kiểm tra xem ID bài làm đã có trong Sheet chưa (tránh trùng lặp)
  var data = sheet.getDataRange().getValues();
  var existingRowIndex = -1;
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][13]) === String(subId)) {
      existingRowIndex = r + 1; // 1-based index
      break;
    }
  }
  
  if (existingRowIndex > 0) {
    // Cập nhật hàng đã có
    sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // Thêm hàng mới vào cuối
    sheet.appendRow(rowData);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Đã đồng bộ vào Google Sheet thành công!",
    id: subId,
    student: sub.student ? sub.student.fullName : "",
    score: sub.scoreScale10
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tiện ích: Tạo dữ liệu mẫu trực tiếp từ Apps Script để giáo viên kiểm tra ngay
 */
function createSampleData() {
  var sheet = setupSheet();
  var sampleRows = [
    ["18/10/2026, 08:30:15", "HS-1101", "Trần Minh Quân", "11A1", "THPT Chuyên", 9.6, 96, "43/45", "100%", "92%", "92%", "Xuất sắc", "14p 20s", "sample_demo_1"],
    ["18/10/2026, 08:45:22", "HS-1102", "Lê Thu Hà", "11A1", "THPT Chuyên", 8.4, 84, "38/45", "95%", "85%", "77%", "Giỏi", "16p 10s", "sample_demo_2"],
    ["18/10/2026, 09:05:00", "HS-1103", "Nguyễn Hoàng Nam", "11A2", "THPT Cầu Giấy", 7.1, 71, "32/45", "84%", "69%", "62%", "Khá", "18p 45s", "sample_demo_3"]
  ];
  
  for (var i = 0; i < sampleRows.length; i++) {
    sheet.appendRow(sampleRows[i]);
  }
  Logger.log("Đã chèn " + sampleRows.length + " hàng dữ liệu mẫu vào trang tính.");
}
`;

export const SHEET_COLUMNS_INFO = [
  { index: 'A', name: 'Thời Điểm Nộp', desc: 'Ngày giờ học sinh nộp bài (dd/MM/yyyy, HH:mm:ss)' },
  { index: 'B', name: 'Mã HS / SBD', desc: 'Mã số học sinh hoặc Số báo danh' },
  { index: 'C', name: 'Họ Và Tên', desc: 'Họ tên đầy đủ của học sinh' },
  { index: 'D', name: 'Lớp', desc: 'Lớp học (Ví dụ: 11A1, 11A2)' },
  { index: 'E', name: 'Trường', desc: 'Tên trường THPT' },
  { index: 'F', name: 'Điểm Thang 10', desc: 'Điểm tổng kết chuẩn thang 10 (làm tròn 1 chữ số)' },
  { index: 'G', name: 'Điểm Thang 100', desc: 'Tỷ lệ % tổng số ô điền đúng' },
  { index: 'H', name: 'Số Câu Đúng', desc: 'Số ô điền đúng / tổng 45 ô' },
  { index: 'I', name: 'Nhận Biết (%)', desc: 'Tỷ lệ đạt chuẩn nhận biết (Thuận nghịch & Kc)' },
  { index: 'J', name: 'Thông Hiểu (%)', desc: 'Tỷ lệ đạt chuẩn thông hiểu (Thí nghiệm NO2 & CH3COONa)' },
  { index: 'K', name: 'Vận Dụng (%)', desc: 'Tỷ lệ đạt chuẩn vận dụng (Nguyên lí Le Chatelier)' },
  { index: 'L', name: 'Xếp Loại', desc: 'Xuất sắc / Giỏi / Khá / Trung bình / Cần cố gắng' },
  { index: 'M', name: 'Thời Gian Làm', desc: 'Thời lượng hoàn thành bài thi' },
  { index: 'N', name: 'ID Bài Làm', desc: 'Mã định danh duy nhất của bài làm (tránh ghi đè trùng lặp)' },
];

/**
 * Dữ liệu xem trước trang tính mẫu
 */
export const SAMPLE_SHEET_PREVIEW_ROWS = [
  {
    submittedAt: '18/10/2026, 08:30:15',
    studentId: 'HS-1101',
    fullName: 'Trần Minh Quân',
    classGroup: '11A1',
    schoolName: 'THPT Chu Văn An',
    scoreScale10: '9.6',
    scoreScale100: '96%',
    totalCorrect: '43/45',
    nhanBiet: '100%',
    thongHieu: '92%',
    vanDung: '92%',
    rankBadge: 'Xuất sắc',
    duration: '14p 20s',
    id: 'sample_id_101',
  },
  {
    submittedAt: '18/10/2026, 08:45:22',
    studentId: 'HS-1102',
    fullName: 'Lê Thu Hà',
    classGroup: '11A1',
    schoolName: 'THPT Chu Văn An',
    scoreScale10: '8.4',
    scoreScale100: '84%',
    totalCorrect: '38/45',
    nhanBiet: '95%',
    thongHieu: '85%',
    vanDung: '77%',
    rankBadge: 'Giỏi',
    duration: '16p 10s',
    id: 'sample_id_102',
  },
  {
    submittedAt: '18/10/2026, 09:12:40',
    studentId: 'HS-1103',
    fullName: 'Nguyễn Hoàng Nam',
    classGroup: '11A2',
    schoolName: 'THPT Kim Liên',
    scoreScale10: '7.1',
    scoreScale100: '71%',
    totalCorrect: '32/45',
    nhanBiet: '84%',
    thongHieu: '69%',
    vanDung: '62%',
    rankBadge: 'Khá',
    duration: '18p 45s',
    id: 'sample_id_103',
  },
];

/**
 * Tạo nội dung file CSV mẫu (UTF-8 BOM) để giáo viên tải về và nhập vào Google Sheets
 */
export function generateSampleSheetCsv(): string {
  const headers = SHEET_COLUMNS_INFO.map((c) => `"${c.name}"`).join(',');
  const rows = SAMPLE_SHEET_PREVIEW_ROWS.map((r) =>
    [
      `"${r.submittedAt}"`,
      `"${r.studentId}"`,
      `"${r.fullName}"`,
      `"${r.classGroup}"`,
      `"${r.schoolName}"`,
      r.scoreScale10,
      r.scoreScale100.replace('%', ''),
      `"${r.totalCorrect}"`,
      `"${r.nhanBiet}"`,
      `"${r.thongHieu}"`,
      `"${r.vanDung}"`,
      `"${r.rankBadge}"`,
      `"${r.duration}"`,
      `"${r.id}"`,
    ].join(',')
  );

  return '\uFEFF' + [headers, ...rows].join('\r\n');
}

/**
 * Tiện ích tải file mẫu Google Sheets (.csv)
 */
export function downloadSampleGoogleSheetCsv() {
  const csvContent = generateSampleSheetCsv();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mau_Google_Sheets_So_Diem_Hoa_11.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Tiện ích tải file mã nguồn Google Apps Script (Code.gs)
 */
export function downloadGoogleAppsScriptCode() {
  const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Code.gs';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
