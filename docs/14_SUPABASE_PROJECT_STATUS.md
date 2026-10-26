# Supabase 프로젝트 상태 점검

> 점검 및 보완: 2026-10-26

이 문서는 Supabase 원격 프로젝트에서 직접 확인한 상태와 적용한 DB 권한 보완을 기록합니다. 스키마 명세나 로컬 SQL 파일만으로 원격 DB 상태를 추정하지 않습니다.

## 현재 원격 상태

- 기본 `main` 브랜치 상태는 `ACTIVE_HEALTHY`입니다.
- 적용된 마이그레이션은 `add_ai_prescriptions_table`, `harden_ai_prescriptions_access`, `create_private_github_webhook_deliveries`입니다.
- `public` 스키마의 애플리케이션 테이블은 `ai_prescriptions`, `github_webhook_deliveries`입니다.
- `ai_prescriptions`에는 `auth.users(id)` 참조, 처방 내용, 생성 시각, 신뢰도 및 입력 유형 필드가 있으며 RLS가 활성화되어 있습니다.
- 프로젝트에는 Auth 사용자가 존재합니다. 사용자 수나 개인정보는 이 문서에 기록하지 않습니다.

## 적용된 권한 및 RLS

`database/migrations/20261026034659_harden_ai_prescriptions_access.sql`을 원격 DB에 적용했습니다.

| 역할 | 권한 |
| --- | --- |
| `anon` | 테이블 권한 없음 |
| `authenticated` | `SELECT`, `INSERT` |
| `service_role` | 기존 관리자 권한 유지 |

RLS 정책은 인증 사용자가 `auth.uid() = user_id`인 행만 읽고 삽입하도록 제한합니다. 정책에서 `auth.uid()`를 `(SELECT auth.uid())` 형태로 평가하도록 바꾸었고 `user_id` 인덱스를 추가했습니다. `UPDATE`, `DELETE`, `TRUNCATE`는 `anon` 및 `authenticated`에 허용하지 않습니다.

원격 권한/정책 검증 결과 위 제한이 반영되어 있습니다. RLS는 활성화되어 있으나 `FORCE ROW LEVEL SECURITY`는 설정하지 않았습니다. 테이블 소유자와 `service_role`은 운영상 RLS를 우회할 수 있으므로 관리자 키를 서버 전용으로 관리해야 합니다.

`github_webhook_deliveries`는 GitHub push 전달 ID, 저장소 이름, 커밋 수, 대상 풀 파일 수, 수신 시각만 기록합니다. RLS와 `FORCE ROW LEVEL SECURITY`가 켜져 있고 `anon`/`authenticated`에는 테이블 권한이 없습니다. `service_role`은 INSERT만 할 수 있습니다. GitHub sender를 Supabase 사용자로 간주하지 않으며 원본 payload나 사용자 처방 본문도 보관하지 않습니다.

## 코드와 원격 스키마 간 미해결 불일치

다음 테이블은 현재 원격 `public` 스키마에서 확인되지 않았지만 코드 또는 로컬 SQL에서 참조됩니다.

| 이름 | 참조 위치/용도 | 상태 |
| --- | --- | --- |
| `system_feature_flags` | `src/operation/featureFlag.ts`의 원격 기능 플래그 | 로컬 `database/migrations/00_system_tables_setup.sql`에는 정의가 있으나 원격에는 없음 |
| `system_routing_config` | `src/operation/promptBlueGreenRouter.ts`의 프롬프트 라우팅 설정 | 로컬 `database/migrations/00_system_tables_setup.sql`에는 정의가 있으나 원격에는 없음 |
| `prescription_logs` | 레거시 사용자 처방 로그 | 중첩된 레거시 SQL `database/migrations/database/migrations/02_init_text_schema.sql`에 정의되어 있으나 원격에는 없음. GitHub webhook은 이 테이블에 쓰지 않음 |
| `user_profiles` | 레거시 처방 로그의 소유자 및 `database/migrations/05_rls_theft_policy.sql`의 RLS 대상 | 중첩된 레거시 SQL `database/migrations/database/migrations/02_init_text_schema.sql`에 정의되어 있으나 원격에는 없음 |

기능 플래그/라우팅 설정 테이블의 권한 정책과 레거시 테이블의 데이터 공개 범위가 결정되기 전에는 해당 테이블을 원격에 생성하지 않습니다. 중첩 레거시 SQL은 `.gitignore`에 의해 제외되어 있어 현재 일반 마이그레이션 파일 목록과 커밋에 포함되지 않습니다. 현재 Edge Function은 GitHub `sender.id`를 UUID `user_id`로 전달하지 않고, 사용자 처방과 분리된 비공개 전달 메타데이터만 저장합니다.

## Advisor 점검 결과

- **보안 경고:** Supabase Auth의 유출 비밀번호 보호 기능이 비활성화되어 있습니다. [설정 안내](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- **정보성 성능 알림:** 신규 `ai_prescriptions_user_id_idx`는 아직 사용 이력이 없습니다. 테이블 사용량이 적어 현재 결과만으로 제거할 이유는 없으며 실제 조회 성능을 관찰합니다.
- 이전에 보고된 RLS 함수 재평가 알림은 정책을 `(SELECT auth.uid())`로 변경한 뒤 더 이상 나타나지 않았습니다.

## 마이그레이션 운영

1. 새 DB 변경은 `database/migrations/`에 타임스탬프가 포함된 SQL 파일로 저장합니다.
2. 적용 전 기존 로컬 SQL과 원격 스키마를 대조하고, 접근 역할 및 RLS 정책을 검토합니다.
3. 원격 DDL은 Supabase 마이그레이션으로 적용한 뒤 테이블, 정책, 권한을 다시 조회해 확인합니다.
4. `supabase/.temp/` 및 `.env`에는 로컬 연결 상태나 비밀 값이 있을 수 있으므로 커밋하지 않습니다.

## 이번 변경의 범위

이번 점검에서는 `ai_prescriptions`의 익명 및 인증 사용자에 대한 과도한 테이블 권한을 축소하고, 본인 소유 행에 대한 기존 조회/삽입 동작을 유지했습니다. 별도 `github_webhook_deliveries` 테이블을 추가해 비공개 웹훅 처리 메타데이터만 기록하도록 했습니다. `system_feature_flags`, `system_routing_config`, `prescription_logs`, `user_profiles`는 생성하거나 적용하지 않았습니다.
