# MVP 시연 계정 데이터 초기화

## 대상과 범위

- 고정 시연 계정의 Supabase 사용자 UUID: `36f604b8-6855-45d1-a9ee-75a94463e6a1`
- 초기화 함수: `public.reset_demo_account_data()`
- 삭제 대상: `public.ai_prescriptions`, `public.demo_subscriptions`, `public.demo_subscription_payments`, `public.demo_test_memberships`, `public.demo_test_billing_events`에서 해당 UUID가 소유한 행
- Supabase Auth 사용자 계정, 다른 사용자의 데이터, GitHub webhook 전달 메타데이터는 삭제하지 않습니다.
- 셀프 탈퇴 API는 서버 설정 `DEMO_TEST_ACCOUNT_EMAIL`에 등록된 Google 계정에 대해서만 본인 테스트 데이터와 Auth 사용자를 삭제합니다.
- 이 MVP의 게스트 목표·대화록 분석은 저장되지 않습니다. 추후 사용자별 후기 등 앱 테이블을 추가할 때에는 그 테이블의 사용자 소유 행을 함수와 검증에 명시적으로 추가해야 합니다.
- 현재 결제 흐름은 모의 전용이며 실제 결제나 청구가 없습니다.

## 시연 직전 실행

Supabase Dashboard의 프로젝트 SQL Editor에서 다음을 실행합니다.

```sql
SELECT * FROM public.reset_demo_account_data();
```

반환되는 `deleted_*` 값으로 제거된 행 수를 확인합니다. 반복 실행은 안전하며, 이미 비워진 경우 `0`을 반환합니다. 이 함수는 고정 UUID를 인자로 받지 않으므로 다른 사용자를 대상으로 호출할 수 없습니다.

## 권한과 운영 주의

- 실행 권한은 `service_role` 및 데이터베이스 소유자/관리자에 한정합니다. `PUBLIC`, `anon`, `authenticated`에는 실행 권한이 없습니다.
- `SECURITY DEFINER` 함수는 고정된 UUID 하나만 대상으로 하며, `search_path`를 비워 객체 이름을 명시적으로 한정합니다.
- 운영자가 요청한 “시연 직전 실행” 방식이므로 자동 스케줄이나 사용자 UI 버튼은 만들지 않았습니다. 시연 준비 담당자가 SQL Editor에서 명시적으로 실행합니다.
- 애플리케이션 코드나 브라우저에 `service_role` 키를 넣지 않습니다.
- 앱의 테스트 계정 탈퇴 기능은 allowlist 이메일을 서버에서 확인한 뒤 해당 사용자 행을 삭제하고 Auth 사용자도 제거합니다. 운영자가 시연 데이터를 지울 때는 SQL Editor의 초기화 함수를 사용하세요.
