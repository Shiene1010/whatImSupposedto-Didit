// src/app/page.tsx
'use client';

import { signInWithGoogle, getCurrentUser, signOut } from '../lib/auth';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 진입 즉시 세션 포획 및 유저 식별자 매핑
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>인프라 세션 로딩 중...</div>;

  return (
    <main style={{ padding: '3rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🤖 whatImSupposedto-Didit</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>완벽주의 타격을 위한 철벽 가드레일 웹서비스</p>

      {!user ? (
        <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ marginBottom: '1.5rem' }}>로그인 후 4단 AI 처방전을 발급받으세요.</p>
          <button 
            onClick={() => signInWithGoogle()}
            style={{ padding: '0.8rem 1.5rem', backgroundColor: '#4285F4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Google 계정으로 로그인
          </button>
        </div>
      ) : (
        <div style={{ padding: '2rem', border: '1px solid #4CAF50', borderRadius: '8px', backgroundColor: '#F4F9F4' }}>
          <p style={{ fontWeight: 'bold', color: '#4CAF50', marginBottom: '0.5rem' }}>✅ 실전 인증 파이프라인 연결 완료</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>환영합니다! 이메일: <strong>{user.email}</strong></p>
          
          <div style={{ fontSize: '0.8rem', color: '#666', wordBreak: 'break-all', backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #eee', marginBottom: '1.5rem' }}>
            <strong>내 고유 RLS UUID:</strong><br/>{user.id}
          </div>

          <button 
            onClick={async () => {
              await signOut();
              window.location.reload();
            }}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            로그아웃 (세션 파괴)
          </button>
        </div>
      )}
    </main>
  );
}
