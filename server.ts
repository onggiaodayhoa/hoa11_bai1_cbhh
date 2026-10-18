import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'submissions.json');
const CONFIG_FILE = path.join(DATA_DIR, 'sheet-config.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]), 'utf-8');
}
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify({ appsScriptUrl: '', autoSync: true, lastSyncTime: null }, null, 2),
    'utf-8'
  );
}

app.use(express.json({ limit: '10mb' }));

// In-memory / file backed store
function readSubmissions(): any[] {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeSubmissions(data: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write submissions:', err);
  }
}

function readSheetConfig(): { appsScriptUrl: string; autoSync: boolean; lastSyncTime: string | null } {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { appsScriptUrl: '', autoSync: true, lastSyncTime: null };
  }
}

function writeSheetConfig(config: { appsScriptUrl: string; autoSync: boolean; lastSyncTime: string | null }) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write sheet config:', err);
  }
}

// SSE Clients for real-time 2-way sync
interface SSEClient {
  id: number;
  res: Response;
}
let sseClients: SSEClient[] = [];
let nextClientId = 1;

function broadcastSSE(event: string, payload: any) {
  const data = JSON.stringify({ event, payload, timestamp: Date.now() });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // Ignore
    }
  });
}

// Heartbeat every 20 seconds
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.res.write(': heartbeat\n\n');
    } catch {
      // Ignore
    }
  });
}, 20000);

// --- API Endpoints ---

// 1. Get all submissions (sync when teacher logs in or student mounts)
app.get('/api/submissions', (_req: Request, res: Response) => {
  const submissions = readSubmissions();
  res.json({ success: true, submissions });
});

// 2. Submit student test (sync to server, broadcast to teacher, and forward to Google Sheet)
app.post('/api/submissions', async (req: Request, res: Response) => {
  const newSubmission = req.body;
  if (!newSubmission || !newSubmission.student) {
    return res.status(400).json({ error: 'Dữ liệu bài làm không hợp lệ' });
  }

  const current = readSubmissions();
  // Filter out any duplicate with same ID
  const filtered = current.filter((s: any) => s.id !== newSubmission.id);
  const updated = [newSubmission, ...filtered];
  writeSubmissions(updated);

  // Broadcast to all connected clients
  broadcastSSE('SUBMISSION_ADDED', newSubmission);

  // Forward to Google Apps Script Web App in background if configured
  const sheetConfig = readSheetConfig();
  if (sheetConfig.appsScriptUrl && sheetConfig.appsScriptUrl.trim() && sheetConfig.autoSync) {
    fetch(sheetConfig.appsScriptUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission: newSubmission }),
      redirect: 'follow',
    })
      .then(async (sheetRes) => {
        if (sheetRes.ok) {
          const cfg = readSheetConfig();
          cfg.lastSyncTime = new Date().toLocaleString('vi-VN');
          writeSheetConfig(cfg);
        }
      })
      .catch((err) => {
        console.warn('Auto forward to Google Sheet error:', err.message);
      });
  }

  return res.json({ success: true, submission: newSubmission, total: updated.length });
});

// 3. Delete single submission
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const current = readSubmissions();
  const updated = current.filter((s: any) => s.id !== id);
  writeSubmissions(updated);

  broadcastSSE('SUBMISSION_DELETED', { id });
  return res.json({ success: true, id, total: updated.length });
});

// 4. Clear all submissions
app.delete('/api/submissions', (_req: Request, res: Response) => {
  writeSubmissions([]);
  broadcastSSE('SUBMISSIONS_CLEARED', {});
  return res.json({ success: true, total: 0 });
});

// 5. Google Sheets 2-way sync endpoints:
// 5a. Get Google Sheets config
app.get('/api/googlesheet/config', (_req: Request, res: Response) => {
  const config = readSheetConfig();
  res.json({ success: true, config });
});

