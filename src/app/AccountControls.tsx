'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { DEMO_PERSONA_PROFILES, DemoPersonaId, isDemoPersonaId } from '../demo/demoProfiles';

interface AccountControlsProps {
  selectedPersona: DemoPersonaId;
  onPersonaChange: (personaId: DemoPersonaId) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default function AccountControls({ selectedPersona, onPersonaChange }: AccountControlsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [testAccount, setTestAccount] = useState(false);
  const [error, setError] = useState('');
  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!authConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribe = () => {};

    void import('../lib/supabaseClient').then(({ supabase }) => {
      if (!active) return;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
        setError('');
        if (!session?.access_token) {
          setTestAccount(false);
          return;
        }
        void fetch('/api/test-account/bootstrap', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        }).then(async (response) => {
          const result: unknown = await response.json();
          if (active) {
            setTestAccount(
              response.ok && isRecord(result) && result.isTestAccount === true
            );
          }
        }).catch(() => {
          if (active) setTestAccount(false);
        });
      });
      unsubscribe = () => subscription.unsubscribe();

      void supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError('로그인 상태를 확인하지 못했어요. 새로고침 후 다시 시도해 주세요.');
        } else {
          setUser(data.session?.user ?? null);
          if (data.session?.access_token) {
            void fetch('/api/test-account/bootstrap', {
              method: 'POST',
              headers: { Authorization: `Bearer ${data.session.access_token}` },
              cache: 'no-store',
            }).then(async (response) => {
              const result: unknown = await response.json();
              if (active) {
                setTestAccount(
                  response.ok && isRecord(result) && result.isTestAccount === true
                );
              }
            }).catch(() => {
              if (active) setTestAccount(false);
            });
          }
        }
        setLoading(false);
      }).catch(() => {
        if (!active) return;
        setError('로그인 상태를 확인하지 못했어요. 새로고침 후 다시 시도해 주세요.');
        setLoading(false);
      });
    }).catch(() => {
      if (!active) return;
      setLoading(false);
      setError('로그인 기능을 초기화하지 못했어요. 설정을 확인해 주세요.');
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authConfigured]);

  async function handleGoogleSignIn() {
    setPending(true);
    setError('');
    try {
      const { signInWithGoogle } = await import('../lib/auth');
      await signInWithGoogle();
    } catch {
      setError('Google 로그인 요청을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setPending(false);
    }
  }

  if (loading) {
    return <span className="account-status" role="status">로그인 상태 확인 중…</span>;
  }

  if (!authConfigured) {
    return <span className="account-status">Google 로그인은 설정 후 사용할 수 있어요.</span>;
  }

  if (!user) {
    return (
      <div className="account-controls">
        <button className="account-button" type="button" onClick={handleGoogleSignIn} disabled={pending}>
          {pending ? 'Google로 이동 중…' : 'Google로 로그인'}
        </button>
        {error && <span className="account-message account-error" role="alert">{error}</span>}
      </div>
    );
  }

  return (
    <div className="account-controls">
      {testAccount && (
        <label className="persona-select-label">
          <span>테스트 프로필</span>
          <select
            aria-label="테스트 페르소나 프로필 선택"
            value={selectedPersona}
            onChange={(event) => {
              if (isDemoPersonaId(event.target.value)) onPersonaChange(event.target.value);
            }}
          >
            {Object.entries(DEMO_PERSONA_PROFILES).map(([id, persona]) => (
              <option key={id} value={id}>{persona.label}</option>
            ))}
          </select>
        </label>
      )}
      <span className="account-email" title={user.email ?? undefined}>
        {testAccount ? '테스트 계정' : user.email ?? 'Google 계정'}
      </span>
      <Link className="account-button secondary account-settings-link" href="/account">
        계정 설정
      </Link>
      {error && <span className="account-message account-error" role="alert">{error}</span>}
    </div>
  );
}
