import { authorizeDemoTestAccountRequest } from '../../../../lib/demoTestAccountServer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const access = await authorizeDemoTestAccountRequest(request);
  if ('response' in access) return access.response;

  try {
    const idempotencyKey = crypto.randomUUID();
    const { data: started, error } = await access.admin.rpc('start_demo_test_subscription', {
      p_user_id: access.userId,
      p_idempotency_key: idempotencyKey,
    });
    if (error) {
      return Response.json({ error: '모의 구독을 시작하지 못했어요.' }, { status: 500 });
    }
    if (!started) {
      return Response.json({ error: '이미 이용 중인 모의 구독이 있어요.' }, { status: 409 });
    }

    const { data: membership, error: membershipError } = await access.admin
      .from('demo_test_memberships')
      .select('status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, cancelled_at')
      .eq('user_id', access.userId)
      .single();
    if (membershipError) {
      return Response.json({ error: '모의 결제는 기록했지만 구독 상태를 확인하지 못했어요.' }, { status: 500 });
    }
    return Response.json({ membership, simulated: true });
  } catch {
    return Response.json({ error: '모의 구독을 시작하지 못했어요.' }, { status: 503 });
  }
}
