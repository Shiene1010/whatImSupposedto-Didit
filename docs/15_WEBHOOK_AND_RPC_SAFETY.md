# GitHub Webhook 및 RPC 안전성

> 구현 상태: 2026-10-26

## GitHub webhook 저장 계약

GitHub push webhook 전달은 Supabase 사용자 행위가 아니라 비공개 서버 이벤트로 취급합니다. GitHub의 숫자형 `sender.id`를 `auth.users.id`로 변환하거나, 이벤트를 사용자 처방으로 저장하지 않습니다.

`database/migrations/20261026050427_create_private_github_webhook_deliveries.sql`은 `public.github_webhook_deliveries`를 생성합니다. 저장 필드는 GitHub 전달 UUID, 저장소 전체 이름, 이벤트 종류, 커밋 수, `assets/stage_05_repository_pool/`에서 변경된 고유 파일 수, 수신 시각뿐입니다. 원본 payload, sender 정보 및 처방 본문은 저장하지 않습니다.

RLS와 `FORCE ROW LEVEL SECURITY`를 활성화하고 `anon` 및 `authenticated`의 모든 테이블 권한을 회수했습니다. `service_role`에는 INSERT만 부여했습니다. 전달 UUID가 기본 키이므로 같은 전달의 재시도는 중복 처리됩니다.

## GitHub 요청 인증

Edge Function은 요청 본문 원시 바이트의 HMAC-SHA256을 `x-hub-signature-256`과 비교한 뒤에만 JSON을 파싱합니다. 비교는 전체 digest를 순회하며, 잘못되거나 누락된 signature는 401로 거절합니다. 비밀 설정이 빠져 있으면 요청을 받지 않고 500을 반환합니다. POST 외 메서드는 405입니다.

GitHub webhook은 Supabase JWT를 보내지 않으므로 배포 workflow에서 해당 함수의 JWT 검증을 비활성화합니다. 함수는 대신 GitHub signature 검증을 반드시 통과해야 하므로 JWT 옵션만 끄고 webhook secret을 생략해서는 안 됩니다.

운영 설정:

1. Supabase Edge Function secret `GITHUB_WEBHOOK_SECRET`에 예측 불가능한 webhook 전용 값을 저장합니다.
2. 같은 값을 GitHub 저장소 **Settings → Webhooks**의 webhook secret으로 설정하고, payload URL을 `https://<project-ref>.supabase.co/functions/v1/repo-webhook-receiver`로 지정합니다.
3. 이벤트는 Push만 선택하고 HTTPS를 사용합니다. 비밀 값을 코드, Actions 로그, README 또는 채팅에 넣지 않습니다.
4. secret 회전 시 양쪽 설정을 조율해 업데이트하고, 새 값 검증 후 이전 값을 폐기합니다.

현재 webhook secret을 Supabase와 GitHub 양쪽에 설정하기 전에는 함수가 정상 webhook 요청을 처리하지 않습니다. GitHub 저장소 webhook 생성은 별도 운영 설정입니다.

## 전달 처리와 오류 응답

- Push payload의 `repository.full_name`, `commits`, 각 커밋의 `added`/`modified`/`removed` 배열을 검증합니다.
- 대상 풀 디렉터리에서 변경된 고유 경로만 집계하고, 이벤트 요약을 service-role 전용 테이블에 저장합니다.
- 중복 전달은 기존 레코드를 다시 만들지 않고 성공형 `DUPLICATE` 응답을 반환합니다.
- DB INSERT 오류는 500으로 반환합니다. 성공 응답은 저장 성공 뒤에만 발생합니다.
- 원본 webhook body는 저장하지 않으며 GitHub sender로부터 Supabase 사용자 ID를 유추하지 않습니다.

Edge Function 검증:

```bash
deno check --no-lock supabase/functions/repo-webhook-receiver/index.ts
deno test --no-lock supabase/functions/repo-webhook-receiver/*.test.ts
```

## RPC timeout의 한계

현재 원격 DB에는 `execute_safe_prescription_transaction` RPC가 없으며, 해당 함수의 생성 마이그레이션도 저장소에 없습니다. RPC를 호출하는 코드만으로 DB 트랜잭션을 안전하게 중단했다고 간주할 수 없습니다.

클라이언트 deadline을 넘으면 요청에 `AbortSignal`을 전달해 중단을 요청하지만, 연결 중단이 DB 서버의 실행/커밋을 확실히 취소했음을 보장하지는 않습니다. 따라서 반환 상태는 `TIMEOUT_INDETERMINATE`입니다. `TIMEOUT_ROLLED_BACK`처럼 롤백을 보장한다고 표현하지 않습니다. 실제 원자적 제한이 필요하면 이후 RPC 생성 시 서버 측 statement timeout과 트랜잭션 의미를 정의·검증하고, timeout 이후 DB 상태를 확인하는 테스트를 추가해야 합니다.

`RollbackHandler`는 호출처가 확인되지 않은 스캐폴딩이며, 현재 애플리케이션에서 실행되는 RPC 경로라고 간주하지 않습니다.
