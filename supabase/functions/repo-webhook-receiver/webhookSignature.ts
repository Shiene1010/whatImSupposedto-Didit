const SIGNATURE_PATTERN = /^sha256=[0-9a-f]{64}$/;

export async function verifyGithubWebhookSignature(
  rawBody: ArrayBuffer,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!secret || !signature || !SIGNATURE_PATTERN.test(signature)) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, rawBody));
  const suppliedHex = signature.slice('sha256='.length);

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    const suppliedByte = Number.parseInt(suppliedHex.slice(i * 2, i * 2 + 2), 16);
    mismatch |= expected[i] ^ suppliedByte;
  }

  return mismatch === 0;
}
