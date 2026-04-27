export interface ScanHistoryItem {
  address: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

const STORAGE_KEY = 'clarix_scan_history';

export const historyService = {
  getHistory(): ScanHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveScan(item: ScanHistoryItem): void {
    try {
      const history = this.getHistory();
      // Remove previous scan of the same address if it exists
      const filtered = history.filter(h => h.address !== item.address);
      // Prepend the new scan
      filtered.unshift(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
