import { authorizeDemoTestAccountRequest } from '../../../../lib/demoTestAccountServer';

export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  const access = await authorizeDemoTestAccountRequest(request);
  if ('response' in access) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '탈퇴 확인값이 올바르지 않아요.' }, { status: 400 });
  }
  if (
    typeof body !== 'object'
    || body === null
    || !('confirmation' in body)
    || body.confirmation !== 'DELETE'
  ) {
    return Response.json({ error: '탈퇴 확인값이 올바르지 않아요.' }, { status: 400 });
  }

  try {
    const { error: cleanupError } = await access.admin.rpc('delete_demo_test_user_data', {
      p_user_id: access.userId,
    });
    if (cleanupError) {
      return Response.json({ error: '탈퇴 전 테스트 데이터를 정리하지 못했어요.' }, { status: 500 });
    }
    const { error } = await access.admin.auth.admin.deleteUser(access.userId);
    if (error) {
      return Response.json({ error: '테스트 계정을 삭제하지 못했어요.' }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: '테스트 계정을 삭제하지 못했어요.' }, { status: 503 });
  }
}
