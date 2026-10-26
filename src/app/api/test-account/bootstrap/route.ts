import { authorizeDemoTestAccountRequest } from '../../../../lib/demoTestAccountServer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const access = await authorizeDemoTestAccountRequest(request);
  if ('response' in access) return access.response;

  try {
    const { error: grantError } = await access.admin.rpc('grant_demo_test_trial', {
      p_user_id: access.userId,
    });
    if (grantError) {
      return Response.json({ error: '테스트 이용권을 준비하지 못했어요.' }, { status: 500 });
    }

    const { data: membership, error: membershipError } = await access.admin
      .from('demo_test_memberships')
      .select('status, trial_started_at, trial_ends_at, subscription_started_at, subscription_ends_at, cancelled_at')
      .eq('user_id', access.userId)
      .maybeSingle();
    if (membershipError || !membership) {
      return Response.json({ error: '테스트 이용 상태를 확인하지 못했어요.' }, { status: 500 });
    }

    return Response.json(
      { isTestAccount: true, membership },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch {
    return Response.json({ error: '테스트 계정을 준비하지 못했어요.' }, { status: 503 });
  }
}
