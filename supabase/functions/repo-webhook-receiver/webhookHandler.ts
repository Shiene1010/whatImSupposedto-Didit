import { verifyGithubWebhookSignature } from './webhookSignature.ts';
import { parsePushSummary } from './webhookPayload.ts';

export interface WebhookDelivery {
  delivery_id: string;
  repository_full_name: string;
  event_name: 'push';
  commit_count: number;
  pool_file_count: number;
}

interface InsertError {
  code?: string;
  message?: string;
}

interface WebhookHandlerDependencies {
  secret: string | undefined;
  persist: (delivery: WebhookDelivery) => Promise<InsertError | null>;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 25 * 1024 * 1024;

export function createWebhookHandler({
  secret,
  persist,
}: WebhookHandlerDependencies): (request: Request) => Promise<Response> {
  return async (request) => {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
    }

    if (!secret) {
      console.error('GITHUB_WEBHOOK_SECRET is not configured');
      return new Response('Webhook receiver is not configured', { status: 500 });
    }

    let rawBody: ArrayBuffer | null;
    const reader = request.body?.getReader();
    try {
      if (!reader) {
        rawBody = new ArrayBuffer(0);
      } else {
        const chunks: Uint8Array[] = [];
        let bodyLength = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bodyLength += value.byteLength;
          if (bodyLength > MAX_BODY_BYTES) {
            await reader.cancel();
            return new Response('Request body too large', { status: 413 });
          }
          chunks.push(value);
        }

        const body = new Uint8Array(bodyLength);
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.byteLength;
        }
        rawBody = body.buffer;
      }
    } catch {
      return new Response('Unable to read request body', { status: 400 });
    } finally {
      reader?.releaseLock();
    }

    if (!rawBody) {
      return new Response('Unable to read request body', { status: 400 });
    }

    const validSignature = await verifyGithubWebhookSignature(
      rawBody,
      request.headers.get('x-hub-signature-256'),
      secret,
    );
    if (!validSignature) {
      return new Response('Invalid webhook signature', { status: 401 });
    }

    if (request.headers.get('x-github-event') !== 'push') {
      return jsonResponse({ status: 'SKIPPED', message: 'Unsupported GitHub event' }, 202);
    }

    const deliveryId = request.headers.get('x-github-delivery');
    if (!deliveryId || !UUID_PATTERN.test(deliveryId)) {
      return jsonResponse({ error: 'Invalid GitHub delivery ID' }, 400);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(new TextDecoder().decode(rawBody));
    } catch {
      return jsonResponse({ error: 'Invalid JSON payload' }, 400);
    }

    const summary = parsePushSummary(payload);
    if (!summary) {
      return jsonResponse({ error: 'Invalid GitHub push payload' }, 400);
    }

    try {
      const error = await persist({
        delivery_id: deliveryId,
        repository_full_name: summary.repositoryFullName,
        event_name: 'push',
        commit_count: summary.commitCount,
        pool_file_count: summary.poolFileCount,
      });

      if (error?.code === '23505') {
        return jsonResponse({ status: 'DUPLICATE', deliveryId });
      }

      if (error) {
        console.error('Failed to persist GitHub webhook delivery', error.code);
        return jsonResponse({ error: 'Failed to persist webhook delivery' }, 500);
      }
    } catch (error) {
      console.error('Failed to persist GitHub webhook delivery', error);
      return jsonResponse({ error: 'Failed to persist webhook delivery' }, 500);
    }

    return jsonResponse({
      status: summary.poolFileCount > 0 ? 'SUCCESS' : 'SKIPPED',
      deliveryId,
      commitCount: summary.commitCount,
      poolFileCount: summary.poolFileCount,
    });
  };
}
