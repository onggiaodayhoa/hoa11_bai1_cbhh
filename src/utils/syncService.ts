import { TestSubmission } from '../types/chemistry';

export type SyncEventType =
  | 'SUBMISSION_ADDED'
  | 'SUBMISSION_DELETED'
  | 'SUBMISSIONS_CLEARED'
  | 'SUBMISSIONS_SYNCED'
  | 'CONNECTED';

export interface SyncEventPayload {
  event: SyncEventType;
  payload?: any;
  timestamp: number;
}

export interface GoogleSheetConfig {
  appsScriptUrl: string;
  autoSync: boolean;
  lastSyncTime: string | null;
}

class SyncService {
  private eventSource: EventSource | null = null;
  private isConnecting: boolean = false;
  private listeners: ((event: SyncEventPayload) => void)[] = [];
  private pollInterval: NodeJS.Timeout | null = null;

  // 1. Fetch all submissions from server
  async fetchAllSubmissions(): Promise<TestSubmission[]> {
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      return Array.isArray(data.submissions) ? data.submissions : [];
    } catch (err) {
      console.warn('SyncService: using local cache due to network status', err);
      try {
        const cached = localStorage.getItem('chemistry_all_submissions');
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
  }

  // 2. Post new student submission to server
  async submitTest(submission: TestSubmission): Promise<boolean> {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
      return res.ok;
    } catch (err) {
      console.error('SyncService: failed to post submission to server', err);
      return false;
    }
  }

  // 3. Delete single submission
  async deleteSubmission(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // 4. Clear all submissions
  async clearAll(): Promise<boolean> {
    try {
      const res = await fetch('/api/submissions', {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // 5. Google Sheets 2-way sync methods with robust local & server persistence
  async getSheetConfig(): Promise<GoogleSheetConfig> {
    let localUrl = '';
    let localAutoSync = true;
    let localLastSync: string | null = null;
    try {
      localUrl = localStorage.getItem('chemistry_google_apps_script_url') || '';
      const rawConfig = localStorage.getItem('chemistry_sheet_config');
      if (rawConfig) {
        const parsed = JSON.parse(rawConfig);
        if (typeof parsed.appsScriptUrl === 'string') localUrl = parsed.appsScriptUrl;
        if (typeof parsed.autoSync === 'boolean') localAutoSync = parsed.autoSync;
        if (parsed.lastSyncTime) localLastSync = parsed.lastSyncTime;
      }
    } catch {
      // Ignore localStorage errors
    }

    try {
      const res = await fetch('/api/googlesheet/config');
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Fallback
      }

      if (data && data.config) {
        const serverConfig: GoogleSheetConfig = data.config;
        if (!serverConfig.appsScriptUrl && localUrl) {
          serverConfig.appsScriptUrl = localUrl;
          this.saveSheetConfig(localUrl, localAutoSync).catch(() => {});
        } else if (serverConfig.appsScriptUrl) {
          try {
            localStorage.setItem('chemistry_google_apps_script_url', serverConfig.appsScriptUrl);
            localStorage.setItem('chemistry_sheet_config', JSON.stringify(serverConfig));
          } catch {
            // Ignore
          }
        }
        return serverConfig;
      }
      return { appsScriptUrl: localUrl, autoSync: localAutoSync, lastSyncTime: localLastSync };
    } catch {
      return { appsScriptUrl: localUrl, autoSync: localAutoSync, lastSyncTime: localLastSync };
    }
  }

  async saveSheetConfig(appsScriptUrl: string, autoSync: boolean): Promise<GoogleSheetConfig | null> {
    const trimmed = (appsScriptUrl || '').trim();
    // 1. Immediately save to localStorage for client-side persistence
    try {
      localStorage.setItem('chemistry_google_apps_script_url', trimmed);
      localStorage.setItem(
        'chemistry_sheet_config',
        JSON.stringify({ appsScriptUrl: trimmed, autoSync, lastSyncTime: new Date().toLocaleString('vi-VN') })
      );
    } catch {
      // Ignore
    }

    // 2. Persist to server backend
    try {
      const res = await fetch('/api/googlesheet/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl: trimmed, autoSync }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Không thể lưu cấu hình (Mã lỗi ${res.status})`);
      }
      return data.config;
    } catch (err: any) {
      console.warn('Backend sheet config save error:', err?.message);
      // Return local fallback so user does not experience a failure
      return { appsScriptUrl: trimmed, autoSync, lastSyncTime: null };
    }
  }

  async testSheetConnection(appsScriptUrl: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch('/api/googlesheet/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || (text.includes('<html') ? 'Máy chủ phản hồi trang web thay vì dữ liệu JSON' : text) || 'Không thể kết nối đến Google Sheet';
        return { success: false, message: errorMsg };
      }
      return { success: true, message: data.message || 'Kết nối Google Sheet thành công!', data: data.data };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối mạng' };
    }
  }

  async pullFromSheet(): Promise<{ success: boolean; submissions?: TestSubmission[]; error?: string }> {
    try {
      const res = await fetch('/api/googlesheet/pull', { method: 'POST' });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || (text.includes('<html') ? 'Máy chủ phản hồi mã lỗi trang web thay vì dữ liệu JSON' : text) || 'Lỗi đồng bộ từ Google Sheet';
        return { success: false, error: errorMsg };
      }
      return { success: true, submissions: data.submissions };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng khi đồng bộ từ Google Sheet' };
    }
  }

  async pushAllToSheet(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const res = await fetch('/api/googlesheet/push-all', { method: 'POST' });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.error || (text.includes('<html') ? 'Lỗi máy chủ khi đẩy dữ liệu' : text) || 'Lỗi đẩy dữ liệu sang Google Sheet';
        return { success: false, error: errorMsg };
      }
      return { success: true, count: data.successCount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng khi đẩy dữ liệu sang Google Sheet' };
    }
  }

  // 6. Connect Real-time SSE Stream (2-way sync)
  connectRealtime(onEvent: (event: SyncEventPayload) => void) {
    this.listeners.push(onEvent);

    if (this.eventSource || this.isConnecting) {
      return () => {
        this.listeners = this.listeners.filter((l) => l !== onEvent);
      };
    }

    this.isConnecting = true;
    try {
      const es = new EventSource('/api/events');
      this.eventSource = es;

      es.onopen = () => {
        this.isConnecting = false;
      };

      es.onmessage = (e) => {
        try {
          if (!e.data || e.data.startsWith(':')) return; // ignore heartbeat comments
          const parsed = JSON.parse(e.data) as SyncEventPayload;
          this.listeners.forEach((l) => l(parsed));
        } catch {
          // Ignore
        }
      };

      es.onerror = () => {
        this.disconnectSSE();
        this.isConnecting = false;
        setTimeout(() => {
          if (this.listeners.length > 0) {
            this.connectRealtime(this.listeners[0]);
          }
        }, 3000);
      };
    } catch {
      this.isConnecting = false;
    }

    // Start background sync poll as secondary safety net
    if (!this.pollInterval) {
      this.pollInterval = setInterval(async () => {
        const latest = await this.fetchAllSubmissions();
        this.listeners.forEach((l) =>
          l({
            event: 'CONNECTED',
            payload: latest,
            timestamp: Date.now(),
          })
        );
      }, 10000);
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== onEvent);
      if (this.listeners.length === 0) {
        this.disconnectSSE();
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      }
    };
  }

  private disconnectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const syncService = new SyncService();
