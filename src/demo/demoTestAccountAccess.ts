export interface DemoAuthIdentity {
  email?: string;
  email_confirmed_at?: string;
  app_metadata: {
    provider?: string;
    providers?: unknown;
  };
}

export function isAllowedDemoGoogleIdentity(
  user: DemoAuthIdentity,
  allowedEmail: string | undefined
): boolean {
  const normalizedAllowedEmail = allowedEmail?.trim().toLowerCase();
  const normalizedUserEmail = user.email?.trim().toLowerCase();
  const providers = user.app_metadata.providers;

  return Boolean(
    normalizedAllowedEmail
    && normalizedUserEmail === normalizedAllowedEmail
    && user.email_confirmed_at
    && user.app_metadata.provider === 'google'
    && Array.isArray(providers)
    && providers.includes('google')
  );
}