// 5b. Update Google Sheets config
app.post('/api/googlesheet/config', (req: Request, res: Response) => {
  let { appsScriptUrl, autoSync } = req.body;
  const current = readSheetConfig();

  let cleanUrl = typeof appsScriptUrl === 'string' ? appsScriptUrl.trim().replace(/^["'`]|["'`]$/g, '').trim() : current.appsScriptUrl;
  
  // Auto-convert /edit to /exec if Apps Script URL
  if (cleanUrl.includes('script.google.com') && cleanUrl.endsWith('/edit')) {
    cleanUrl = cleanUrl.replace(/\/edit$/, '/exec');
  }

  const updated = {
    appsScriptUrl: cleanUrl,
    autoSync: typeof autoSync === 'boolean' ? autoSync : current.autoSync,
    lastSyncTime: current.lastSyncTime,
  };
  writeSheetConfig(updated);
  broadcastSSE('CONFIG_UPDATED', updated);
  return res.json({ success: true, config: updated });
});

// 5c. Test Google Sheet connection
app.post('/api/googlesheet/test', async (req: Request, res: Response) => {
  let targetUrl = req.body.appsScriptUrl || readSheetConfig().appsScriptUrl;
  if (!targetUrl || !targetUrl.trim()) {
    return res.status(400).json({ success: false, error: 'Chưa cung cấp URL Google Apps Script Web App' });
  }

  let cleanUrl = targetUrl.trim().replace(/^["'`]|["'`]$/g, '').trim();
  if (cleanUrl.includes('script.google.com') && cleanUrl.endsWith('/edit')) {
    cleanUrl = cleanUrl.replace(/\/edit$/, '/exec');
  }

  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return res.status(400).json({
      success: false,
      error: 'Đây là link file bảng tính Google Sheet, không phải Web App! Vui lòng vào Tiện ích mở rộng -> Apps Script -> Triển khai -> Lần triển khai mới -> Chọn Ứng dụng web để lấy link có đuôi /exec.',
    });
  }

  try {
    const response = await fetch(cleanUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const responseText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Not pure JSON
    }

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: `Google Apps Script phản hồi mã lỗi HTTP ${response.status}`,
      });
    }

    // Check if Google redirected to a login page (common when deployment permission is not "Anyone")
    if (responseText.includes('accounts.google.com') || responseText.includes('ServiceLogin') || (responseText.includes('<html') && !data)) {
      return res.status(400).json({
        success: false,
        error: 'Google Apps Script đang yêu cầu đăng nhập tài khoản. Vui lòng vào Apps Script -> Triển khai lại (Manage deployments) -> Chọn "Ai có quyền truy cập" là "Bất kỳ ai (Anyone)" thay vì "Chỉ mình tôi".',
      });
    }

    return res.json({
      success: true,
      message: 'Kết nối Google Apps Script thành công! Web App phản hồi tốt và sẵn sàng đồng bộ 2 chiều.',
      data: data || { status: 'ok', preview: responseText.slice(0, 100) },
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: `Không thể kết nối đến URL Web App: ${err.message}`,
    });
  }
});

// 5d. Pull data from Google Sheet (2-way sync when teacher logs in or requests refresh)
app.post('/api/googlesheet/pull', async (_req: Request, res: Response) => {
  const config = readSheetConfig();
  if (!config.appsScriptUrl || !config.appsScriptUrl.trim()) {
    return res.status(400).json({ success: false, error: 'Chưa cấu hình URL Google Apps Script' });
  }

  try {
    const response = await fetch(config.appsScriptUrl.trim(), {
      method: 'GET',
      redirect: 'follow',
    });
    if (!response.ok) {
      return res.status(400).json({ success: false, error: `Lỗi kết nối Google Sheet (HTTP ${response.status})` });
    }

    const data = await response.json();
    const sheetSubmissions = Array.isArray(data.submissions) ? data.submissions : [];

    // Merge with current local submissions
    const local = readSubmissions();
    const mergedMap = new Map<string, any>();

    // Put sheet submissions
    sheetSubmissions.forEach((sub: any) => {
      if (sub.id) mergedMap.set(sub.id, sub);
    });

    // Merge local submissions that might be newer or not yet in sheet
    local.forEach((sub: any) => {
      if (sub.id && !mergedMap.has(sub.id)) {
        mergedMap.set(sub.id, sub);
      }
    });

    const mergedList = Array.from(mergedMap.values());
    writeSubmissions(mergedList);

    // Update last sync time
    config.lastSyncTime = new Date().toLocaleString('vi-VN');
    writeSheetConfig(config);

    // Broadcast full sync to connected teacher sessions
    broadcastSSE('SUBMISSIONS_SYNCED', mergedList);

    return res.json({
      success: true,
      submissions: mergedList,
      totalFromSheet: sheetSubmissions.length,
      lastSyncTime: config.lastSyncTime,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: `Lỗi đồng bộ từ Google Sheet: ${err.message}` });
  }
});

// 5e. Push all local submissions to Google Sheet
app.post('/api/googlesheet/push-all', async (_req: Request, res: Response) => {
  const config = readSheetConfig();
  if (!config.appsScriptUrl || !config.appsScriptUrl.trim()) {
    return res.status(400).json({ success: false, error: 'Chưa cấu hình URL Google Apps Script' });
  }

  const submissions = readSubmissions();
  if (submissions.length === 0) {
    return res.json({ success: true, count: 0, message: 'Không có dữ liệu bài nộp nào cần đẩy' });
  }

  try {
    let successCount = 0;
    for (const sub of submissions) {
      try {
        await fetch(config.appsScriptUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submission: sub }),
          redirect: 'follow',
        });
        successCount++;
      } catch {
        // Continue with others
      }
    }

    config.lastSyncTime = new Date().toLocaleString('vi-VN');
    writeSheetConfig(config);

    return res.json({ success: true, successCount, total: submissions.length, lastSyncTime: config.lastSyncTime });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: `Lỗi đẩy dữ liệu sang Google Sheet: ${err.message}` });
  }
});

// 6. SSE stream for 2-way real-time events
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = nextClientId++;
  const client: SSEClient = { id: clientId, res };
  sseClients.push(client);

  // Send initial connection event with current count
  const count = readSubmissions().length;
  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', total: count, timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// --- Server Frontend Integration ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Fallback
      app.use(express.static(__dirname));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Full-Stack Server with Google Sheets sync running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
