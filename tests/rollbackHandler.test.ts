import { RollbackHandler } from '../src/operation/rollbackHandler';

const payload = {
  userId: '3b08d5f1-48e5-4c5f-a6c8-ded9952c3201',
  originalTarget: 'Read one page',
  fiveYearOldVersion: 'Open the book',
  cheatKeyAction: 'Sit at the desk',
  phonicsSound: '시-작',
};

describe('RollbackHandler timeout reporting', () => {
  test('reports a successful RPC commit', async () => {
    let signal: AbortSignal | undefined;
    const client = {
      rpc: () => ({
        abortSignal: (requestSignal: AbortSignal) => {
          signal = requestSignal;
          return Promise.resolve({ data: null, error: null });
        },
      }),
    };
    const handler = new RollbackHandler(client, 50);

    await expect(handler.executeWith8SecRollback(payload)).resolves.toEqual({
      success: true,
      status: 'TRANSACTION_COMMITTED',
    });
    expect(signal?.aborted).toBe(false);
  });

  test('aborts the client request and reports an indeterminate database outcome on timeout', async () => {
    let signal: AbortSignal | undefined;
    const client = {
      rpc: () => ({
        abortSignal: (requestSignal: AbortSignal) => {
          signal = requestSignal;
          return new Promise<{ data: null; error: null }>((resolve) => {
            setTimeout(() => resolve({ data: null, error: null }), 30);
          });
        },
      }),
    };
    const handler = new RollbackHandler(client, 5);

    await expect(handler.executeWith8SecRollback(payload)).resolves.toEqual({
      success: false,
      status: 'TIMEOUT_INDETERMINATE',
    });
    expect(signal?.aborted).toBe(true);
  });

  test('does not report database errors as successful rollbacks', async () => {
    const client = {
      rpc: () => ({
        abortSignal: () => Promise.resolve({
          data: null,
          error: { message: 'RPC unavailable' },
        }),
      }),
    };
    const handler = new RollbackHandler(client, 50);

    await expect(handler.executeWith8SecRollback(payload)).resolves.toEqual({
      success: false,
      status: 'TRANSACTION_FAILED',
    });
  });
});
