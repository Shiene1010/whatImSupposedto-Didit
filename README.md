
📂 What I'm Supposed to, Did It (왙엠아이서포스투딛잍)

MVP에서 출발하여 CI/CD 자동화, 서킷 브레이커 장애 격리, 피처 플래그 통제, 8초 트랜잭션 롤백까지 무중단 운영 가드레일을 장착한 마크다운 기반 KPI 인텔리전스 인프라입니다.
본 레포지토리는 사용자의 비정형 마크다운(.md) 목표와 실전 대화록 스트림을 대조 분석하여, 완벽주의 성향의 유저들에게 최적의 4단 처방전(원문-5세-치트키-소리)을 제공하고 성취도를 실시간으로 추적하는 엔터프라이즈급 프로덕션 시스템입니다.

## ✅ 현재 상태
- 핵심 파서 및 KPI 엔진 검증 완료
- 테스트 스위트 통과: 3개 테스트 스위트, 4개 테스트 통과
- Supabase 원격 DB 점검 및 `ai_prescriptions` 권한 보완 완료
- 문서 체계 정리 완료: 아키텍처, 파서, AI 처방, KPI, 운영 가드레일 및 DB 상태 문서 포함
- GitHub 공개 저장소 반영 완료

## 📚 문서 인덱스
- [docs/01_ARCHITECTURE_OVERVIEW.md](docs/01_ARCHITECTURE_OVERVIEW.md): 전체 시스템 구조와 8단계 진화 모델
- [docs/02_CORE_PARSER_SPECIFICATION.md](docs/02_CORE_PARSER_SPECIFICATION.md): 마크다운 파서와 대화 스크립트 분리 명세
- [docs/03_AI_PRESCRIPTION_SCHEMA.md](docs/03_AI_PRESCRIPTION_SCHEMA.md): AI 처방 스키마 및 4단 처방 전략
- [docs/04_PERSONA_METADATA_REGISTRY.md](docs/04_PERSONA_METADATA_REGISTRY.md): 페르소나 메타데이터 레지스트리
- [docs/05_PURPLE_KPI_VALUATION_ENGINE.md](docs/05_PURPLE_KPI_VALUATION_ENGINE.md): 성취 판정 로직과 KPI 설계
- [docs/06_SYNTHETIC_DATA_FACTORY_GUIDE.md](docs/06_SYNTHETIC_DATA_FACTORY_GUIDE.md): 합성 데이터 생성 가이드
- [docs/07_ORANGE_CI_INTEGRATION_TEST.md](docs/07_ORANGE_CI_INTEGRATION_TEST.md): CI 자동화 및 품질 검증
- [docs/08_PURPLE_CD_SUPABASE_DEPLOYMENT.md](docs/08_PURPLE_CD_SUPABASE_DEPLOYMENT.md): 배포 및 운영 풀 설계
- [docs/09_DATABASE_MIGRATION_AND_RLS.md](docs/09_DATABASE_MIGRATION_AND_RLS.md): DB 스키마와 RLS 정책
- [docs/10_GREEN_CIRCUIT_BREAKER_SHELTER.md](docs/10_GREEN_CIRCUIT_BREAKER_SHELTER.md): 회로 차단기 설계
- [docs/11_YELLOW_FEATURE_FLAG_HOTFIX.md](docs/11_YELLOW_FEATURE_FLAG_HOTFIX.md): 피처 플래그 운영 기준
- [docs/12_BLUE_TRANSACTION_ROLLBACK_GATE.md](docs/12_BLUE_TRANSACTION_ROLLBACK_GATE.md): 롤백/거버넌스 안전장치
- [docs/13_GOOGLE_OAUTH_SIGNIN.md](docs/13_GOOGLE_OAUTH_SIGNIN.md): Google OAuth 로그인 설정
- [docs/14_SUPABASE_PROJECT_STATUS.md](docs/14_SUPABASE_PROJECT_STATUS.md): 원격 Supabase 스키마, 권한, 마이그레이션 점검 결과

🏗️ 1. 프로젝트 폴더 구조 (Project Architecture)

