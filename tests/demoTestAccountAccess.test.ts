import { isAllowedDemoGoogleIdentity } from '../src/demo/demoTestAccountAccess';

const verifiedGoogleUser = {
  email: 'mvp-tester@example.com',
  email_confirmed_at: '2026-10-27T00:00:00.000Z',
  app_metadata: { provider: 'google', providers: ['google'] },
};

describe('demo test-account allowlist', () => {
  it('allows only the configured verified Google email, case-insensitively', () => {
    expect(isAllowedDemoGoogleIdentity(verifiedGoogleUser, 'MVP-Tester@Example.com')).toBe(true);
  });

  it('rejects missing allowlist, unverified email, and other providers', () => {
    expect(isAllowedDemoGoogleIdentity(verifiedGoogleUser, undefined)).toBe(false);
    expect(isAllowedDemoGoogleIdentity(
      { ...verifiedGoogleUser, email_confirmed_at: undefined },
      'mvp-tester@example.com'
    )).toBe(false);
    expect(isAllowedDemoGoogleIdentity(
      { ...verifiedGoogleUser, app_metadata: { provider: 'github', providers: ['github'] } },
      'mvp-tester@example.com'
    )).toBe(false);
  });
});
