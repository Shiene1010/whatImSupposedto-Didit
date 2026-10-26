// demo-google-login.ts
import { supabase } from './src/lib/supabaseClient';

async function runGoogleLoginDemo() {
  console.log('🌐 [GOOGLE OAUTH DEMO] 구글 로그인 파이프라인 실전 구동을 시작합니다.');
  console.log('⏳ 잠시 후 구글 로그인 인증 웹페이지 주소가 발급됩니다...\n');

  try {
    // 1. Supabase Auth 레이어에 구글 로그인 주소 요청
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // CLI 환경이므로 Supabase 클라우드가 인증 완료 후 돌려줄 기본 Callback 주소 지정
        redirectTo: 'https://supabase.co',
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('❌ 구글 인증 주소 발급 크래시:', error.message);
      return;
    }

    if (data && data.url) {
      console.log('🔗 [인증 링크 발급 완료] 아래 URL을 복사하여 브라우저창에 붙여넣거나 클릭하세요:\n');
      console.log('======================================================================');
      console.log(data.url);
      console.log('======================================================================\n');
      console.log('💡 브라우저에서 구글 로그인을 완료하면 Supabase Users 명단에 실시간 적재됩니다.');
    }

  } catch (e) {
    console.error('❌ 시연 중 예상치 못한 에러 발생:', e);
  }
}

runGoogleLoginDemo();
