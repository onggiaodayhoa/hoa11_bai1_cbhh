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

  // 5. Google Sheets 2-way sync methods
  async getSheetConfig(): Promise<GoogleSheetConfig> {
    try {
      const res = await fetch('/api/googlesheet/config');
      if (!res.ok) throw new Error('Failed to get sheet config');
      const data = await res.json();
      return data.config;
    } catch {
      return { appsScriptUrl: '', autoSync: true, lastSyncTime: null };
    }
  }

  async saveSheetConfig(appsScriptUrl: string, autoSync: boolean): Promise<GoogleSheetConfig | null> {
    try {
      const res = await fetch('/api/googlesheet/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl, autoSync }),
      });
      if (!res.ok) throw new Error('Failed to save sheet config');
      const data = await res.json();
      return data.config;
    } catch {
      return null;
    }
  }

  async testSheetConnection(appsScriptUrl: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch('/api/googlesheet/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.error || 'Không thể kết nối đến Google Sheet' };
      }
      return { success: true, message: data.message || 'Kết nối Google Sheet thành công!', data: data.data };
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối' };
    }
  }

  async pullFromSheet(): Promise<{ success: boolean; submissions?: TestSubmission[]; error?: string }> {
    try {
      const res = await fetch('/api/googlesheet/pull', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Lỗi đồng bộ từ Google Sheet' };
      }
      return { success: true, submissions: data.submissions };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng khi đồng bộ từ Google Sheet' };
    }
  }

  async pushAllToSheet(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const res = await fetch('/api/googlesheet/push-all', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Lỗi đẩy dữ liệu sang Google Sheet' };
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