text
whatImSupposedto-Didit/
├── .github/workflows/
│   ├── 04_orange_ci_automation.yml  # Push/PR 시 TypeScript 컴파일 및 파싱 무결성 검증 (CI)
│   └── 05_purple_cd_deployment.yml  # main 브랜치 병합 시 Supabase Edge Functions 무인 배포 (CD)
├── assets/
│   ├── stage_02_samples/            # 정적 프로토타입 검증용 가상 마크다운 자산 (.md)
│   ├── stage_03_generated/          # AI 데이터셋 제너레이터가 대량 양산한 합성 텍스트 덤프 폴더
│   └── stage_05_repository_pool/    # 실운영자가 라이브 대화록을 깃 푸시하여 적재하는 실전 풀
├── database/migrations/
│   ├── 02_init_text_schema.sql      # Supabase 테넌트 및 처방전 적재 DDL 스키마
│   ├── 05_rls_theft_policy.sql      # 동료 표현 합법적 스틸(Steal)을 위한 Row Level Security 정책
│   ├── 08_rollback_rpc.sql          # 충돌 시 데이터 원상 복구를 위한 PostgreSQL RPC 함수
│   └── system_tables_setup.sql      # 피처 플래그 및 블루/그린 라우팅 설정 테이블
├── docs/                            # 시스템 설계, 운영 및 프로젝트 상태 문서
│   ├── 01_ARCHITECTURE_OVERVIEW.md
│   ├── 02_CORE_PARSER_SPECIFICATION.md
│   ├── 03_AI_PRESCRIPTION_SCHEMA.md
│   ├── 04_PERSONA_METADATA_REGISTRY.md
│   ├── 05_PURPLE_KPI_VALUATION_ENGINE.md
│   ├── 06_SYNTHETIC_DATA_FACTORY_GUIDE.md
│   ├── 07_ORANGE_CI_INTEGRATION_TEST.md
│   ├── 08_PURPLE_CD_SUPABASE_DEPLOYMENT.md
│   ├── 09_DATABASE_MIGRATION_AND_RLS.md
│   ├── 10_GREEN_CIRCUIT_BREAKER_SHELTER.md
│   ├── 11_YELLOW_FEATURE_FLAG_HOTFIX.md
│   └── 12_BLUE_TRANSACTION_ROLLBACK_GATE.md
├── src/
│   ├── core/                        # [Phase 1: 코어 제품 레이어] 정적 파서, 스플리터, GPT-4o 엔진
│   ├── automation/                  # [Phase 3: 양산 레이어] 페르소나 메타데이터 및 합성 제너레이터
│   ├── metrics/                     # [Phase 2: 판정 레이어] 🟣 Purple KPI 단 한 번의 실전 성취 판정기
│   └── operation/                   # [Phase 6~8: 운영 가드레일] 서킷 브레이커, 피처 플래그, 롤백 핸들러
└── tests/                           # 유닛, 스냅샷, CI 환경 전수 스트레스 테스트 스위트
Use code with caution.

🔄 2. 8단계 제품 진화 아키텍처 (The 8-Phase Evolution Model)

본 시스템은 정적 유닛 단위의 동작 보장에서부터 클라우드 무인 자동화, 나아가 실시간 다운타임 제로 제어 단계까지 유기적인 가드레일을 누적 탑재하며 확장됩니다.
1. Phase 1 (Core MVP): 비정형 마크다운 Front Matter 및 > , - [ ] 토큰 추출 파이프라인 수립.
2. Phase 2 (Proof with Samples): 목표 키워드가 차주 대화록 내부에서 완벽히 발견되는지 대조하는 성취 판정 로그 구현.
3. Phase 3 (Synthetic Factory): 4대 페르소나(이지비지, 뉴이어, 사라, 리나)에 빙의한 가상 자산 대량 자동 생성.
4. Phase 4 (Orange CI): GitHub Actions를 통해 양산된 대량의 텍스트 자산 깨짐 현상을 빌드 타임에 전수 검사하는 오렌지 가드레일.
5. Phase 5 (Purple CD & RLS): Supabase 에지 배포 및 동료 표현 합법적 스틸(Steal) 격리 보안 레이어 구축.
6. Phase 6 (Green Fault-Tolerant): AI API 통신 지연이 5초를 초과하면 회로를 즉시 차단(OPEN) 후 브라우저 IndexedDB 대피소로 분기 라우팅하여 유실률 0% 달성.
7. Phase 7 (Yellow Feature Flag): 실운영 에러 발생 시 데이터베이스 Config 토글 관리 장치를 통해 코드 재배포 없이 특정 컴포넌트를 무다운타임 긴급 진화.
8. Phase 8 (Blue Safe Governance): 8초 데드라인 타이머 기반 자동 복구 트랜잭션 및 다운타임 제로 프롬프트 블루/그린 원격 배포 거버넌스 완결.

