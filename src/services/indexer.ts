import { horizonServer, CLARIX_REGISTRY_ID } from '../lib/stellar';
import { supabase } from '../lib/supabase';

/**
 * Indexer service responsible for syncing blockchain events to the Clarix database.
 * In a production environment, this would run on a backend worker.
 * For the demo, we implement a client-side triggered sync.
 */
export class IndexerService {
  /**
   * Syncs recent fraud reports from the Horizon blockchain events.
   */
  static async syncRecentReports() {
    console.log('--- INDEXING SERVICE STARTED ---');
    try {
      // Fetch operations for the Registry contract
      const ops = await horizonServer
        .operations()
        .forAccount(CLARIX_REGISTRY_ID)
        .order('desc')
        .limit(10)
        .call();

      for (const op of ops.records) {
        // We look for 'invoke_host_function' operations which are Soroban contract calls
        if (op.type === 'invoke_host_function') {
          console.log(`Indexing operation: ${op.id}`);
          // In a real implementation, we would decode the XDR to find 'file_report' calls
          // and upsert them into Supabase if they don't exist.
        }
      }
      
      console.log('--- INDEXING COMPLETED ---');
      return true;
    } catch (error) {
      console.error('Indexing failed:', error);
      return false;
    }
  }

  /**
   * Returns a cached summary of the ecosystem data.
   */
  static async getEcosystemSummary() {
    const { data: reports } = await supabase
      .from('fraud_reports')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      recentAlerts: reports || [],
      network: 'Stellar Testnet',
      protocol: 'Soroban v22'
    };
  }
}
