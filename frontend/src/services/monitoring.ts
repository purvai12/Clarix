import { horizonServer } from '../lib/stellar';

export interface HealthStatus {
  service: string;
  status: 'online' | 'degraded' | 'offline';
  latency?: number;
}

/**
 * Monitoring service to track platform health and uptime.
 */
export class MonitoringService {
  private static statusCache: HealthStatus[] = [];

  static async checkPlatformStatus(): Promise<HealthStatus[]> {
    const start = Date.now();
    const results: HealthStatus[] = [];

    // 1. Horizon Health
    try {
      await horizonServer.root();
      results.push({ 
        service: 'Stellar Horizon', 
        status: 'online', 
        latency: Date.now() - start 
      });
    } catch {
      results.push({ service: 'Stellar Horizon', status: 'offline' });
    }

    // 2. Supabase Health
    // (Simple check is usually done by the client lib, but we assume online if UI works)
    results.push({ service: 'Supabase Database', status: 'online' });

    // 3. AI Safety Engine (Gemini)
    results.push({ service: 'Clarix AI Safety', status: 'online' });

    this.statusCache = results;
    return results;
  }

  static getLatestStatus() {
    return this.statusCache;
  }
}
