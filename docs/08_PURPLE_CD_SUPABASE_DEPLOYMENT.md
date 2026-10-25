# 🟣 PURPLE CD SUPABASE DEPLOYMENT
> **Supabase Edge Functions 무인 자동 배포(CD) 및 GitHub 레포지토리 푸시 웹훅 파이프라인 명세서**

본 문서는 오렌지 CI(지속적 통합) 가드레일을 통과한 코어가 실제 운영 서버 인프라인 Supabase 클라우드로 무다운타임 배포되는 메커니즘과, 원격 레포지토리 풀에 마크다운 대화록이 푸시되는 순간 실시간 라이브로 성취 로그를 업데이트하는 웹훅 게이트웨이의 운용 규격을 정의합니다.

---

## 🚀 1. 퍼플 CD 배포 자동화 아키텍처 (Continuous Deployment)

*   **메인 브랜치 게이트 파이프라인:** 오직 `main` 브랜치에 코드가 푸시되거나 풀 리퀘스트(PR)가 병합(Merge)되는 순간에만 운영 인프라 배포 단계가 발동합니다.
*   **Supabase CLI 무인화 에이전트:** GitHub Actions 가상 러너 환경 내부에서 공식 Supabase CLI 도구를 원격 가동하여, `repo-webhook-receiver` 에지 함수를 다운타임 없이 안전하게 배포(CD) 관리합니다.

---

## 📡 2. 레포지토리 데이터 풀 웹훅 처리 모델 (Git Webhook Pipeline)

실운영자가 레포지토리의 `assets/stage_05_repository_pool/` 폴더에 실전 대화록 마크다운 파일을 푸시하면, 시스템은 다음 파이프라인 프로세스를 실시간으로 트리거합니다.

```text
[운영자: 실전 대화록 Git Push] ➜ 1. GitHub 원격 레포지토리 내 Webhook 이벤트 감지 및 발송
                                     │
                                     ▼
[Supabase Edge Function 수신]  ➜ 2. `repo-webhook-receiver` 게이트웨이 유효성 검사 작동
                                     │
                                     ▼
[폴더 변경사항 분기 가드레일] ➜ 3. `assets/stage_05_repository_pool/` 하위 파일 여부 필터링
                                     │
                                     ▼
[코어 인텔리전스 라이브 가동] ➜ 4. mdStaticParser, scriptSplitter, purpleKpiEngine 순차 가동
                                     │
                                     ▼
[실시간 영속성 데이터 동기화] ➜ 5. `prescription_logs` 테이블 내 성취 이력 적재 및 라이브 갱신
```

---

## 🛠 `repo-webhook-receiver` 런타임 제어 및 필터 가드 규칙

원격 백엔드 에지 함수 내부에서 인프라 불필요 트래픽과 리소스 낭비를 방어하기 위해 집행하는 핵심 필터 규칙입니다.

1.  **CORS 프리플라이트 및 웹훅 무결성 가드:** 브라우저나 외부 요청으로부터의 오염을 막기 위해 OPTIONS 프리플라이트 차단 핸들러를 선제 가동하며, GitHub 표준 페이로드 구조체 유무를 정밀 엄격 검증합니다.
2.  **타겟 풀 디렉토리 변동 격리 검사:** GitHub Push 커밋 페이로드(`payload.commits`) 내부의 `modified` 및 `added` 파일 목록을 전수 순회하여, 오직 `assets/stage_05_repository_pool/` 하위의 마크다운 자산이 변경된 경우에만 코어 파이프라인을 작동시킵니다. 다른 소스 코드나 불필요 폴더의 커밋은 `200 SKIPPED` 신호를 반환하고 즉시 통신 줄기를 닫아 인프라 비용을 절감합니다.
3.  **서비스 롤(Service Role) 보안 우회 권한 획득:** 라이브 유저의 실시간 성취 상태를 즉각 데이터베이스에 동기화하기 위해, Supabase 내부 마스터 서비스 키인 `SUPABASE_SERVICE_ROLE_KEY`를 기반으로 클라이언트를 생성하여 RLS(행 단위 보안) 가드레일을 운영자 명의로 합법적 우회 통과합니다.

---

## 🚨 4. 시뮬레이션 및 장애 복구 대응 (Operational Recovery)

*   **CD 배포 거부 에러 (`Deploy Edge Functions Gateway` 단계 실패):** GitHub Secrets 패널에 수립된 `SUPABASE_ACCESS_TOKEN` 또는 `SUPABASE_PROJECT_ID` 토큰이 만료되었거나 불일치하는 상태입니다. 인프라 콘솔에 진입하여 원격 환경 변수를 재정비하십시오.
*   **웹훅 수신 먹통 현상 (GitHub Webhook Console 400/500 에러):** 배포된 에지 함수의 런타임 구문 파괴 또는 OpenAI API 통신 먹통이 발생한 상태입니다. 에지 함수가 동시 장착하고 있는 `try-catch` 복구 가드레일 에러 로그를 확인한 뒤, 외부 인프라 레이어의 통신 정상화 상태를 점검해야 합니다.
