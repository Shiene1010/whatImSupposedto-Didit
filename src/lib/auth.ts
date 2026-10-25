import { supabase } from './supabaseClient';
import { User, Provider } from '@supabase/supabase-js';

/**
 * 🌐 구글 OAuth 소셜 로그인 인터페이스 가동 핸들러
 * 유저를 구글 인증 인프라로 리다이렉트 시키며, 인증 완료 후 내 서비스 도메인으로 안전하게 복귀시킵니다.
 * 
 * @returns {Promise<{ provider: Provider; url: string }>} Supabase OAuth 응답 데이터 객체
 * @throws {Error} 구글 인증 파이프라인 크래시 발생 시 에러 투척
 */
export const signInWithGoogle = async (): Promise<{ provider: Provider; url: string }> => {
  // 런타임 실행 환경의 원점(Origin) 주소를 동적으로 획득하여 리다이렉트 가드레일 수립
  const redirectUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account', // 매번 구글 계정을 명시적으로 선택할 수 있도록 유도하여 완벽주의적 계정 꼬임 방지
      },
    },
  });

  if (error) {
    console.error('❌ [CRITICAL] 구글 인증 파이프라인 연동 실패:', error.message);
    throw new Error(`Google Authentication Failed: ${error.message}`);
  }

  // 데이터 가드레일: URL이 정상적으로 반환되지 않은 비정상 케이스 격리
  if (!data || !data.url) {
    console.error('❌ [CRITICAL] Supabase 구글 인증 주소 발급 실패');
    throw new Error('Failed to retrieve OAuth authorization URL from Supabase.');
  }

  return data;
};

/**
 * 🔒 현재 로그인된 유저의 암호화 세션 컨텍스트 및 고유 식별자(UUID) 안전 획득 함수
 * 이 함수가 반환하는 user.id는 `public.ai_prescriptions` 테이블의 RLS(행 단위 보안) 가드와 직접 매핑됩니다.
 * 
 * @returns {Promise<User | null>} 로그인 완료 시 유저 객체 정보, 미인증 또는 토큰 만료 시 null 반환
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // 세션 도용 및 위변조 방지를 위해 로컬 스토리지가 아닌 Supabase Auth 서버 전송 검증 수행
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('⚠️ [AUTH] 인증된 세션이 존재하지 않거나 토큰 유효 기간이 만료되었습니다:', error.message);
      return null;
    }

    return user;
  } catch (unexpectedError) {
    console.error('❌ [AUTH] 유저 컨텍스트 조회 중 예상치 못한 런타임 예외 발생:', unexpectedError);
    return null;
  }
};

/**
 * 🚪 소셜 세션 파괴 및 안전 로그아웃 프로세서
 * 클라이언트 브라우저에 남아있는 모든 JWT 액세스 토큰 및 새로고침 토큰 잔재를 소멸시킵니다.
 * 
 * @returns {Promise<void>}
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('❌ [CRITICAL] 로그아웃 트랜잭션 실패:', error.message);
    throw new Error(`SignOut Failed: ${error.message}`);
  }
  
  console.log('🚀 [AUTH] 유저 세션 파괴 및 안전 로그아웃 완료');
};
