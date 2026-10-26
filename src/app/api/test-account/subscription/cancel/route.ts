import { authorizeDemoTestAccountRequest } from '../../../../../lib/demoTestAccountServer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const access = await authorizeDemoTestAccountRequest(request);
  if ('response' in access) return access.response;

  try {
    const { data: cancelled, error } = await access.admin.rpc('cancel_demo_test_subscription', {
      p_user_id: access.userId,
    });
    if (error) {
      return Response.json({ error: '모의 구독을 취소하지 못했어요.' }, { status: 500 });
    }
    if (!cancelled) {
      return Response.json({ error: '취소할 모의 구독이 없어요.' }, { status: 409 });
    }

    const { data: membership, error: membershipError } = await access.admin
      .from('demo_test_memberships')
      .select('status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, cancelled_at')
      .eq('user_id', access.userId)
      .single();
    if (membershipError) {
      return Response.json({ error: '모의 구독을 취소했지만 상태를 확인하지 못했어요.' }, { status: 500 });
    }
    return Response.json({ membership });
  } catch {
    return Response.json({ error: '모의 구독을 취소하지 못했어요.' }, { status: 503 });
  }
}
