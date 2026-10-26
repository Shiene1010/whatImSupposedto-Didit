'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import DemoSubscriptionControls from '../DemoSubscriptionControls';
import { DEMO_PERSONA_PROFILES, DemoPersonaId, isDemoPersonaId } from '../../demo/demoProfiles';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default function AccountSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testAccount, setTestAccount] = useState(false);
  const [testAccountError, setTestAccountError] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<DemoPersonaId>('easy_peasy');
  const [pendingAction, setPendingAction] = useState<'signin' | 'signout' | 'delete' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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

    async function syncTestAccount(accessToken: string | undefined) {
      setTestAccount(false);
      setTestAccountError('');
      if (!accessToken) return;
      try {
        const response = await fetch('/api/test-account/bootstrap', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store',
        });
        const result: unknown = await response.json();
        if (!active) return;
        setTestAccount(response.ok && isRecord(result) && result.isTestAccount === true);
        if (response.status === 503 && isRecord(result) && typeof result.error === 'string') {
          setTestAccountError(result.error);
        }
      } catch {
        if (active) setTestAccountError('테스트 계정 상태를 확인하지 못했어요.');
      }
    }

    void import('../../lib/supabaseClient').then(({ supabase }) => {
      if (!active) return;
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
      setLoading(false);
      setError('로그인 기능을 초기화하지 못했어요. 설정을 확인해 주세요.');
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [authConfigured]);

  async function handleGoogleSignIn() {
    setPendingAction('signin');
    setError('');
    try {
      const { signInWithGoogle } = await import('../../lib/auth');
      await signInWithGoogle();
    } catch {
      setError('Google 로그인 요청을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setPendingAction(null);
    }
  }

  async function handleSignOut() {
    setPendingAction('signout');
    setError('');
    setNotice('');
    try {
      const { signOut } = await import('../../lib/auth');
      await signOut();
      setNotice('로그아웃했어요.');
      setUser(null);
      setTestAccount(false);
    } catch {
      setError('로그아웃하지 못했어요. 다시 시도해 주세요.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('테스트 계정과 연결된 앱 데이터를 영구 삭제합니다. 계속할까요?')) return;
    if (!window.confirm('정말 탈퇴할까요? 삭제한 계정은 복구할 수 없습니다.')) return;

    setPendingAction('delete');
    setError('');
    setNotice('');
    try {
      const { supabase } = await import('../../lib/supabaseClient');
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
      if (!response.ok || !isRecord(result) || result.success !== true) {
        setError(
          isRecord(result) && typeof result.error === 'string'
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
      setPendingAction(null);
    }
  }

  return (
    <main className="app-shell account-page">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="작게, 해냄 홈">
          <span className="brand-mark" aria-hidden="true">ㄷ</span>
          <span>작게, 해냄</span>
        </Link>
        <Link className="top-link" href="/">체험 화면으로 돌아가기</Link>
      </header>

      <section className="account-settings">
        <div className="account-settings-heading">
          <span className="section-kicker">ACCOUNT SETTINGS</span>
          <h1>계정 설정</h1>
          <p>로그인, 테스트 이용권, 구독 시뮬레이션과 계정 탈퇴를 관리해요.</p>
        </div>

        {!authConfigured ? (
          <div className="account-settings-card" role="status">
            Google 로그인 설정이 완료되면 계정 설정을 사용할 수 있어요.
          </div>
        ) : loading ? (
          <div className="account-settings-card" role="status">로그인 상태를 확인하고 있어요…</div>
        ) : !user ? (
          <section className="account-settings-card">
            <h2>로그인이 필요해요</h2>
            <p>테스트 계정으로 로그인하면 이용권과 구독 시뮬레이션을 관리할 수 있어요.</p>
            <button
              className="account-button"
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={pendingAction !== null}
            >
              {pendingAction === 'signin' ? 'Google로 이동 중…' : 'Google로 로그인'}
            </button>
          </section>
        ) : (
          <div className="account-settings-sections">
            <section className="account-settings-card">
              <div className="settings-card-heading">
                <div>
                  <span className="section-kicker">PROFILE</span>
                  <h2>로그인 계정</h2>
                </div>
                <span className={`account-state-pill ${testAccount ? 'test-account' : ''}`}>
                  {testAccount ? '테스트 계정' : 'Google 계정'}
                </span>
              </div>
              <p className="settings-email">{user.email ?? '이메일 정보 없음'}</p>
              {testAccountError && <p className="settings-warning" role="alert">{testAccountError}</p>}
              {!testAccount && !testAccountError && (
                <p className="settings-help">
                  구독 시뮬레이션과 탈퇴 기능은 서버에 등록된 테스트 계정에서만 사용할 수 있어요.
                </p>
              )}
            </section>

            {testAccount && (
              <>
                <section className="account-settings-card">
                  <div className="settings-card-heading">
                    <div>
                      <span className="section-kicker">DEMO PROFILES</span>
                      <h2>체험 프로필 선택</h2>
                    </div>
                    <span className="account-state-pill test-account">4개 프로필</span>
                  </div>
                  <p className="settings-help">
                    프로필을 골라 해당 인물의 목표와 기록 예시로 체험할 수 있어요. 선택한 프로필은 서버에 저장되지 않습니다.
                  </p>
                  <label className="settings-profile-field">
                    <span>프로필</span>
                    <select
                      value={selectedPersona}
                      onChange={(event) => {
                        if (isDemoPersonaId(event.target.value)) {
                          setSelectedPersona(event.target.value);
                        }
                      }}
                    >
                      {Object.entries(DEMO_PERSONA_PROFILES).map(([id, profile]) => (
                        <option key={id} value={id}>{profile.label}</option>
                      ))}
                    </select>
                  </label>
                  <div className="settings-profile-preview">
                    <span>목표 예시</span>
                    <p>{DEMO_PERSONA_PROFILES[selectedPersona].goal}</p>
                    <span>분석 대상</span>
                    <p>{DEMO_PERSONA_PROFILES[selectedPersona].targetNickname}</p>
                  </div>
                  <Link className="account-button" href={`/?persona=${selectedPersona}`}>
                    이 프로필로 체험 시작
                  </Link>
                </section>

                <section className="account-settings-card">
                  <div className="settings-card-heading">
                    <div>
                      <span className="section-kicker">MEMBERSHIP</span>
                      <h2>이용권 및 구독 관리</h2>
                    </div>
                    <span className="account-state-pill simulated">시연 전용</span>
                  </div>
                  <p className="settings-help">
                    현재 구독은 결제 흐름을 시험하기 위한 모의 기능입니다. 실제 결제·자동 갱신·청구는 발생하지 않아요.
                  </p>
                  <DemoSubscriptionControls />
                </section>

                <section className="account-settings-card account-danger-zone">
                  <details>
                    <summary>테스트 계정 탈퇴</summary>
                    <p>
                      계정과 연결된 테스트 이용권·모의 결제·처방 기록 및 Supabase 로그인 계정을 삭제합니다.
                      삭제한 계정은 복구할 수 없으며, 같은 Google 이메일로 다시 가입할 수 있어요.
                    </p>
                    <button
                      className="account-button account-danger"
                      type="button"
                      onClick={() => void handleDeleteAccount()}
                      disabled={pendingAction !== null}
                    >
                      {pendingAction === 'delete' ? '탈퇴 처리 중…' : '계정 영구 삭제'}
                    </button>
                  </details>
                </section>
              </>
            )}

            <section className="account-settings-card account-session-card">
              <div>
                <span className="section-kicker">SESSION</span>
                <h2>현재 기기에서 로그아웃</h2>
                <p>저장된 Supabase 로그인 세션을 이 브라우저에서 종료합니다.</p>
              </div>
              <button
                className="account-button secondary"
                type="button"
                onClick={() => void handleSignOut()}
                disabled={pendingAction !== null}
              >
                {pendingAction === 'signout' ? '로그아웃 중…' : '로그아웃'}
              </button>
            </section>
          </div>
        )}

        {notice && <p className="settings-notice" role="status">{notice}</p>}
        {error && <p className="settings-error" role="alert">{error}</p>}
        <Link className="account-back-link" href="/">← 체험 화면으로 돌아가기</Link>
      </section>
    </main>
  );
}
