# 🟠 ORANGE CI INTEGRATION TEST
> **GitHub Actions 기반 런타임 스트레스 테스트 및 대량 합성 데이터셋 전수 검증 규칙**

본 문서는 개발자가 코드를 수정하거나 마크다운 자산을 업데이트하여 깃 레포지토리에 반영할 때, 인프라 배포 전 단계에서 전체 시스템의 안정성과 파싱 무결성을 원격 격리 검증하는 **🟠 오렌지 CI(지속적 통합) 가드레일**의 운용 명세를 정의합니다.

---

## 🎯 1. 오렌지 CI 가드레일 철학 (Philosophy)

*   **메인 브랜치 무결성 수호:** 검증되지 않은 코드나 서식이 파괴된 마크다운 파일이 메인(main) 및 개발(develop) 브랜치에 오염되는 것을 원천 차단합니다.
*   **합성 데이터 스트레스 테스트 (Bulk Stress Testing):** Phase 3에서 AI 데이터 팩토리가 자동 양산한 수백 개의 가상 비정형 마크다운 자산들을 CI 러너 내부에서 한꺼번에 전부 순회 파싱하여, 엔진의 한계점과 호환성을 자동으로 추적합니다.

---

## ⚙️ 2. 파이프라인 자동화 실행 흐름 (CI Workflow Sequence)

`.github/workflows/04_orange_ci_automation.yml` 파일에 명세된 가상 Ubuntu 러너는 푸시(Push) 및 풀 리퀘스트(PR) 이벤트 발생 시 다음 단계를 순차 실행합니다.

```text
[코드/자산 변경 이벤트] ➜ 1. 격리 러너 환경 기동 (Ubuntu-Latest 인프라 확보)
                              │
                              ▼
[원격 코드 동기화]      ➜ 2. Actions Checkout (소스 코드 및 자산 100% 동기화)
                              │
                              ▼
[환경 및 캐싱 구성]     ➜ 3. Node.js 20 런타임 세팅 & npm ci 패키지 락킹 설치 (npm 캐시 활용)
                              │
                              ▼
[컴파일 무결성 검증]   ➜ 4. npm run build (TypeScript 구문 및 타입 불일치 전수 검사)
                              │
                              ▼
[스트레스 회귀 테스트] ➜ 5. npm test (syntheticBulk.test.ts 기반 가상 데이터 전수 파싱 실행)
```

---

## 🛠️ 3. 대량 합성 데이터셋 전수 런타임 검증 규칙 (Bulk Test Protocol)

CI 파이프라인의 최종 통과 여부를 결정하는 핵심 가드레일인 `tests/syntheticBulk.test.ts` 스크립트는 다음 4단계 크래시 방어 정책에 따라 작동합니다.

1.  **디렉토리 유효성 및 멱등성 가드:** `assets/stage_03_generated/` 폴더가 비어있거나 존재하지 않을 경우, 테스트 러너를 크래시시키지 않고 경고(`console.warn`) 출력 후 정상 패스 처리하여 파이프라인의 유연한 가동을 보장합니다.
2.  **정적 파서 크래시 가드 (`mdStaticParser.ts`):** 양산된 마크다운 문자열을 주입했을 때, 런타임 예외가 터지지 않고(`not.toThrow()`) 인격 ID 데이터가 JSON 구조체 프론트매터에 정확히 안착되는지 검증합니다.
3.  **발화 스플리터 크래시 가드 (`scriptSplitter.ts`):** 비정형 스크립트 본문에서 페르소나 메타 정보에 매핑된 실제 닉네임을 기준으로 에러 없이 대화 배열을 발라내는지 확인합니다.
4.  **퍼플 KPI 엔진 무결성 가드 (`purpleKpiEngine.ts`):** 최종적으로 파싱된 객체들이 결합되었을 때 `isAchieved` 및 `achievementRate` 지표를 완벽히 도출해내는지 타입과 스키마를 강제 검증합니다.

---

## 🚨 4. 빌드 실패 시 긴급 대응 프로토콜 (Troubleshooting)

*   **컴파일 에러 (`Compile TypeScript Verification` 단계 실패):** 최근 수정된 TypeScript 소스 코드의 타입 정의가 꼬였거나 문법 오류가 발생한 상태입니다. 로컬 터미널에서 `npm run build`를 단독 실행하여 타입을 재정비하십시오.
*   **테스트 실패 (`Execute Automated Regression Tests` 단계 실패):** AI 가상 양산 자산 중 특정 비정형 기호 기포 깨짐이나 파싱 예외가 발견된 상태입니다. `tests/syntheticBulk.test.ts` 실패 로그에 찍힌 라인 번호와 페르소나 ID를 기반으로 해당 마크다운 자산의 정규식 패턴 예외를 우회 방어하도록 코어 파서를 보정해야 합니다.
