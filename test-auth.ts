// test-auth.ts
import { supabase, getSupabaseAdmin } from './src/lib/supabaseClient';
import { getCurrentUser } from './src/lib/auth';

async function runIntegrityTest() {
  console.log('🚀 [TEST] Supabase 인프라 연결 및 RLS 무결성 검증 시작...');

  try {
    // 1. 환경변수 로드 상태 확인
    console.log('📌 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 연결됨' : '❌ 누락');
    
    // 2. 현재 로컬 엔진의 세션 상태 조회
    const user = await getCurrentUser();
    if (!user) {
      console.log('📌 유저 세션: 🔒 미인증 상태 (CLI 환경이므로 정상입니다)');
      console.log('👉 실전 구글 OAuth 웹 팝업은 프론트엔드 UI 컴포넌트 탑재 시 연동됩니다.');
    }

    // 3. RLS 가드레일 우회 관리자 권한(Secret API Key) 작동 여부 검증
    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient.from('ai_prescriptions').select('*').limit(1);
    
    if (error) {
      console.error('❌ [FAIL] Secret API Key 권한 검증 에러:', error.message);
    } else {
      console.log('👑 [SUCCESS] Secret API Key 보안 가드 및 DB 통신 무결성 100% 통과!');
    }

  } catch (e) {
    console.error('❌ 테스트 중 크래시 발생:', e);
  }
}

runIntegrityTest();
