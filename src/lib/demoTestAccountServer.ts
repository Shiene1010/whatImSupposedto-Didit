import { getSupabaseAdmin } from './supabaseClient';
import { isAllowedDemoGoogleIdentity } from '../demo/demoTestAccountAccess';

export type DemoTestAccountAccess =
  | {
      admin: ReturnType<typeof getSupabaseAdmin>;
      userId: string;
      email: string;
    }
  | { response: Response };

export async function authorizeDemoTestAccountRequest(
  request: Request
): Promise<DemoTestAccountAccess> {
  const allowedEmail = process.env.DEMO_TEST_ACCOUNT_EMAIL?.trim().toLowerCase();
  if (!allowedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(allowedEmail)) {
    return {
      response: Response.json(
        { error: '테스트 계정 이메일을 서버에 설정해 주세요.' },
        { status: 503 }
      ),
    };
  }

  let configuredOrigin: string | null = null;
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    try {
      const siteUrl = new URL(configuredSiteUrl);
      if (process.env.NODE_ENV === 'production' && siteUrl.protocol !== 'https:') {
        throw new Error('Production URL must use HTTPS');
      }
      configuredOrigin = siteUrl.origin;
    } catch {
      return {
        response: Response.json({ error: '서비스 주소 설정을 확인해 주세요.' }, { status: 503 }),
      };
    }
  } else if (process.env.NODE_ENV === 'production') {
    return {
      response: Response.json({ error: '서비스 주소 설정이 완료되지 않았어요.' }, { status: 503 }),
    };
  }

  const origin = request.headers.get('origin');
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return { response: Response.json({ error: '요청 주소를 확인할 수 없어요.' }, { status: 400 }) };
  }
  if (!origin || origin !== (configuredOrigin ?? requestOrigin)) {
    return { response: Response.json({ error: '요청 출처를 확인할 수 없어요.' }, { status: 403 }) };
  }

  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return { response: Response.json({ error: '로그인이 필요해요.' }, { status: 401 }) };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);
    const user = data.user;
    if (error || !user) {
      return { response: Response.json({ error: '로그인 상태를 확인해 주세요.' }, { status: 401 }) };
    }

    const email = user.email?.trim().toLowerCase();
    if (!email || !isAllowedDemoGoogleIdentity(user, allowedEmail)) {
      return { response: Response.json({ error: '지정된 Google 테스트 계정만 이용할 수 있어요.' }, { status: 403 }) };
    }
    return { admin, userId: user.id, email };
  } catch {
    return { response: Response.json({ error: '테스트 계정을 확인하지 못했어요.' }, { status: 503 }) };
  }
}
