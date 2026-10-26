'use client';

import { useEffect, useState } from 'react';

interface Membership {
  status: 'trial' | 'simulated_active' | 'cancelled' | 'expired';
  trial_started_at: string;
  trial_ends_at: string;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  cancelled_at: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseMembership(value: unknown): Membership | null {
  if (
    !isRecord(value)
    || (
      value.status !== 'trial'
      && value.status !== 'simulated_active'
      && value.status !== 'cancelled'
      && value.status !== 'expired'
    )
    || typeof value.trial_started_at !== 'string'
    || typeof value.trial_ends_at !== 'string'
    || !(value.subscription_started_at === null || typeof value.subscription_started_at === 'string')
    || !(value.subscription_ends_at === null || typeof value.subscription_ends_at === 'string')
    || !(value.cancelled_at === null || typeof value.cancelled_at === 'string')
  ) return null;
  return {
    status: value.status,
    trial_started_at: value.trial_started_at,
    trial_ends_at: value.trial_ends_at,
    subscription_started_at: value.subscription_started_at,
    subscription_ends_at: value.subscription_ends_at,
    cancelled_at: value.cancelled_at,
  };
}

async function getAccessToken(): Promise<string | null> {
  const { supabase } = await import('../lib/supabaseClient');
  const { data, error } = await supabase.auth.getSession();
  return error ? null : data.session?.access_token ?? null;
}

export default function DemoSubscriptionControls() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (active) setError('로그인 상태를 확인해 주세요.');
          return;
        }
        const response = await fetch('/api/test-account/bootstrap', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const result: unknown = await response.json();
        const nextMembership = isRecord(result) ? parseMembership(result.membership) : null;
        if (!response.ok || !nextMembership) {
          if (active) {
            setError(isRecord(result) && typeof result.error === 'string'
              ? result.error
              : '테스트 이용 상태를 확인하지 못했어요.');
          }
          return;
        }
        if (active) setMembership(nextMembership);
      } catch {
        if (active) setError('테스트 이용 상태를 확인하지 못했어요.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function runAction(path: string, method: 'POST') {
    setPending(true);
    setError('');
    setNotice('');
    try {
      const token = await getAccessToken();
      if (!token) {
        setError('로그인 상태를 확인해 주세요.');
        return;
      }
      const response = await fetch(path, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const result: unknown = await response.json();
      const nextMembership = isRecord(result) ? parseMembership(result.membership) : null;
      if (!response.ok || !nextMembership) {
        setError(isRecord(result) && typeof result.error === 'string'
          ? result.error
          : '요청을 처리하지 못했어요.');
        return;
      }
      setMembership(nextMembership);
      setNotice(path.endsWith('/cancel')
        ? '모의 구독을 취소했어요. 실제 결제나 청구는 없었습니다.'
        : '모의 구독이 시작됐어요. 실제 결제나 청구는 없었습니다.');
    } catch {
      setError('요청을 처리하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setPending(false);
    }
  }

  const simulatedActive = membership?.status === 'simulated_active'
    && membership.subscription_ends_at !== null
    && Date.parse(membership.subscription_ends_at) > Date.now();
  const trialActive = membership?.status === 'trial'
    && Date.parse(membership.trial_ends_at) > Date.now();
  const endDate = simulatedActive && membership?.subscription_ends_at
    ? new Date(membership.subscription_ends_at).toLocaleDateString('ko-KR')
    : trialActive && membership
      ? new Date(membership.trial_ends_at).toLocaleDateString('ko-KR')
      : null;

  return (
    <section className="demo-subscription" aria-label="테스트 구독">
      {loading ? (
        <span className="account-message" role="status">테스트 이용권 확인 중…</span>
      ) : simulatedActive ? (
        <>
          <span className="account-message" role="status">모의 구독 · 실제 청구 없음 · {endDate}까지</span>
          <button
            className="account-button secondary"
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm('실제 결제 없이 모의 구독을 즉시 취소할까요?')) {
                void runAction('/api/test-account/subscription/cancel', 'POST');
              }
            }}
          >
            구독 취소
          </button>
        </>
      ) : trialActive ? (
        <>
          <span className="account-message" role="status">3일 테스트 이용권 · {endDate}까지</span>
          <button
            className="account-button"
            type="button"
            disabled={pending}
            onClick={() => void runAction('/api/test-account/subscription', 'POST')}
          >
            {pending ? '처리 중…' : '모의 구독 시작'}
          </button>
        </>
      ) : (
        <>
          <span className="account-message" role="status">
            {membership?.status === 'cancelled' ? '모의 구독이 취소됐어요.' : '테스트 이용 기간이 끝났어요.'}
          </span>
          <button
            className="account-button"
            type="button"
            disabled={pending}
            onClick={() => void runAction('/api/test-account/subscription', 'POST')}
          >
            {pending ? '처리 중…' : '모의 구독 다시 시작'}
          </button>
        </>
      )}
      {notice && <span className="account-message" role="status">{notice}</span>}
      {error && <span className="account-message account-error" role="alert">{error}</span>}
    </section>
  );
}
