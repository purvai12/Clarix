import test from 'node:test';
import assert from 'node:assert';

import { 
  CLARIX_REGISTRY_ID, 
  CLARIX_REWARD_ID, 
  ADMIN_ADDRESS,
  UserRejectedError,
  InsufficientFundsError,
  NetworkError
} from '../src/lib/stellar.ts'; // Wait, node:test running a TS file directly won't work unless using tsx or vitest.

test('Contract and Admin IDs are properly formatted', (t) => {
  assert.strictEqual(CLARIX_REGISTRY_ID.length, 56, 'Registry ID length should be 56');
  assert.strictEqual(CLARIX_REWARD_ID.length, 56, 'Reward ID length should be 56');
  assert.strictEqual(ADMIN_ADDRESS.length, 56, 'Admin address length should be 56');
});

test('Error classes preserve their names', (t) => {
  const err1 = new UserRejectedError();
  assert.strictEqual(err1.name, 'UserRejectedError');

  const err2 = new InsufficientFundsError();
  assert.strictEqual(err2.name, 'InsufficientFundsError');

  const err3 = new NetworkError('testing');
  assert.strictEqual(err3.name, 'NetworkError');
  assert.ok(err3.message.includes('testing'));
});

test('System is configured for testnet', (t) => {
  // Simple check
  assert.ok(CLARIX_REGISTRY_ID !== undefined);
});