📚 3. 엔지니어링 문서 명세 (Documentation Hub)

프로젝트 운영 및 온보딩 문서는 docs/ 디렉토리에서 확인할 수 있습니다.
• 아키텍처 및 코어 설계: 통합 시스템 흐름(01), 코어 마크다운 파서 및 스플리터 스펙(02), GPT-4o 구조화된 출력 스키마(03)
• 지표 및 자산 양산: 4대 페르소나 레지스트리(04), 🟣 퍼플 KPI 알고리즘 명세(05), 합성 데이터 팩토리 구동 가이드(06)
• 인프라 및 자동화: 🟠 오렌지 CI 전수 검사 규칙(07), 🟣 퍼플 CD Supabase 배포 규격(08), DB 스키마 및 RLS 합법 스틸 보안 정책(09)
• 운영 장애 수호 백서: 🟢 서킷 브레이커 및 로컬 대피소(10), 🟡 피처 플래그 긴급 핫픽스 런북(11), 🔵 8초 롤백 및 블루/그린 라우팅(12)
• 인증 및 DB 운영: Google OAuth 설정(13), 실제 Supabase 원격 스키마·권한 점검 결과(14)

🚀 4. 빠른 시작 및 실행 프로토콜 (Quick Start)


환경 세팅 (Prerequisites)

프로젝트 루트에 .env 파일을 생성하고 OpenAI 및 Supabase API 키를 주입합니다:
bash
cp .env.template .env
# 생성된 .env 파일 내부의 API_KEY 및 URL 변수값에 실전 인프라 토큰을 입력하세요.
Use code with caution.

1단계: 의존성 설치 및 무결성 빌드

bash
npm ci
npm run build
Use code with caution.

2단계: 테스트 자산 대량 양산 (Phase 3 시뮬레이션)

bash
npm run automation:generate
Use code with caution.

3단계: 가드레일 통합 테스트 및 스트레스 전수 검사 (Phase 2 & 4 시뮬레이션)

bash
npm run test
Use code with caution.

🚨 5. 라이브 서비스 비상 진화 운용 프로토콜 (Runbook)


시나리오 A: OpenAI API 장애 및 네트워크 병목 발생 시

• 시스템 자동 대응 (Phase 6): ApiCircuitBreaker.ts가 타임아웃(5000ms)을 감지하고 회로를 차단합니다.
• 데이터 보호: 사용자의 데이터 스트림은 즉시 프론트엔드 src/operation/localEmergencyStorage.ts로 우회 라우팅되어 브라우저 로컬 IndexedDB에 안전하게 대피 보존됩니다.

시나리오 B: 특정 페르소나 파서 렌더링에 깨짐 리스크 리포트 시

• 무다운타임 진화 조치 (Phase 7): 서버 재배포 없이 Supabase system_feature_flags 테이블의 설정을 변경합니다.
sql
UPDATE public.system_feature_flags 
SET is_enabled = false 
WHERE key = 'enable-phonics-hyphen-component';
Use code with caution.
• 결과: 캐시 TTL(30초) 경과 후 ToggleGateway.ts가 작동하여 하이픈 컴포넌트를 차단하고 안전한 일반 플레인 텍스트 모드로 실시간 우회 렌더링을 시작합니다.

시나리오 C: 파싱 트랜잭션 데드락 및 데이터 오염 발생 시

• 원자성 강제 수호 (Phase 8): RollbackHandler.ts가 가동하는 8초 데드라인 타이머가 작동합니다.
• 결과: 8초 이내에 처리가 완료되지 않을 경우 데이터베이스 저장 프로시저(execute_safe_prescription_transaction)가 동작을 완전 무효화(Abort)하여 오염 전 상태의 안전한 마크다운 백업 데이터셋 스냅샷을 완벽하게 보존합니다.