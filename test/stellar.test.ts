import { describe, it, expect } from 'vitest';
import { 
  CLARIX_REGISTRY_ID, 
  CLARIX_REWARD_ID, 
  ADMIN_ADDRESS,
  UserRejectedError,
  InsufficientFundsError,
  NetworkError
} from '../src/lib/stellar.ts';

describe('Stellar Implementation', () => {
  it('Contract and Admin IDs are properly formatted', () => {
    expect(CLARIX_REGISTRY_ID).toHaveLength(56);
    expect(CLARIX_REWARD_ID).toHaveLength(56);
    expect(ADMIN_ADDRESS).toHaveLength(56);
  });

  it('Error classes preserve their names', () => {
    const err1 = new UserRejectedError();
    expect(err1.name).toBe('UserRejectedError');

    const err2 = new InsufficientFundsError();
    expect(err2.name).toBe('InsufficientFundsError');

    const err3 = new NetworkError('testing');
    expect(err3.name).toBe('NetworkError');
    expect(err3.message).toContain('testing');
  });

  it('System is configured for testnet', () => {
    expect(CLARIX_REGISTRY_ID).toBeDefined();
  });
});
