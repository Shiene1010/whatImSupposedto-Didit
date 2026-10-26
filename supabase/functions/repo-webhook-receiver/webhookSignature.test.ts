import { verifyGithubWebhookSignature } from './webhookSignature.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertEquals(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

const secret = 'test-webhook-secret';
const body = new TextEncoder().encode('{"ref":"refs/heads/main"}').buffer;

async function sign(payload: ArrayBuffer): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, payload));
  const hex = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `sha256=${hex}`;
}

Deno.test('accepts a valid GitHub HMAC signature', async () => {
  assert(await verifyGithubWebhookSignature(body, await sign(body), secret), 'valid signature rejected');
});

Deno.test('rejects a signature for a different body', async () => {
  const signature = await sign(body);
  const tamperedBody = new TextEncoder().encode('{"ref":"refs/heads/other"}').buffer;
  assertEquals(await verifyGithubWebhookSignature(tamperedBody, signature, secret), false, 'tampered body accepted');
});

Deno.test('rejects missing, malformed, or empty-secret signatures', async () => {
  const validSignature = await sign(body);
  assertEquals(await verifyGithubWebhookSignature(body, null, secret), false, 'missing signature accepted');
  assertEquals(await verifyGithubWebhookSignature(body, 'sha256=bad', secret), false, 'malformed signature accepted');
  assertEquals(await verifyGithubWebhookSignature(body, validSignature, ''), false, 'empty secret accepted');
});
