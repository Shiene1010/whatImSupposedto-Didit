import { createClient } from '@supabase/supabase-js';

// 환경 변수 주입 가드레일 (undefined 크래시 방지)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ [CRITICAL] Supabase 환경 변수가 누락되었습니다. .env 파일을 다시 확인해 주십시오.'
  );
}

// 🛡️ 1. 일반 컴포넌트용 기본 클라이언트 인스턴스 (유저별 RLS 철벽 수호 자동 적용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 🔒 2. 서버사이드 전용 마스터 관리자 인스턴스 생성 함수
 * 인증을 우회하여 배치 작업이나 대량의 합성 데이터를 덤프할 때 사용합니다.
 * 백엔드 레이어에서 Secret API Key를 활용해 안전하게 구동됩니다.
 */
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error(
      '⚠️ 경고: 절대 브라우저(클라이언트) 환경에서 마스터 권한 인스턴스를 호출할 수 없습니다.'
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('❌ [CRITICAL] SUPABASE_SERVICE_ROLE_KEY(Secret API Key)가 누락되었습니다.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
};
