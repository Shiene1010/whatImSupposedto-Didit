'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { DEMO_PERSONA_PROFILES, DemoPersonaId, isDemoPersonaId } from '../demo/demoProfiles';
import DemoSubscriptionControls from './DemoSubscriptionControls';

interface AccountControlsProps {
  selectedPersona: DemoPersonaId;
  onPersonaChange: (personaId: DemoPersonaId) => void;
}

export default function AccountControls({ selectedPersona, onPersonaChange }: AccountControlsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [testAccount, setTestAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [authUnavailable, setAuthUnavailable] = useState(!authConfigured);

  async function syncTestAccount(accessToken: string | undefined) {
    if (!accessToken) {
      setTestAccount(false);
      return;
    }
    try {
      const response = await fetch('/api/test-account/bootstrap', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      const result: unknown = await response.json();
      setTestAccount(
        response.ok
        && typeof result === 'object'
        && result !== null
        && 'isTestAccount' in result
        && result.isTestAccount === true
      );
      if (response.status === 503 && typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string') {
        setError(result.error);
      }
    } catch {
      setTestAccount(false);
    }
  }

  useEffect(() => {
    if (!authConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    let unsubscribe = () => {};

    void import('../lib/supabaseClient').then(({ supabase }) => {
      if (!active) return;
      setAuthUnavailable(false);
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setLoading(false);
        setError('');
        setNotice('');
        void syncTestAccount(session?.access_token);
      });
      unsubscribe = () => subscription.unsubscribe();

      void supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError('로그인 상태를 확인하지 못했어요. 새로고침 후 다시 시도해 주세요.');
        } else {
          setUser(data.session?.user ?? null);
          void syncTestAccount(data.session?.access_token);
        }
        setLoading(false);
      }).catch(() => {
        if (!active) return;
        setError('로그인 상태를 확인하지 못했어요. 새로고침 후 다시 시도해 주세요.');
        setLoading(false);
      });
    }).catch(() => {
      if (!active) return;
      setAuthUnavailable(true);
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
    setNotice('');

    try {
      const { signInWithGoogle } = await import('../lib/auth');
      await signInWithGoogle();
    } catch {
      setError('Google 로그인 요청을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setPending(false);
    }
  }

  async function handleSignOut() {
    setPending(true);
    setError('');
    setNotice('');

    try {
      const { signOut } = await import('../lib/auth');
      await signOut();
      setNotice('로그아웃했어요.');
    } catch {
      setError('로그아웃하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setPending(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('테스트 계정과 연결된 앱 데이터를 영구 삭제합니다. 계속할까요?')) return;
    if (!window.confirm('정말 탈퇴할까요? 삭제한 계정은 복구할 수 없습니다.')) return;

    setDeletingAccount(true);
    setError('');
    setNotice('');
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setError('로그인 상태를 확인해 주세요.');
        return;
      }
      const response = await fetch('/api/test-account/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      const result: unknown = await response.json();
      if (!response.ok || typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) {
        setError(
          typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
            ? result.error
            : '테스트 계정을 삭제하지 못했어요.'
        );
        return;
      }
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      if (signOutError) {
        setError('계정은 삭제했지만 이 브라우저의 로그아웃 처리가 완료되지 않았어요. 직접 로그아웃해 주세요.');
        return;
      }
      setTestAccount(false);
      setUser(null);
      setNotice('테스트 계정을 삭제하고 로그아웃했어요.');
    } catch {
      setError('테스트 계정을 삭제하지 못했어요.');
    } finally {
      setDeletingAccount(false);
    }
  }

  function handlePersonaChange(personaId: DemoPersonaId) {
    onPersonaChange(personaId);
  }

  if (authUnavailable) {
    return <span className="account-status">Google 로그인은 설정 후 사용할 수 있어요.</span>;
  }

  if (loading) {
    return <span className="account-status" role="status">로그인 상태 확인 중…</span>;
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

  const hasTestPersonas = testAccount;

  return (
    <div className="account-controls">
      {hasTestPersonas && (
        <>
          <label className="persona-select-label">
            <span>테스트 프로필</span>
            <select
              aria-label="테스트 페르소나 프로필 선택"
              value={selectedPersona}
              onChange={(event) => {
                if (isDemoPersonaId(event.target.value)) handlePersonaChange(event.target.value);
              }}
            >
              {Object.entries(DEMO_PERSONA_PROFILES).map(([id, persona]) => (
                <option key={id} value={id}>{persona.label}</option>
              ))}
            </select>
          </label>
          <DemoSubscriptionControls />
        </>
      )}
      <span className="account-email" title={user.email ?? undefined}>
        {hasTestPersonas ? '테스트 계정' : user.email ?? 'Google 계정'}
      </span>
      <button className="account-button secondary" type="button" onClick={handleSignOut} disabled={pending}>
        {pending ? '처리 중…' : '로그아웃'}
      </button>
      {hasTestPersonas && (
        <button
          className="account-button account-danger"
          type="button"
          onClick={() => void handleDeleteAccount()}
          disabled={deletingAccount}
        >
          {deletingAccount ? '탈퇴 처리 중…' : '테스트 계정 탈퇴'}
        </button>
      )}
      {notice && <span className="account-message" role="status">{notice}</span>}
      {error && <span className="account-message account-error" role="alert">{error}</span>}
    </div>
  );
}
