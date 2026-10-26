import { createWebhookHandler, type WebhookDelivery } from './webhookHandler.ts';
import { parsePushSummary } from './webhookPayload.ts';

const secret = 'test-webhook-secret';
const deliveryId = 'b99bc2dd-e64b-4e6a-b276-0eecf11f4b78';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEquals(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

async function signatureFor(body: ArrayBuffer): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, body));
  const hex = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `sha256=${hex}`;
}

const pushPayload = {
  repository: { full_name: 'Shiene1010/whatImSupposedto-Didit' },
  commits: [
    {
      added: ['assets/stage_05_repository_pool/log.md'],
      modified: ['README.md'],
      removed: [],
    },
  ],
};

async function makeRequest(
  payload: unknown = pushPayload,
  headers: Record<string, string> = {},
): Promise<Request> {
  const body = new TextEncoder().encode(JSON.stringify(payload)).buffer;
  return new Request('https://functions.supabase.co/repo-webhook-receiver', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-github-event': 'push',
      'x-github-delivery': deliveryId,
      'x-hub-signature-256': await signatureFor(body),
      ...headers,
    },
    body,
  });
}

Deno.test('persists only private delivery metadata for a signed push', async () => {
  let saved: WebhookDelivery | undefined;
  const handler = createWebhookHandler({
    secret,
    persist: async (delivery) => {
      saved = delivery;
      return null;
    },
  });

  const response = await handler(await makeRequest());
  const result = await response.json();
  assertEquals(response.status, 200, 'valid push status');
  assertEquals(result.status, 'SUCCESS', 'valid push result');
  assertEquals(saved?.repository_full_name, 'Shiene1010/whatImSupposedto-Didit', 'repository');
  assertEquals(saved?.pool_file_count, 1, 'pool file count');
  assert(!('user_id' in (saved ?? {})), 'delivery must not claim a Supabase user');
});

Deno.test('rejects invalid signatures without persisting', async () => {
  let persistCalled = false;
  const handler = createWebhookHandler({
    secret,
    persist: async () => {
      persistCalled = true;
      return null;
    },
  });

  const response = await handler(await makeRequest(pushPayload, {
    'x-hub-signature-256': `sha256=${'0'.repeat(64)}`,
  }));
  assertEquals(response.status, 401, 'invalid signature status');
  assertEquals(persistCalled, false, 'invalid signature persisted');
});

Deno.test('rejects malformed pushes and delivery IDs', async () => {
  const handler = createWebhookHandler({ secret, persist: async () => null });

  const malformedPush = await handler(await makeRequest({
    repository: { full_name: 'owner/repo' },
    commits: [{ added: 'not-an-array', modified: [], removed: [] }],
  }));
  assertEquals(malformedPush.status, 400, 'malformed push status');

  const malformedId = await handler(await makeRequest(pushPayload, {
    'x-github-delivery': 'not-a-uuid',
  }));
  assertEquals(malformedId.status, 400, 'malformed delivery ID status');
});

Deno.test('reports persistence errors instead of success', async () => {
  const handler = createWebhookHandler({
    secret,
    persist: async () => ({ code: 'DB_ERROR' }),
  });

  const response = await handler(await makeRequest());
  assertEquals(response.status, 500, 'database error status');
});

Deno.test('treats duplicate delivery IDs as idempotent success', async () => {
  const handler = createWebhookHandler({
    secret,
    persist: async () => ({ code: '23505' }),
  });

  const response = await handler(await makeRequest());
  const result = await response.json();
  assertEquals(response.status, 200, 'duplicate delivery status');
  assertEquals(result.status, 'DUPLICATE', 'duplicate delivery result');
});

Deno.test('validates payload structure and counts unique pool files', () => {
  const summary = parsePushSummary({
    repository: { full_name: 'owner/repo' },
    commits: [
      { added: ['assets/stage_05_repository_pool/a.md'], modified: [], removed: [] },
      { added: [], modified: ['assets/stage_05_repository_pool/a.md'], removed: [] },
    ],
  });
  assertEquals(summary?.poolFileCount, 1, 'duplicate file count');
  assertEquals(parsePushSummary({ repository: {}, commits: [null] }), null, 'malformed payload');
});

Deno.test('rejects non-POST requests and missing webhook secrets', async () => {
  const configuredHandler = createWebhookHandler({ secret, persist: async () => null });
  const methodResponse = await configuredHandler(new Request('https://example.com', { method: 'GET' }));
  assertEquals(methodResponse.status, 405, 'method status');

  const unconfiguredHandler = createWebhookHandler({ secret: undefined, persist: async () => null });
  const configurationResponse = await unconfiguredHandler(await makeRequest());
  assertEquals(configurationResponse.status, 500, 'missing secret status');
});
