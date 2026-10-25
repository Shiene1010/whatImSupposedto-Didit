# 🌐 GOOGLE OAUTH SIGNIN INTERFACE
> **사용자 인증 파이프라인 및 RLS 보안 식별자 매핑 규약**

본 문서는 Google Cloud Console의 OAuth 2.0 자격 증명 인프라와 Supabase Auth 레이어를 상호 결합하여 유저의 고유 세션을 안전하게 확보하는 사양을 정의합니다.

## 1. 인프라 매핑 사양
- **Provider:** Google OAuth 2.0 (Web Application)
- **Authorized Redirect URI:** `https://supabase.co`
- **Security Logic:** 발급된 유저 고유 `UUID`는 `public.ai_prescriptions.user_id` 외래키와 즉시 바인딩되며, 테이블에 걸려 있는 2기의 RLS 정책에 의해 타인의 접근이 철저히 차단됨.

## 2. 프론트엔드 연동 SDK 명세 (`src/lib/auth.ts`)
- `supabase.auth.signInWithOAuth`: 구글 로그인 팝업 및 리다이렉트 처리 가동
- `supabase.auth.getUser`: 현재 세션의 고유 유저 컨텍스트 안전 포획

---
AI responses may include mistakes. This is for infrastructure tracking purposes.
