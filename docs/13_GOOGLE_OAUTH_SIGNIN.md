# 🌐 GOOGLE OAUTH SIGNIN INTERFACE
> **사용자 인증 파이프라인 및 RLS 보안 식별자 매핑 규약**

본 문서는 Google Cloud Console의 OAuth 2.0 자격 증명 인프라와 Supabase Auth 레이어를 상호 결합하여 유저의 고유 세션을 안전하게 확보하는 사양을 정의합니다.

## 1. 인프라 매핑 사양
- **Provider:** Google OAuth 2.0 (Web Application)
- **Google Authorized Redirect URI:** Supabase Dashboard의 Authentication → Providers → Google 화면에 표시된 `https://<project-ref>.supabase.co/auth/v1/callback`
- **Supabase Site URL:** MVP production origin `https://what-im-supposed-to-did-it.vercel.app`
- **Supabase Redirect URLs:** production origin과 로컬 개발 origin(예: `http://localhost:3000`)을 정확히 등록
- **Security Logic:** 인증된 사용자의 Supabase UUID는 이후 사용자 소유 테이블의 `user_id`에 사용할 수 있습니다. 현재 MVP 로그인은 계정 정보만 표시하고 목표/대화 기록을 저장하지 않습니다. `ai_prescriptions`를 사용하는 별도 기능은 테이블 RLS를 계속 통과해야 합니다.

## 2. 프론트엔드 연동 SDK 명세 (`src/lib/auth.ts`)
- `supabase.auth.signInWithOAuth`: 구글 로그인 팝업 및 리다이렉트 처리 가동
- `supabase.auth.getUser`: 현재 세션의 고유 유저 컨텍스트 안전 포획
- MVP 상단의 `Google로 로그인`은 게스트 분석을 막지 않으며, 로그인 후 계정 이메일과 로그아웃을 표시합니다.
- 서버의 `DEMO_TEST_ACCOUNT_EMAIL`에 등록되고 Google 이메일 인증이 확인된 계정에만 네 개의 로컬 테스트 프로필 전환이 보입니다. 이 UI 전용 분기는 권한 경계가 아니며 민감 데이터 접근 제어는 항상 RLS 및 서버에서 별도로 검증해야 합니다.

---
AI responses may include mistakes. This is for infrastructure tracking purposes.
