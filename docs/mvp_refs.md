
# MVP reference: 원본 PRD 및 제품 UI 요구사항

> 이 문서는 장기 제품 비전과 과거 제안 사항을 보존하는 참고 자료입니다. 여기에 적힌 기술, 화면, 인증, AI, DB 정책 및 기능은 현재 구현 상태를 보증하지 않습니다.
> 구현 기준과 우선순위는 [MVP 구현 상세서](17_MVP_IMPLEMENTATION_SPEC.md) 및 [.github/agents/mvp-agent.agent.md](../.github/agents/mvp-agent.agent.md)를 따릅니다.

## 원본 PRD

# **`whatImSupposedto-Didit MVP 제품 요구사항 정의서 (PRD)`**

### **`1. 프로젝트 비전 및 핵심 목적 (Project Vision & Core Purpose)`**

#### **`1.1. 비전 및 해결하고자 하는 문제`**

### `완벽주의 성향을 가진 사용자들은 목표를 세울 때 높은 기준과 실패에 대한 방어 기제로 인해 극심한 인지적 부하(Cognitive Load)를 경험하며, 이는 실행 회피나 중도 포기로 이어집니다. whatImSupposedto-Didit 서비스는 '올 오어 나싱(All-or-Nothing)' 방식의 정량적 완벽주의를 해체하고, 거창한 계획 없이도 일상에서 실천한 단 한 번의 작은 시도(Single-Hit)를 포착하여 행동의 연속성을 유지하도록 돕는 것을 핵심 비전으로 삼습니다.`

| `완벽주의 사용자의 심리적 장벽` | `서비스의 핵심 해결 패러다임` |
| :---- | :---- |
| **`완벽한 수행 압박:`** `100% 달성하지 못하면 실패라는 인지적 회피 발생` | **`단 한 번의 시도 인정:`** `대화나 기록 속 single-hit 행동을 감지하여 성취로 인정` |
| **`추상적·선언적 계획:`** `실행 경계가 불분명하여 시작 전 인지적 부하 증대` | **`AI 4단 처방:`** `원문 목표를 5세 수준 치트키 및 소리/감각 단서로 정밀 구조화` |
| **`네트워크/시스템 장애 시 포기:`** `기록 유실 시 심리적 좌절감 극대화` | **`그린 대피소(IndexedDB):`** `0% 유실률 오프라인 백업 및 무다운타임 회복력 제공` |

#### **`1.2. 핵심 솔루션 패러다임: AI 4단 처방 및 Purple KPI`**

* ### **`AI 4단 처방 엔진:`** `사용자가 작성한 비정형 마크다운 목표 파일(*_target.md)과 대화록 스트림(*_script.md)을 파싱하여, 완벽주의적 부담감을 완화하는 **"원문 유지 ➔ 5세 치트키 ➔ 소리/감각 ➔ 실행 전환"**의 4단계 실행 구조로 자동 변환합니다.`

* ### **`🟣 Purple KPI(퍼플 지표) 판정 엔진:`** `일주일 전체 달성 여부를 따지는 대신, 유저 발화 데이터 속에서 단 한 번의 시도라도 포착되면 성공으로 채점하는 Single-Hit Success (단 한 번의 시도 통착) 철학을 기반으로 동작합니다.`

  #### **`1.3. MVP 인프라 및 지속 가능한 웹 서비스 목표`**

### `본 프로젝트는 무장벽 브라우저 단독 클라이언트 데모 환경에서 출발하여, 보안성과 확장성을 갖춘 프로덕션 웹 서비스로 지속 가능한 전환 및 검증을 달성하는 것을 목적으로 합니다.`

* ### **`게스트 모드 실행 구동:`** `브라우저 단독 환경에서 React 상태 기반 룰 기반 파싱 및 데모 템플릿 처방을 수행하며, 외부 API 호출이나 DB 적재 없이 100% 클라이언트 단에서 실행됩니다.`

* ### **`인증 레이어:`** `Google OAuth 2.0 (Web Application) 자격 증명 연동`

* ### **`백엔드 & DB 레이어:`** `Supabase PostgreSQL 및 Row Level Security (RLS) 보안 정책`

* ### **`클라이언트 & 에지 런타임:`** `React, Vercel 배포 환경 및 Supabase Edge Functions (repo-webhook-receiver)`

  ### **`2. 사용자 등급 및 라이프사이클 정의 (User Tiers & Lifecycle)`**

  #### **`2.1. 4단계 사용자 등급 체계`**

| `등급명` | `인증 방식` | `제공 기능 및 쿼터` | `DB / 데이터 영속성 범위` |
| :---- | :---- | :---- | :---- |
| **`게스트 (Guest)`** | `미인증 (No-Auth)` | `무장벽 로컬 데모 체험, 브라우저 단독 룰 기반 파싱(parseMarkdown, splitScriptByUser), KPI 판정(evaluatePurpleKpi) 및 템플릿 처방` | `DB/API 미전송, React 상태 및 브라우저 메모리에만 일시 보존` |
| **`로그인 (Free)`** | `Google OAuth 2.0 세션` | `RLS 보안 개인 공간 제공, 주 3회 기본 AI 처방전 생성, 동료 표현 스틸(Peer Steal) 기능` | `Supabase DB 영구 적재, RLS 정책에 의한 본인 데이터 격리 보호` |
| **`구독 (Pro - BYOK)`** | `Google OAuth + 개인 API Key` | `개인 Google Gemini API Key 연동 기반 무제한 AI 4단 처방, 실시간 Purple KPI 구출, 그린 서킷 브레이커 & IndexedDB 대피소 동기화` | `Supabase DB 영구 적재 및 DidItEmergencyShelterIndexedDB 오프라인 백업 지원` |
| **`구독중단 (Canceled)`** | `Google OAuth 2.0 세션 유지` | `성취 기록 및 기존 4단 처방 로그 영구 보존, Pro 전용 무제한 AI 생성 중단 및 Free 등급 쿼터(주 3회)로 전환` | `기존 DB 적재 데이터 보존, 신규 생성 쿼터만 제한` |

  #### **`2.2. 등급 간 전환 및 데이터 이관 규칙`**

1. ### **`게스트 ➔ 로그인 (Free) 전환 시나리오:`**

   * ### `EXECUTE_OAUTH_LOGIN: Google OAuth 2.0 인증 절차를 거쳐 고유 auth.users UUID를 발급받고 유저 세션을 생성합니다.`

   * ### `MIGRATE_GUEST_SESSION: 게스트 상태에서 작성된 브라우저 메모리 내 목표 및 발화 텍스트 데이터를 신규 생성된 user_id와 바인딩하여 Supabase DB로 동기화합니다.`

2. ### **`로그인 (Free) ➔ 구독 (Pro - BYOK) 전환 시나리오:`**

   * ### `REGISTER_GEMINI_KEY: 클라이언트 측에서 사용자의 개인 Google Gemini API Key를 입력받아 세션 암호화 스토리지에 안전하게 보관합니다.`

   * ### `ACTIVATE_UNLIMITED_QUOTA: 주간 생성 쿼터 제한을 해제하고, 그린 서킷 브레이커 및 IndexedDB 대피소 연동을 활성화합니다.`

3. ### **`구독 (Pro) ➔ 구독중단 (Canceled) 전환 시나리오:`**

   * ### `RESTRICT_QUOTA_RETAIN_DATA: 사용자의 결제 해지 또는 키 중단 시, 기존에 생성된 ai_prescriptions및 성취 로그는 영구 보존하되 신규 AI 처방전 생성 기능은 Free 등급 쿼터(주 3회)로 강제 제한합니다.`

     ### **`3. 핵심 기능 요구사항 백로그 (Feature Backlog: P0 / P1 / P2)`**

     #### **`3.1. P0 (Must-Have) - 필수 핵심 기능`**

* ### **`F-P0-01: Google OAuth + Supabase Auth 연동`**

  * ### **`상세 설명:`** `Google Cloud Console OAuth 2.0 자격 증명과 Supabase Auth 레이어를 결합하여 사용자 세션을 안전하게 생성하고 관리합니다.`

  * ### **`수용 기준:`** `인증 성공 시 발급된 UUID가 DB 내 ai_prescriptions.user_id 외래키로 바인딩되어야 하며, RLS 정책에 의해 타인의 접근이 철저히 차단되어야 합니다.`

* ### **`F-P0-02: 정적 마크다운 파서 (mdStaticParser)`**

  * ### **`상세 설명:`** `외부 서드파티 라이브러리 없이 TypeScript 네이티브 구현을 통해 YAML Front Matter, 인용구(>), 체크리스트(- [ ], - [x])를 정밀 추출합니다.`

  * ### **`수용 기준:`** `Front Matter 미폐쇄 시 전체 텍스트를 rawBody로 안정적으로 이관 처리하고, 체크리스트의 불리언 매핑이 정확히 수행되어야 합니다.`

* ### **`F-P0-03: 다중 발화 스크립트 스플리터 (scriptSplitter)`**

  * ### **`상세 설명:`** `혼합 대화록에서 지정된 닉네임의 발화만을 3단계 정규식 매칭 패턴을 통해 분리 추출합니다.`

  * ### **`수용 기준:`** `볼드(**닉네임**), 대괄호([닉네임]), 콜론(닉네임:) 순위대로 매칭을 시도하고 대소문자 무감각 처리(toLowerCase())를 보장해야 합니다.`

* ### **`F-P0-04: AI 4단 처방 엔진 연동`**

  * ### **`상세 설명:`** `파싱된 컨텍스트를 GPT-4o 또는 Gemini API에 주입하여 4단계 실행 처방 구조체(AiPrescriptionSchema) 형태로 변환합니다.`

  * ### **`수용 기준:`** `originalText, simplifiedText, cheatCodeText, sensoryText, actionPlan(3~5개), confidence 필드를 가진 JSON으로 반환되어야 합니다.`

* ### **`F-P0-05: Purple KPI 판정 엔진 (purpleKpiEngine)`**

  * ### **`상세 설명:`** `목표 키워드와 사용자 실전 발화를 대조하여 단 한 번의 실행이라도 발견되면 성공으로 판정합니다.`

  * ### **`수용 기준:`** `키워드 매칭 실패 시에도 화이트리스트 강제 보정 기호 발견 시 isAchieved: true 결과를 반환해야 합니다.`

* ### **`F-P0-06: Supabase DB & RLS 보안 정책 수립`**

  * ### **`상세 설명:`** `PostgreSQL 테이블 구조 수립 및 사용자 간 데이터 격리를 위한 RLS 정책을 적용합니다.`

  * ### **`수용 기준:`** `인증된 사용자는 본인 소유((SELECT auth.uid()) = user_id)의 행만 읽고 삽입할 수 있어야 합니다.`

    #### **`3.2. P1 (Should-Have) - 핵심 운영 및 검증 기능`**

1. ### **`옐로우 피처 플래그 운영 시스템 (FeatureFlagEngine / system_feature_flags / enable-web-mvp):`**

   * ### `운영 목적: 코드 재배포 없이 30초 내에 핵심 MVP 기능 스위치(enable-web-mvp) 및 장애 컴포넌트를 우회 경로로 전환시킵니다.`

   * ### `트리거 조건: Supabase system_feature_flags 테이블의 is_enabled 스위치 변경 시 30초 TTL 캐시 만료 후 자동 적용됩니다.`

2. ### **`오렌지 CI 대량 회귀 테스트 파이프라인 (syntheticBulk.test.ts / GitHub Actions):`**

   * ### `운영 목적: 푸시 및 PR 이벤트 발생 시 합성 마크다운 데이터셋 자산 전체를 CI 러너에서 전수 검사하여 파싱 크래시 및 타입 파괴를 방지합니다.`

   * ### `트리거 조건: 메인/개발 브랜치 푸시 또는 PR 생성 시 .github/workflows/04_orange_ci_automation.yml 실행.`

3. ### **`퍼플 CD Edge Function 무인 배포 게이트웨이 (repo-webhook-receiver):`**

   * ### `운영 목적: GitHub 원격 푸시 이벤트를 감지하여 HMAC-SHA256 서명(x-hub-signature-256) 검증을 거친 후, 비공개 배달 메타데이터(커밋 수, 변경된 자산 파일 수 등)를 github_webhook_deliveries에 기록합니다. (단, 사용자 처방 파싱이나 사용자 테이블 쓰기 행위는 수행하지 않음)`

   * ### `트리거 조건: GitHub Webhook Push 이벤트 유입 및 HMAC-SHA256 서명 검증 통과 시.`

     #### **`3.3. P2 (Nice-to-Have) - 고급 회복성 및 소셜 기능`**

* ### **`그린 서킷 브레이커 & IndexedDB 대피소 (DidItEmergencyShelter):`**

  * ### `장애 대응: API 통신 5초 초과 또는 3회 연속 에러 발생 시 회로를 OPEN하고, 작성 중인 마크다운을 브라우저 IndexedDB의 markdown_backups 스토어에 PENDING_SYNC 상태로 백업하여 데이터 유실률 0%를 달성합니다.`

  * ### `사용자 가치: 오프라인 및 인프라 마비 상황에서도 유저의 작성 노력이 완전하게 보존됩니다.`

* ### **`블루 8초 타임아웃 제한 및 프롬프트 원격 라우팅 게이트 (system_routing_config / RollbackHandler):`**

  * ### `장애 대응: 백엔드 처리 시간 8초 초과 시 클라이언트 단에서 요청을 차단하며 상태는 TIMEOUT_INDETERMINATE로 처리됩니다 (원격 RPC 미적용 상태로 인해 서버 롤백 미보장). 또한, DB의 system_routing_config 스위칭을 통해 1초 만에 AI 프롬프트 버전을 원격 전환(v2.0_BLUE ↔ v2.1_GREEN)합니다.`

  * ### `사용자 가치: 시스템 블로킹 현상을 방지하고 고도화된 프롬프트를 무다운타임으로 실시간 경험할 수 있습니다.`

* ### **`동료 표현 스틸 기능 (Peer Steal / is_stolen_from_peer):`**

  * ### `장애 대응/소셜 확장: RLS의 FOR SELECT 상시 개방 정책을 활용하여 타인의 훌륭한 4단 처방/표현을 조회하고, 내 보관함으로 복제(is_stolen_from_peer = true, source_log_id 기록)하여 내 명의로 안전하게 적재합니다.`

  * ### `사용자 가치: 타인의 실천 사례를 공유받아 완벽주의 부담감을 낮추고 정서적 실행 동기를 얻습니다.`

    ### **`4. 핵심 엔지니어링 모듈 및 데이터 스키마 명세 (Core Intelligence & Data Specs)`**

    #### **`4.1. 정적 파서 및 발화 스플리터 모듈 (mdStaticParser & scriptSplitter)`**

### `mdStaticParser는 YAML Front Matter(---), 인용구(> ), 체크리스트(- [ ], - [x])를 외부 의존성 없이 경량 추출합니다. scriptSplitter는 대화 스크립트에서 특정 닉네임의 발화를 아래 매칭 매트릭스 순위에 따라 분리합니다.`

| `우선순위` | `타겟 텍스트 패턴 예시` | `대응 정규식 (Regex Pattern)` | `파싱 결과 분리 가이드` |
| :---- | :---- | ----- | :---- |
| **`1순위`** | **`EasyPeasy`**`: 오늘 성공!` | `/^\s*\*\*(.*?)\*\*?\s*:\s*(.*)/` | `볼드 기호 내부 문자열을 닉네임으로 추출` |
| **`2순위`** | `[EasyPeasy] 단어 외움` | `/^\s* $(.*?)$ \s*:?\s*(.*)/` | `대괄호 내부 문자열을 닉네임으로 추출` |
| **`3순위`** | `EasyPeasy: 소리 읽기 완료` | `/^\s*([^:\s]+)\s*:\s*(.*)/` | `콜론(:) 이전의 연속된 문자열을 닉네임으로 추출` |

* ### **`크래시 방어 및 바이패스 가이드라인:`** `인용구(> ) 및 체크리스트(- [ ], - [x]) 행 내부에 콜론(:)이 포함되어 있더라도 3순위 일반 명사 매칭 규칙이 오작동하지 않도록 3순위 매칭 스캔 대상에서 물리적으로 상시 제외시킵니다. 닉네임 검색 시 대소문자는 toLowerCase()로 정규화하고 외곽 공백은 제거합니다.`

  #### **`4.2. AI 4단 처방 출력 스키마 (AiPrescriptionSchema)`**

* ### `originalText (string): 사용자의 원문 목표 또는 대화 스크립트에서 추출된 핵심 문장 (의미 왜곡 없이 원문 유지).`

* ### `simplifiedText (string): 과도한 감정적 긴장감을 완화하고 짧고 명확하게 압축한 정리 문장.`

* ### `cheatCodeText (string): 5세 수준의 단순화 버전으로 "하나만 해도 됨", "1분만 시작" 등 완벽주의 완화 핵심 표현.`

* ### `sensoryText (string): "크게 3번 읽기", "입으로 소리 내기" 등 뇌가 즉시 행동으로 전환하도록 돕는 소리/감각 단서 문장.`

* ### `actionPlan (string[]): 3개 이상, 5개 이하의 독립적으로 수행 가능한 실전 행동 단계 목록.`

* ### `confidence (number): AI가 측정한 목표 문맥 및 사용자 성향 간의 적합도 수치 (0 ~ 1 범위 정규화).`

  #### **`4.3. 🟣 Purple KPI 판정 알고리즘 (purpleKpiEngine)`**

1. ### **`1단계 (목표 키워드 풀 정제):`** `파싱된 quotes 및 todoItems 텍스트를 공백 단위로 분리한 후 2글자 이상의 핵심 형태소 토큰만 추출하여 중복 없는 고유 집합(Unique Set)을 빌드합니다.`

2. ### **`2단계 (서브스트링 정밀 매칭):`** `유저 발화 데이터 본문 내에 정제된 목표 키워드가 포함되어 있는지 1차 서브스트링 스캔을 가동합니다.`

3. ### **`3단계 (강제 행동 트리거 보정):`** `키워드 매칭이 실패한 경우에도 유저 발화 내에 화이트리스트 키워드(['완료', '했습', '읽었', '포기 안', '성공'])가 발견되면 성취로 긴급 보정합니다.`

* ### **`반환 객체 (KpiMatchReport):`**

  * ### `isAchieved (boolean): 단 한 번이라도 성취 신호가 감지되었는지 여부 (핵심 지표)`

  * ### `matchedSpeeches (array): 매칭이 확인된 원문 대화록 행 번호(lineNumber), 발화 텍스트(matchedText), 판정 사유(reason)`

  * ### `achievementRate (number): 전체 발화 수 대비 성취 발화의 기여 비율 (%)`

  * ### `evaluatedAt (string): ISO 8601 형식의 시스템 판정 타임스탬프`

    ### **`5. 4대 사용자 페르소나 및 데이터셋 규격 (Persona Metadata Registry)`**

    #### **`5.1. 4대 핵심 페르소나 프로필`**

| `페르소나 ID` | `닉네임` | `심리적 상태 / 타겟 세그먼트` | `언어적 스타일` | `actionTriggerRate` |
| :---- | :---- | :---- | :---- | :---- |
| `easy_peasy` | `이지비지` | `완벽주의 통제 타겟: 준비가 100% 되지 않으면 인지적 부하와 failure fear로 시작 자체를 회피` | `제목은 거창한 영문 챌린지 타이틀을 사용하나, 한국어 대화는 자신감 부족 및 변명 위주` | `0.4` |
| `new_year_hero` | `뉴이어` | `계획 중독형 타겟: 도구/형식 세팅에서 가짜 성취를 얻고 실제 실행 시점에는 급격히 회피` | `느낌표/선언문 위주의 화려한 마크다운을 빌드하지만 체크리스트 박스는 항상 미완료(- [ ]) 상태` | `0.2` |
| `sara_active` | `사라` | `마이크로 실행 롤모델 타겟: 허들을 극단적으로 낮추어 즉시 몸을 움직이는 건강한 유저` | `문장 끝 느낌표(!) 상시 장착, 이모지 난사 및 즉각적인 행동 완료 내역 공유` | `0.9` |
| `rina_melancholy` | `리나` | `만성 의욕상실 방어 타겟: 실패 타격을 막기 위해 목표를 아예 잡지 않거나 극도로 모호하게 만듦` | `방어적·냉소적 말투, 주어 생략이 잦으며 단답형("그냥 그래요", "패스") 문장 사용` | `0.6` |

    #### **`5.2. 합성 데이터 양산 팩토리 (datasetGenerator)`**

1. ### **`환경 검증:`** `.env 내 OPENAI_API_KEY 설정 유효성을 확인하고 아웃풋 타겟 디렉터리(assets/stage_03_generated/) 존재 여부를 검증합니다.`

2. ### **`에이전트 프롬프트 빌드:`** `PersonaMeta 명세를 시스템 프롬프트 헤더에 주입하고, 물리적 구분자(===) 분리 규칙을 강제합니다.`

3. ### **`GPT-4o API 추론 가동:`** `Temperature 0.8 설정을 적용하여 무작위 비정형 변형 문장을 유도합니다.`

4. ### **`물리 파일 덤프 적재:`** `구분자(===)를 기준으로 추출된 문자열을 assets/stage_03_generated/ 폴더에 ${personaId}_synthetic_target.md 및 ${personaId}_synthetic_script.md 쌍으로 적재합니다.`

   ### **`6. 데이터베이스 스키마 및 보안 권한 정책 (Database Architecture & RLS)`**

### **`[아키텍처 참고 사항: 원격 프로덕션 DB와 로컬/스테이징 마이그레이션 형상 분리]`**

* ### **`원격 프로덕션 배포 완료 테이블 (ACTIVE_HEALTHY):`** `ai_prescriptions, github_webhook_deliveries`

* ### **`로컬/스테이징 마이그레이션 대상 테이블 (원격 미적용):`** `user_profiles, prescription_logs, system_feature_flags, system_routing_config`

  #### **`6.1. PostgreSQL 테이블 마이그레이션 스펙`**

  ##### **`ai_prescriptions (실운영 AI 처방 적재 - 원격 프로덕션 배포)`**

| `컬럼명` | `데이터 타입` | `제약조건` | `설명` |
| :---- | :---- | :---- | :---- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | `AI 처방 고유 식별자` |
| `user_id` | `UUID` | `REFERENCES auth.users(id) ON DELETE CASCADE` | `소유자 유저 ID` |
| `original_text` | `TEXT` | `NOT NULL` | `파싱 원문` |
| `prescription_json` | `JSONB` | `NOT NULL` | `AiPrescriptionSchema 구조체 데이터` |
| `confidence` | `NUMERIC` | `CHECK (confidence >= 0 AND confidence <= 1)` | `AI 문맥 적합도 수치` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | `처방 생성 타임스탬프` |

  ##### **`github_webhook_deliveries (비공개 웹훅 수신 메타데이터 - 원격 프로덕션 배포)`**

| `컬럼명` | `데이터 타입` | `제약조건` | `설명` |
| :---- | :---- | :---- | :---- |
| `delivery_id` | `TEXT` | `PRIMARY KEY` | `GitHub Webhook 고유 전달 UUID` |
| `repository_name` | `TEXT` | `NOT NULL` | `저장소 풀 네임` |
| `event_type` | `TEXT` | `NOT NULL` | `이벤트 종류 (Push 등)` |
| `commit_count` | `INTEGER` | `NOT NULL` | `커밋 수` |
| `target_file_count` | `INTEGER` | `NOT NULL` | `타겟 디렉터리 내 변경 파일 수` |
| `received_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | `수신 시각` |

  ##### **`user_profiles (유저 프로필 마스터 - 로컬/스테이징 전용)`**

| `컬럼명` | `데이터 타입` | `제약조건` | `설명` |
| :---- | :---- | :---- | :---- |
| `id` | `UUID` | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | `사용자 고유 식별자` |
| `nickname` | `TEXT` | `NOT NULL UNIQUE` | `대화록 매칭 및 추적용 고유 닉네임` |
| `persona_type` | `TEXT` | `CHECK (persona_type IN ('easy_peasy', 'new_year_hero', 'sara_active', 'rina_melancholy'))` | `유저 성향 페르소나 식별자` |

  ##### **`prescription_logs (레거시 4단 처방 및 표현 적재 - 로컬/스테이징 전용)`**

| `컬럼명` | `데이터 타입` | `제약조건` | `설명` |
| :---- | :---- | :---- | :---- |
| `id` | `BIGINT` | `PRIMARY KEY, GENERATED BY DEFAULT AS IDENTITY` | `처방 로그 고유 ID` |
| `user_id` | `UUID` | `REFERENCES public.user_profiles(id) ON DELETE CASCADE` | `소유자 유저 ID` |
| `original_target` | `TEXT` | `NOT NULL` | `유저 원문 목표` |
| `five_year_old_version` | `TEXT` | `NOT NULL` | `5세 수준 치트키 단순화 문구` |
| `cheat_key_action` | `TEXT` | `NOT NULL` | `실행 전환 액션 문구` |
| `phonics_sound` | `TEXT` | `NOT NULL` | `소리/감각 행동 단서 문구` |
| `is_stolen_from_peer` | `BOOLEAN` | `DEFAULT false` | `동료 표현 스틸 여부 플래그` |
| `source_log_id` | `BIGINT` | `REFERENCES public.prescription_logs(id) ON DELETE SET NULL` | `스틸 원본 출처 로그 ID` |

  #### **`6.2. Row Level Security (RLS) 및 동료 표현 스틸(Steal) 보안`**

* ### **`SELECT (조회) 권한:`** `authenticated 사용자에게 FOR SELECT 개방. 동료의 처방전을 조회하여 표현 스틸을 가능하게 합니다. 서브쿼리 최적화를 위해 (SELECT auth.uid()) = user_id 서식을 사용합니다.`

* ### **`INSERT (스틸 및 작성) 권한:`** `WITH CHECK ((SELECT auth.uid()) = user_id) 조건을 강제 적용. 타인의 표현을 스틸하더라도 오직 본인의 명의(user_id)로만 복제 적재할 수 있습니다.`

* ### **`UPDATE / DELETE (수정 및 삭제) 권한:`** `USING ((SELECT auth.uid()) = user_id) 조건에 따라 오직 본인 소유의 행만 제어 가능합니다. anon 및 authenticated 유저에게는 상위 권한 제한이 적용됩니다.`

* ### **`비공개 웹훅 보안:`** `github_webhook_deliveries 테이블에는 FORCE ROW LEVEL SECURITY가 적용되어 anon 및 authenticated 접근 권한이 전면 차단되며, 오직 service_role만 접근을 허용합니다.`

  #### **`6.3. Supabase Auth 및 Google OAuth 바인딩`**

1. ### `사용자가 프론트엔드에서 supabase.auth.signInWithOAuth({ provider: 'google' })를 실행합니다.`

2. ### `Google Cloud Console 인증을 거쳐 Authorized Redirect URI(https://<project-ref>.supabase.co)로 리다이렉트됩니다.`

3. ### `Supabase Auth가 고유 세션 토큰 및 JWT를 발급하며, 내장된 UUID가 public.ai_prescriptions.user_id 외래키로 바인딩됩니다.`

4. ### `이후 클라이언트 요청 시 JWT 토큰 내 auth.uid() 값이 RLS 정책의 평가식 (SELECT auth.uid())로 평가되어 보안 격리가 유지됩니다.`

   ### **`7. 삼중 운영 장애 격리 및 회복성 가드레일 (Operational Resilience & Safeguards)`**

   #### **`7.1. 🟢 그린 삼중 회로 차단기 및 IndexedDB 대피소 (Circuit Breaker & Shelter)`**

* ### **`CLOSED (정상 연결):`** `모든 요청이 백엔드로 정상 전달되며 연속 에러 실패 카운트는 0으로 유지됩니다.`

* ### **`OPEN (회로 차단):`** `5초(5000ms) 초과 타임아웃 지연 또는 네트워크 50x 에러가 3회 연속 발생 시 회로가 차단 상태로 전이됩니다. 외부 API 요청을 중단하고 즉시 로컬 대피소 콜백으로 리다이렉트됩니다.`

* ### **`HALF_OPEN (복구 시도):`** `10초(10000ms) 쿨다운 타이머 경과 후 단 1개의 일회성 요청을 테스트 전송합니다. 성공 시 CLOSED로 복구되고 실패 시 OPEN 상태로 회귀합니다.`

* ### **`IndexedDB 대피소 (DidItEmergencyShelter):`** `회로 차단 시 원문 스트링 전체를 markdown_backups 스토어에 syncStatus: 'PENDING_SYNC' 레이블과 함께 비동기 적재하여 유실률 0%를 보장합니다. 회로가 CLOSED로 복구되면 백그라운드 프로세스가 중앙 DB로 일괄 이관(Bulk Insert) 후 로컬 백업을 청소합니다.`

  #### **`7.2. 🟡 옐로우 인메모리 피처 플래그 핫픽스 (Feature Flag Hotfix)`**

### `FeatureFlagEngine은 30초 TTL 인메모리 캐시를 장착하여 DB 병목을 방지하며, 원격 설정 단일 조작을 통해 코드 재배포 없이 우회 뷰로 전환합니다.`

| `피처 고유 키 (Feature Key)` | `정상 상태 (true) 런타임 경로` | `리스크 감지 (false) 핫픽스 우회 경로` |
| :---- | :---- | :---- |
| `enable-web-mvp` | `웹 MVP 전체 핵심 기능 및 AI 라우터 가동` | `웹 MVP 핵심 AI 처리 우회 및 기본 데모 모드로 안전 이관` |
| `enable-rina-parser` | `리나 페르소나 전용 방어 파싱 알고리즘 가동` | `리나 전용 알고리즘 격리 후 범용 mdStaticParser코어로 이관` |
| `enable-phonics-hyphen-component` | `음절 간 하이픈 기호가 노출되는 사운드 칩 인터랙션 뷰` | `하이픈 기호를 공백으로 전환 후 일반 플레인 텍스트 모드로 우회 렌더링` |

#### **`7.3. 🔵 블루 8초 데드라인 제한 및 프롬프트 원격 라우팅 (Transaction & Prompt Gate)`**

* ### **`8초 타임아웃 제한 및 한계 (Promise.race / RollbackHandler):`** `요청 커넥션을 8초에 중단(AbortSignal)하지만, 현재 원격 DB에 execute_safe_prescription_transaction RPC가 적용되지 않은 상태이므로 반환 상태는 TIMEOUT_INDETERMINATE로 리포트됩니다 (서버 트랜잭션의 완벽한 원자적 롤백을 위해서는 향후 statement_timeout이 명시된 DB RPC 마이그레이션이 요구됨).`

* ### **`프롬프트 블루/그린 원격 라우팅 절차:`**

  1. ### `초기 기동 시 system_routing_config 테이블의 active_color가 v2.0_BLUE로 구동됩니다.`

  2. ### `신규 프롬프트 검증 완료 시 운영자가 DB 설정을 v2.1_GREEN으로 업데이트하여 라이브 트래픽 경로를 실시간 전환합니다.`

  3. ### `그린 모드에서 예외 발생 시 DB의 active_color를 즉시 BLUE로 덮어써 1초 만에 이전 안정 버전으로 원격 롤백시킵니다.`

     ### **`8. 시연 시나리오 및 테스트/운영 SOP (Demo Scenario & Operations SOP)`**

     #### **`8.1. 5분 릴레이 시연 동선 (Demo Workflow)`**

1. ### **`[00:00 - 01:00] 게스트 체험:`** `무장벽 로컬 데모 UI에서 '예시로 바로 체험'을 클릭하여 샘플 데이터를 로드하고, 브라우저 단독(React State) 룰 기반 파싱, KPI 판정 및 데모 템플릿 처방 결과를 외부 통신 없이 즉시 확인합니다.`

2. ### **`[01:00 - 02:00] Google OAuth 로그인:`** `Google 계정 연동 버튼을 통해 세션을 생성하고 RLS 정책이 적용된 개인 전용 데이터 공간으로 진입합니다.`

3. ### **`[02:00 - 03:00] BYOK Gemini AI 처방전 생성:`** `유저 설정에서 개인 Google Gemini API Key를 주입한 후, 완벽주의 목표 문장을 주입하여 실시간 AI 4단 처방전(originalText ➔ cheatCodeText ➔ sensoryText ➔ actionPlan)을 생성합니다.`

4. ### **`[03:00 - 04:00] Purple KPI 구출 시연:`** `실전 대화록 덤프를 입력창에 주입하여, purpleKpiEngine이 키워드 매칭 및 강제 보정 화이트리스트 트리거를 통해 단 한 번의 실행 시도를 포착해 내는 과정을 확인합니다.`

5. ### **`[04:00 - 05:00] Peer Steal 및 그린 대피소 오프라인 백업:`** `동료 표현 보관함에서 훌륭한 처방을 스틸(is_stolen_from_peer = true)해 오고, 의도적 네트워크 단절 상태에서 마크다운 작성 시 IndexedDB(DidItEmergencyShelter)에 PENDING_SYNC로 백업된 후 재연결 시 원격 DB로 동기화되는 흐름을 시연합니다.`

   #### **`8.2. 시연 전용 테스터 계정 및 DB 초기화 SOP`**

* ### **`시연 전용 계정:`** `didit.demo.official@gmail.com`

* ### **`시연 직전 DB 1초 초기화 SQL 명령:`**

  ### `-- 시연 계정 데이터 클린업 및 데모 세부 상태 초기화 RPC 실행`

  ### `SELECT public.reset_demo_account('didit.demo.official@gmail.com');`

  ### 

  #### **`8.3. 4개 팀 간 R&R 및 시연 D-10분 공조 체크리스트`**

| `담당 팀` | `핵심 역할 및 책임 (R&R)` |
| :---- | :---- |
| **`개발팀 (Dev)`** | `AI 파서 코어 모듈, Supabase Auth/RLS 및 회복성 인프라(서킷 브레이커, 피처 플래그) 기술 보장` |
| **`운영팀 (Ops)`** | `Supabase Edge Functions 배포 상태 모니터링, repo-webhook-receiver 서명 관리 및 피처 플래그 스위치 관리` |
| **`기획팀 (Product)`** | `시연 5분 타임라인 동선 가이드라인 준수 및 페르소나 데이터셋 시나리오 유효성 점검` |
| **`QA팀 (Test)`** | `오렌지 CI 대량 스트레스 테스트 통과 검증 및 오프라인 IndexedDB 대피소 동작 사전 테스트` |

* ### **`시연 D-10분 최종 점검 체크리스트:`**

  * ### `[ ] Google Cloud Console OAuth 2.0 Redirect URI 및 Client Key 정상 작동 확인`

  * ### `[ ] Supabase 원격 DB ACTIVE_HEALTHY 상태 및 ai_prescriptions RLS 정책 활성화 확인`

  * ### `[ ] Edge Function repo-webhook-receiver 환경 변수(GITHUB_WEBHOOK_SECRET) 동기화 확인`

  * ### `[ ] system_feature_flags 내 핵심 피처 스위치(enable-web-mvp)가 정상(true) 상태인지 확인`

  * ### `[ ] system_routing_config 라우터가 BLUE 모드로 안전 락인되어 있는지 확인`

  * ### `[ ] 시연 전용 테스터 계정(didit.demo.official@gmail.com) DB 리셋 RPC 정상 실행 완료`

    # **`whatImSupposedto-Didit MVP 데이터 흐름서 (Data Flow Architecture)`**

    ## **`1. 전체 데이터 흐름 아키텍처 개요 (Overview of End-to-End Data Pipeline)`**

    ### **`1.1. 4단계 코어 시스템 레이어 데이터 흐름`**

`whatImSupposedto-Didit 시스템은 사용자가 입력한 비정형 마크다운 자산(*_target.md, *_script.md)을 수집하여 4개의 순차적 시스템 레이어를 거치면서 정제, 분석, 영속화, 장애 방어 과정을 수행합니다.`

`데이터 수집 단계에서 목표 정의 파일(*_target.md)과 대화록 스트림(*_script.md)이 입력되면, 코어 파싱 레이어에서 정적 토큰 및 유저 발화를 정밀 분리하여 JSON 구조체로 전환합니다. 이후 인텔리전스 & 평가 레이어로 이관되어 AI 기반 4단 처방전 생성 및 서브스트링 성취 판정이 이루어집니다. 영속성 & 게이트웨이 레이어에서는 Supabase PostgreSQL 데이터베이스(ai_prescriptions 중심)에 데이터를 적재하고 행 단위 보안(RLS)을 적용합니다. 마지막으로 운영 및 장애 방어 레이어에서 네트워크 단절, 데이터 오염, 트랜잭션 타임아웃 등의 리스크를 제어합니다.`

| `레이어명` | `주요 역할` | `주요 구동 모듈` | `입출력 데이터 형태` |
| :---- | :---- | :---- | :---- |
| **`1. Core Parsing Layer`** | `비정형 마크다운 텍스트 내 Front Matter, 특화 토큰 추출 및 특정 유저 발화 정밀 분리` | `mdStaticParser, scriptSplitter` | **`Input:`** `비정형 .md 텍스트 (*_target.md, *_script.md)<br>Output: JSON 구조화 정적 토큰 및 유저별 발화 배열` |
| **`2. Intelligence & Evaluation Layer`** | `4단 처방전(원문, 5세 치트키, 소리/감각, 실행 전환) 조제 및 실전 성취 여부 판정` | `aiContrastEngine, purpleKpiEngine` | **`Input:`** `JSON 구조화 토큰 및 발화 데이터<br>Output: AiPrescriptionSchemaJSON 및 KpiMatchReport 객체` |
| **`3. Persistence & Gateway Layer`** | `처방 데이터 영속화, RLS 보안 접근 제어 및 Git 웹훅 전달 메타데이터 적재` | `Supabase PostgreSQL (ai_prescriptions, github_webhook_deliveries), RLS` | **`Input:`** `처방 JSON 및 KPI 평가 리포트<br>Output: DB 영속화 레코드 (ai_prescriptions 라이브 적재)` |
| **`4. Fault-Tolerant & Operation Layer`** | `API 장애 회로 차단, 인메모리 피처 플래그 우회, 8초 제한 시간 타임아웃 및 동기화 제어` | `ApiCircuitBreaker, FeatureFlagEngine, RollbackHandler` | **`Input:`** `네트워크 지연/에러 이벤트, Config 데이터<br>Output: IndexedDB 임시 백업, 핫픽스 대체 뷰, TIMEOUT_INDETERMINATE 상태 반환` |

### **`1.2. 삼중 운영 리스크 대응 가드레일 (Green, Yellow, Blue Armor)`**

* **`네트워크 단절 및 API 마비 리스크 (Green Armor)`**  
  * **`리스크 유형:`** `외부 API 통신 지연(5초 초과) 또는 네트워크 50x 에러 발생으로 인한 시스템 크래시`  
  * **`가드레일 명칭:`** `그린 서킷 브레이커 및 로컬 대피소 (ApiCircuitBreaker & LocalEmergencyStorage)`  
  * **`트리거 조건:`** `API 요청 타임아웃(5000ms 초과) 또는 50x 에러 연속 3회(failureThreshold: 3) 발생 시`  
  * **`대응 메커니즘:`** `회로 상태를 OPEN으로 전환하고 외부 요청을 즉시 차단합니다. 클라이언트 브라우저 로컬 IndexedDB 스토어(DidItEmergencyShelter)에 작성 중이던 마크다운 원문을 syncStatus: 'PENDING_SYNC' 플래그로 격리 저장하여 데이터 유실률 0%를 달성합니다. 네트워크 복구 후 회로가 CLOSED 상태가 되면 백그라운드에서 중앙 DB로 미동기 데이터를 일괄 동기화(Bulk Insert)하고 로컬 백업을 완전 삭제합니다.`  
* **`컴포넌트 데이터 오염 리스크 (Yellow Armor)`**  
  * **`리스크 유형:`** `파서 알고리즘 예외, 비정형 기호 깨짐, UI 컴포넌트 렌더링 런타임 에러 발생`  
  * **`가드레일 명칭:`** `옐로우 피처 플래그 인메모리 핫픽스 (FeatureFlagEngine & ToggleGateway)`  
  * **`트리거 조건:`** `원격 설정 데이터베이스 스위치가 false로 변경되거나 예기치 못한 컴포넌트 파괴 감지 시`  
  * **`대응 메커니즘:`** `30초 TTL(Time-To-Live) 기반 인메모리 캐싱 레이어가 가동됩니다. 데이터베이스 재배포 없이 원격 SQL 토글 스위치 변경만으로 30초 내에 문제가 발생한 전용 파서/컴포넌트를 즉각 격리하고, 범용 mdStaticParser 코어 엔진 또는 플레인 텍스트 모드 대체 뷰(Fallback View)로 무다운타임 전환합니다. (현재 원격 라이브 DB 미적용 상태 시 기본값 defaultValue: true 안전 우회 적용)`  
* **`트랜잭션 충돌 및 타임아웃 리스크 (Blue Armor)`**  
  * **`리스크 유형:`** `DB 적재 중 데드락, 유효성 검증 실패, 파싱 무한 블로킹으로 인한 시스템 좀비화`  
  * **`가드레일 명칭:`** `블루 8초 데드라인 제한 복구 트랜잭션 및 프롬프트 라우터 (RollbackHandler & PromptBlueGreenRouter)`  
  * **`트리거 조건:`** `DB 적재 프로세스가 8000ms(8초) 제한 시간을 초과하거나 클라이언트 요청 타임아웃 발생 시`  
  * **`대응 메커니즘:`** `Promise.race 기반 하드 타이머 가드가 발동하여 요청에 AbortSignal을 전달하고 컷오프 처리합니다. 단, 현재 원격 DB에는 execute_safe_prescription_transaction RPC가 미적용된 스캐폴딩 상태이므로 타임아웃 발생 시 상태는 TIMEOUT_INDETERMINATE로 처리되어 반환됩니다. 향후 서버 측 statement_timeout 연동을 통해 원자적 롤백을 완성할 로드맵을 유지하며, 프롬프트 라우터를 통해 구버전(v2.0_BLUE)과 신버전(v2.1_GREEN) 간 1초 원격 복구 라우팅을 지원합니다.`

    ## **`2. 사용자 라이프사이클 및 등급별 데이터 흐름 (User Lifecycle & Tiered Data Flow with BYOK)`**

    ### **`2.1. 게스트 (Guest) 등급 데이터 흐름`**

`게스트 사용자는 로그인 및 외부 DB 연동 없이 무장벽 브라우저 환경에서 데모 UI를 체험합니다.`

1. **`100% 클라이언트 브라우저 격리:`** `사용자가 입력창에 목표(01 내가 하려던 것) 및 대화/행동 기록(02 실제로 해본 것)을 작성하면, 입력값은 외부 API나 Supabase 데이터베이스로 전송되지 않고 브라우저의 React State 샌드박스 내에서만 유지됩니다.`  
2. **`클라이언트 정적 파싱 가동:`** `입력된 텍스트는 브라우저 런타임 내에서 parseMarkdown 및 splitScriptByUser 모듈을 가동하여 목표 키워드와 발화 컨텍스트를 분리합니다.`  
3. **`규칙 기반 데모 4단 처방 조제:`** `OpenAI 등 외부 AI LLM 호출 없이, 내장된 템플릿 규칙에 따라 원문 유지, 가벼운 목표 전환, 치트키 제안, 시작 소리 표기(예: "시-작-해-보자")의 4단계 데모 처방 문구를 자가 조제합니다.`  
4. **`로컬 KPI 평가 연산:`** `브라우저 내부 런타임에서 evaluatePurpleKpi를 가동하여 목표 키워드 일치 여부 및 시도 신호(예: "포기 안", "읽었")를 100% 클라이언트 연산으로 수행합니다.`  
5. **`무저장(Zero-Persistence) 보안 특성:`** `브라우저 세션 종료 또는 페이지 새로고침 시 모든 React State 데이터는 자동 소멸하며, 외부 서버나 영구 스토리지에 어떠한 데이터 흔적도 남기지 않습니다.`

   ### **`2.2. 로그인 무료 회원 (Free Tier) 데이터 흐름`**

`로그인 무료 회원은 Google OAuth 인증을 거쳐 주 3회 기본 처방전 생성 기회를 제공받으며, 커뮤니티 공유 자산을 이용할 수 있습니다.`

* **`Google OAuth 2.0 세션 수신:`** `프론트엔드 SDK(supabase.auth.signInWithOAuth)를 통해 인증을 진행하고 구글 세션 토큰을 수신합니다.`  
* **`Supabase Auth UUID 발급 및 RLS 바인딩:`** `Supabase Auth 인증 레이어에서 고유 UUID를 발급받아 public.ai_prescriptions.user_id 외래키와 바인딩합니다.`  
* **`정적 파싱 및 AI 처방 조제:`** `작성된 마크다운 데이터는 mdStaticParser 및 scriptSplitter를 거쳐 JSON 구조체로 변환된 후, 주 3회 쿼터 한도 내에서 4단 처방전 데이터로 변환됩니다.`  
* **`Supabase DB 영속화:`** `생성된 처방전 데이터는 RLS 보안 정책 (SELECT auth.uid()) = user_id 검증을 거쳐 원격 라이브 DB의 public.ai_prescriptions 테이블에 영속 적재됩니다. (레거시 스키마인 prescription_logs 및 user_profiles는 마이그레이션 대기 상태임)`  
* **`동료 표현 스틸 (Peer Steal) RLS SELECT 개방:`** `인증된 사용자(authenticated)에게는 타인의 처방전 조회 권한(FOR SELECT)이 상시 개방되어 커뮤니티 전광판의 표현을 자유롭게 스틸할 수 있으며, 스틸 시 본인의 명의(user_id = auth.uid()) 및 is_stolen_from_peer = true 플래그로 신규 행을 ai_prescriptions에 INSERT합니다.`

  ### **`2.3. 프로 구독 회원 (Pro Tier - BYOK) 데이터 흐름`**

  #### **`2.3.1. 정상 데이터 처리 흐름`**

`프로 구독 사용자는 개인 Google Gemini API Key를 직접 등록(Bring Your Own Key)하여 제한 없는 실시간 4단 처방전을 조제하고 퍼플 KPI를 스캔합니다.`

`사용자는 개인 API Key를 입력하여 클라이언트 측 IndexedDB 또는 LocalStorage 안전 영역에 영구 저장합니다. 처방 요청 발생 시 서버 중계 없이 클라이언트에서 Google Gemini LLM API를 직접 호출하여 AiPrescriptionSchema 규격에 맞춘 4단 처방 JSON 객체(originalText, simplifiedText, cheatCodeText, sensoryText, actionPlan)를 즉시 생성합니다. 생성된 처방과 대화록 스트림은 purpleKpiEngine에 의해 실시간 스캔되어 '완료', '했음' 등의 실행 토큰을 검출하고, RLS 통과 후 Supabase 원격 PostgreSQL DB(ai_prescriptions)에 최종 영속화됩니다.`

#### **`2.3.2. 장애 발생 및 복구 흐름 (Disaster Recovery)`**

`외부 API 통신 중 5초 타임아웃 또는 50x 에러가 연속 3회 감지되면 **그린 서킷 브레이커 (ApiCircuitBreaker)**가 가동되어 회로를 OPEN으로 차단합니다. 차단 즉시 프론트엔드 라우터는 브라우저 로컬 **IndexedDB (DidItEmergencyShelter)**의 markdown_backups 스토어에 작성 중인 마크다운 데이터를 적재하고 syncStatus: 'PENDING_SYNC' 플래그를 박제합니다. 네트워크 및 API 가용성이 복구되어 회로가 CLOSED 상태로 복귀하면, 백그라운드 가디언 프로세스가 getPendingSyncPayloads()를 트리거하여 미동기 백업 자산을 수집하고 Supabase 원격 DB로 안전하게 일괄 이관(Bulk Insert)한 뒤 로컬 임시 백업을 청소합니다.`

### **`2.4. 구독 해지 회원 (Canceled Tier) 데이터 흐름`**

`사용자가 프로 구독을 해지하더라도 과거에 생성된 4단 처방전 데이터 및 퍼플 KPI 성취 로그는 Supabase DB(ai_prescriptions) 내에 영구 보존됩니다. RLS 보안 정책에 따라 본인이 작성했던 과거 데이터에 대한 SELECT 및 DELETE 접근 권한은 지속적으로 유지됩니다. 다만, 구독 해지 즉시 BYOK 자동 호출 기능이 비활성화되며 무료 회원(Free Tier) 등급의 주 3회 기본 생성 쿼터 제한 정책으로 자동 전환 처리됩니다.`

## **`3. 코어 데이터 변환 파이프라인 세부 (Core Data Transformation Pipeline Details)`**

### **`3.1. 비정형 마크다운 수집 및 정적 파싱 모듈`**

`mdStaticParser 및 scriptSplitter 모듈은 서드파티 무거운 라이브러리 없이 TypeScript 네이티브 문자열 파싱 기법으로 구현되어 데이터 오염과 크래시를 방어합니다.`

`mdStaticParser는 *_target.md 파일 최상단의 --- 구분자로 격리된 YAML Front Matter를 행 단위로 분리하여 key: value 객체로 변환하고 따옴표를 정규식으로 보정합니다. 인용구 기호(> )로 시작하는 행은 유저의 '핵심 목표 및 인지 상태' 문자열로 추출하며, 체크리스트 기호(- [ ], - [x])는 공백일 경우 completed: false, x/X일 경우 completed: true 불리언 값으로 매핑합니다. 만약 첫 번째 ---만 존재하고 닫는 구분자가 유실된 예외 발생 시 파일 전체를 rawBody 필드로 이관하며, 개행 난사 및 공백 오염 방지를 위해 .trim() 및 ^\s* 패턴을 선제 적용합니다.`

`scriptSplitter 모듈은 다중 사용자 대화록(*_script.md)에서 특정 닉네임의 실전 행동 기록만을 정밀 추출하기 위해 아래 3단계 정규식 매칭 매트릭스를 순차 적용합니다.`

| `우선순위` | `타겟 텍스트 패턴 예시` | `정규식 패턴 (Regex Pattern)` | `분리 가이드` |
| :---- | :---- | ----- | :---- |
| **`1순위`** | **`EasyPeasy`**`: 오늘 성공!` | `/^\s*\*\*(.*?)\*\*?\s*:\s*(.*)/` | `볼드 기호(**) 내부 문자열을 닉네임으로 추출` |
| **`2순위`** | `[EasyPeasy] 단어 외움` | `/^\s* $(.*?)$ \s*:?\s*(.*)/` | `대괄호([]) 내부 문자열을 닉네임으로 추출` |
| **`3순위`** | `EasyPeasy: 소리 읽기 완료` | `/^\s*([^:\s]+)\s*:\s*(.*)/` | `콜론(:) 이전의 연속된 문자열을 닉네임으로 추출` |

*`참고: 인용구(> )나 체크리스트(- [ ]) 행에 콜론(:)이 포함된 경우 3순위 일반 매칭 대상에서 제외되며, 닉네임 검색 시 toLowerCase() 및 외곽 공백 제거를 적용하여 대소문자 및 공백 무감각 처리를 수행합니다.`*

### **`3.2. AI 인텔리전스 변환 및 4단 처방 JSON 구조화`**

`파싱된 비정형 목표 문맥은 완벽주의 완화 및 행동 실행 전환을 목적으로 AiPrescriptionSchema JSON 규격(총 10개 필드)으로 구조화됩니다.`

* **`userId (유저 고유 식별자):`** `처방전을 소유한 유저의 Auth UUID (선택적 메타 필드).`  
* **`personaId (페르소나 식별자):`** `유저의 인지적 성향 및 페르소나 유형 (easy_peasy, new_year_hero 등).`  
* **`sourceType (입력 데이터 출처):`** `처방전에 사용된 원본 데이터 타입 ('target' | 'script' | 'combined').`  
* **`originalText (원문 유지):`** `사용자가 작성한 원문 목표 또는 대화 스크립트에서 추출된 핵심 문장을 의미 변형 없이 완벽주의적 표현 그대로 유지.`  
* **`simplifiedText (문장 정리):`** `원문의 과도한 감정적 긴장이나 상투어를 완화하고 읽기 쉽게 압축한 정제 문장.`  
* **`cheatCodeText (5세 치트키):`** `5세 아동 수준으로 실행 허들을 극단적으로 낮춘 경량화 표현. (예: "오늘은 1문장만!", "완료 체크만 해도 통과")`  
* **`sensoryText (소리/감각):`** `뇌가 즉시 행동으로 전환할 수 있도록 소리, 감각, 리듬 단서로 변환한 실행 구체화 문장. (예: "크게 소리 내서 3번 읽기", "입으로 따라 말해보기")`  
* **`actionPlan (실전 행동 목록):`** `즉각 수행 가능한 3~5개의 독립적 행동 단계 배열 (string[]).`  
* **`confidence (문맥 적합도):`** `AI가 평가한 목표 문맥과 유저 성향 간의 적합도 점수 (01 또는 0100 정규화 범위).`  
* **`generatedAt (생성 타임스탬프):`** `처방전이 조제된 시각을 나타내는 ISO 8601 형식의 타임스탬프 문자열.`

  ### **`3.3. 🟣 Purple KPI 성취 판정 알고리즘`**

`Purple KPI 엔진(purpleKpiEngine.ts)은 일주일 전체 달성을 요구하는 올-오어-너씽(All-or-Nothing) 방식을 해체하고, 대화 스트림 속 단 한 번의 시도 기록만 발견되어도 성취로 인정하는 '단 한 번의 시도 통착(Single-Hit Success)' 철학을 구현합니다.`

1. **`1단계: 목표 키워드 풀(Pool) 정제`** `마크다운 파서가 추출한 인용구(quotes) 및 체크리스트(todoItems) 텍스트를 공백 단위로 split하고, 언어적 노이즈를 제거하기 위해 2글자 이상의 핵심 형태소 토큰만 추려내어 대소문자를 정규화한 고유 집합(Unique Set)을 생성합니다.`  
2. **`2단계: 서브스트링(Substring) 정밀 매칭`** `정제된 고유 키워드 루프를 가동하여, 유저가 단톡방에 작성한 대화 발화 본문 내에 해당 키워드가 서브스트링으로 포함되어 있는지 스캔합니다. 발견 즉시 매칭 카운트를 올리고 lineNumber와 matchedText를 사유(reason)와 함께 박제합니다.`  
3. **`3단계: 강제 행동 트리거 보정 화이트리스트 스캔`** `완벽주의 유저가 방어적 말투로 목표 키워드를 생략한 경우를 대비하여, 1~2단계 매칭이 실패했더라도 발화 내에 강제 감지 트리거 화이트리스트 ['완료', '했습', '읽었', '포기 안', '성공'] 토큰이 발견되면 isAchieved: true로 긴급 보정합니다.`

`평가가 완료되면 KpiMatchReport 규격(userNickname, isAchieved, matchedSpeeches, achievementRate, evaluatedAt) JSON 객체를 반환합니다.`

### **`3.4. 영속성 및 Row Level Security (RLS) 보안 제어`**

`원격 프로덕션 DB에는 현재 ai_prescriptions 및 github_webhook_deliveries 테이블에 RLS 보안 정책이 활성화되어 있으며, 레거시 테이블 스키마(user_profiles, prescription_logs)는 로컬 마이그레이션 대상으로 관리됩니다.`

| `역할 (Role)` | `SELECT (조회)` | `INSERT (생성/스틸)` | `UPDATE / DELETE (수정/삭제)` | `비고` |
| :---- | :---- | :---- | :---- | :---- |
| **`anon (익명)`** | `권한 없음 (전면 차단)` | `권한 없음 (전면 차단)` | `권한 없음 (전면 차단)` | `라이브 DB 테이블 접근 물리 차단` |
| **`authenticated (인증 유저)`** | `본인 행 한정 조회<br>USING ((SELECT auth.uid()) = user_id)` | `본인 명의 한정 생성<br>WITH CHECK ((SELECT auth.uid()) = user_id)` | `권한 없음 (전면 차단)` | `(SELECT auth.uid()) 평가 구문 최적화 적용` |
| **`service_role (관리자/백엔드)`** | `전체 접근 허용` | `전체 접근 허용` | `전체 접근 허용` | `관리자 전용 키 사용 (RLS 우회)` |

*`참고: 악성 해커 유저가 타인의 ai_prescriptions 레코드를 강제로 UPDATE 또는 DELETE 하려 시도할 경우, RLS 권한 차단 정책에 의해 DB 레이어에서 요청이 즉각 무효화됩니다.`*

## **`4. 4대 페르소나 데이터 변환 입출력 스펙 (4 Persona Data Transformation Specs)`**

### **`4.1. 이지비지 (EasyPeasy) 페르소나 파이프라인`**

* **`입력 데이터:`** `거창한 영문 챌린지 타이틀(Perfect Native Conversation Mastery)이 적힌 *_target.md 및 자신감 없는 구구절절한 국문 변명이 담긴 *_script.md. (actionTriggerRate: 0.4)`  
* **`변환 엔진 로직:`** `mdStaticParser가 영문 목표를 파싱하고 cheatCodeText에서 완벽주의 완화 처방("오늘은 한 문장만! 완벽하지 않아도 괜찮아요")을 생성합니다.`  
* **`출력 성취 결과:`** `대화록 내에서 "오늘 간신히 외웠어요", "완료" 토큰을 스캔하여 isAchieved: true 및 achievementRate를 포함한 KpiMatchReport를 산출합니다.`  
* **`특수 가드레일:`** `완벽주의 방어 기제 해제를 위해 5세 치트키 및 소리/감각(sensoryText) 중심 행동 전환 규칙을 강제 집행합니다.`

  ### **`4.2. 뉴이어 (NewYear) 페르소나 파이프라인`**

* **`입력 데이터:`** `느낌표와 선언문 위주의 화려한 마크다운 문서이나, 본문의 체크리스트 박스는 항상 비어있는(- [ ]) *_target.md. (actionTriggerRate: 0.2)`  
* **`변환 엔진 로직:`** `mdStaticParser가 미완성 체크리스트를 파싱하고, aiContrastEngine이 계획 중독 완화를 위한 극단적 경량화 처방전(1분 실행 안)을 조제합니다.`  
* **`출력 성취 결과:`** `발화 스트림 내 '기지개 켰음', '시작' 등의 행동 트리거를 스캔하여 가짜 성취감을 실전 실행 성취 로그로 변환 적재합니다.`  
* **`특수 가드레일:`** `파싱 구문 파괴나 파서 오염 리스크 리포트 시 옐로우 피처 스위치(enable-phonics-hyphen-component: false)가 가동되어 일반 플레인 텍스트 뷰로 안전 우회합니다.`

  ### **`4.3. 사라 (Sara) 페르소나 파이프라인`**

* **`입력 데이터:`** `느낌표(!)와 이모지가 적극적으로 쓰인 즉각적 행동 완료 기록 마크다운 파일. (actionTriggerRate: 0.9)`  
* **`변환 엔진 로직:`** `scriptSplitter 1순위 볼드 정규식(/^\s*\*\*(.*?)\*\*?\s*:\s*(.*)/)을 통해 실천 기록을 완벽 격리 추출하고 4단 처방을 즉시 조제합니다.`  
* **`출력 성취 결과:`** `높은 성취율이 반영된 처방전이 커뮤니티 전광판에 즉시 적재되며, 타 유저가 RLS SELECT개방을 통해 표현을 스틸(is_stolen_from_peer = true)하는 INSERT 입출력 트랜잭션을 트리거합니다.`  
* **`특수 가드레일:`** `스틸 동작 시 (SELECT auth.uid()) = user_id 조건 검증을 거쳐 명의 도용을 원천 차단합니다.`

  ### **`4.4. 리나 (Rina) 페르소나 파이프라인`**

* **`입력 데이터:`** `주어가 생략되거나 단답형("그냥 그래요", "패스")으로 일관하는 극단적 방어 스타일의 마크다운 로그. (actionTriggerRate: 0.6)`  
* **`변환 엔진 로직:`** `방어 기제 완화를 위해 '한 단어 말하기' 수준의 마이크로 처방전으로 변환하고, 3차 강제 행동 트리거 화이트리스트('했음')를 통해 성취를 구출합니다.`  
* **`출력 성취 결과:`** `단답형 발화 속에서도 성취 신호를 검출하여 DB 레코드에 정체감 방지 로그를 영속화합니다.`  
* **`특수 가드레일:`** `리나 전용 방어 파서 구문에서 런타임 에러 발생 시, 원격 Config 스위치 enable-rina-parser: false가 발동하여 범용 mdStaticParser 코어 파서로 즉각 우회(Safe Migration)시킵니다.`

  ## **`5. 시연 및 테스트 데이터 파이프라인 (Demo & Testing Data Pipelines)`**

  ### **`5.1. 시연 전용 데모 환경 및 데이터 격리 흐름`**

* **`데모 UI 보안 가이드 및 100% 브라우저 샌드박스:`** `데모 웹 UI 환경은 외부 API나 Supabase 데이터베이스 연동이 완전히 차단된 100% 브라우저 React State 샌드박스입니다. 입력된 한 문장 목표와 기록은 외부 서버로 전송되거나 저장되지 않으며, 세션 종료 시 소멸됩니다. 처방 문구는 OpenAI 등 외부 AI 호출 없이 규칙 기반 데모 템플릿으로 조제되며, 성취 신호 판정은 브라우저 런타임 내로 이관된 parseMarkdown, splitScriptByUser, evaluatePurpleKpi 모듈에 의해 자가 연산됩니다.`  
* **`Zero-Persistence 격리 연산 파이프라인:`** `데모 환경은 DB 저장이 발생하지 않는 무저장(Zero-Persistence) 구조이므로 별도의 DB 리셋 RPC 구동이 필요하지 않습니다. 사용자가 '오늘의 작은 성취 찾기'를 클릭하면 클라이언트 메모리 상에서 파싱과 KPI 스캔이 100ms 이내에 완료되어 화면에 즉시 렌더링됩니다.`

  ### **`5.2. 합성 데이터 팩토리 및 오렌지 CI 회귀 테스트 데이터 흐름`**

`datasetGenerator.ts 엔진은 Node.js 환경에서 디스크 파일 I/O와 OpenAI GPT-4o API(Temperature 0.8)를 결합하여 비정형 테스트 자산을 양산합니다. PERSONA_REGISTRY 메타데이터를 주입받아 모호한 목표와 현실적 대화록을 물리적 구분자(===) 기법으로 단일 추론 생성한 뒤, assets/stage_03_generated/ 폴더에 ${personaId}_synthetic_target.md 및 ${personaId}_synthetic_script.md 자산 쌍으로 덤프 적재합니다.`

`GitHub Actions 런타임 환경(.github/workflows/04_orange_ci_automation.yml)에서 실행되는 오렌지 CI 파이프라인은 다음과 같은 5단계 데이터 흐름으로 전수 회귀 검증을 집행합니다.`

`[1단계: 격리 러너 기동] ──► Ubuntu-Latest 가상 인프라 환경 확보 및 런타임 준비`

                                     `│`

                                     `▼`

`[2단계: 원격 코드 동기화] ──► Actions Checkout을 가동하여 소스 코드 및 stage_03 합성 자산 100% 동기화`

                                     `│`

                                     `▼`

`[3단계: 환경 및 캐싱 구성] ──► Node.js 20 런타임 세팅 및 npm ci 패키지 락킹 설치 (npm 캐시 활용)`

                                     `│`

                                     `▼`

``[4단계: 컴파일 무결성 검증] ──► `npm run build` 실행으로 TypeScript 구문 및 타입 불일치 전수 검사``

                                     `│`

                                     `▼`

``[5단계: 스트레스 회귀 테스트] ──► `tests/syntheticBulk.test.ts` 스크립트 가동``

                                  ``├─ 1. `mdStaticParser` 전수 주입 (not.toThrow() 검증)``

                                  ``├─ 2. `scriptSplitter` 닉네임 발화 격리 파싱 검증``

                                  ``├─ 3. `purpleKpiEngine` 지표 도출 및 스키마 검증``

                                  `└─ 4. 지연 발생 시 그린 대피소(IndexedDB) 동기화 연동 검증`

### **`5.3. Git Push Webhook & Supabase Edge Function 라이브 배포 파이프라인`**

`운영자가 assets/stage_05_repository_pool/ 폴더에 마크다운 자산을 Git Push하면, Supabase Edge Function 기반의 무인 자동화 데이터 파이프라인이 즉시 가동됩니다.`

1. **`GitHub Webhook 이벤트 수신:`** `GitHub 원격 레포지토리에서 Push 이벤트가 발생하면 repo-webhook-receiver Edge Function URL로 HTTP POST 요청이 발송됩니다.`  
2. **`HMAC-SHA256 보안 검증:`** `Edge Function은 요청 헤더의 x-hub-signature-256 값을 원시 바이트 HMAC-SHA256 해시로 검증하여 비인가 요청을 401로 즉각 거절합니다.`  
3. **`디렉토리 변동 격리 필터링:`** `Push 페이로드 내 변경된 파일 목록을 순회하여, 오직 assets/stage_05_repository_pool/ 하위 마크다운 파일이 포함된 경우에만 하위 프로세스를 진행합니다. (기타 커밋은 200 SKIPPED 반환)`  
4. **`비공개 메타데이터 적재:`** `무결성이 검증된 웹훅 전달 이벤트는 Service Role 권한을 통해 원격 DB의 github_webhook_deliveries 비공개 메타데이터 테이블에 안전하게 기록됩니다. (원본 payload 및 개인 처방 본문은 저장하지 않음)`

# **`MVP User Flow Specification: whatImSupposedto-Didit Web Service`**

## **`1. System Architecture & Core Pipeline Foundation`**

### **`1.1 End-to-End Data Layer & Execution Flow`**

`The whatImSupposedto-Didit platform ingests unstructured Markdown files—specifically goal definition files (*_target.md) and multi-user dialogue stream files (*_script.md)—processing them through four core architectural system layers.`

`[Unstructured Markdown Asset Input]`

  `│   - Goal Definition File (*_target.md)`

  `│   - Dialogue Stream File (*_script.md)`

  `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ 1. CORE PARSING LAYER                                   │`

`│    - mdStaticParser: Front Matter & static token parser │`

`│    - scriptSplitter: Regex user speech isolator         │`

`└───────────────────────────┬─────────────────────────────┘`

                            `│ (Structured JSON Payload)`

                            `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ 2. INTELLIGENCE & EVALUATION LAYER                      │`

`│    - aiContrastEngine: GPT-4o Structured Outputs        │`

`│    - purpleKpiEngine: Substring achievement evaluator   │`

`└───────────────────────────┬─────────────────────────────┘`

                            `│ (4-Step Prescription & KPI Report)`

                            `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ 3. PERSISTENCE & GATEWAY LAYER                          │`

`│    - Supabase PostgreSQL: Persistence & sync            │`

`│    - Row Level Security: Multi-tenant peer sharing (RLS) │`

`└───────────────────────────┬─────────────────────────────┘`

                            `│ (Fault Isolation & Release Control)`

                            `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ 4. FAULT-TOLERANT & OPERATION LAYER                     │`

`│    - ApiCircuitBreaker: 5s timeout IndexedDB shelter    │`

`│    - FeatureFlagEngine: Real-time component hotfixes    │`

`│    - RollbackHandler: 8s deadline timer execution       │`

`└─────────────────────────────────────────────────────────┘`

#### **`Core System Layer Architecture`**

| `Layer Name` | `System Components` | `Primary Function` | `Data Transformation State` |
| :---- | :---- | :---- | :---- |
| **`1. Core Parsing Layer`** | `mdStaticParser, scriptSplitter` | `Extracts YAML Front Matter, quotes, checklists, and isolates specific user speech logs from raw Markdown dumps.` | `Raw .md text \rightarrow Clean Structured JSON payload` |
| **`2. Intelligence & Evaluation Layer`** | `aiContrastEngine, purpleKpiEngine` | `Generates 4-step actionable prescriptions via GPT-4o Structured Outputs and scans user speech for single-hit achievement validation.` | `Structured JSON \rightarrow 4-Step Prescription & KpiMatchReport` |
| **`3. Persistence & Gateway Layer`** | `Supabase PostgreSQL, Row Level Security (RLS)` | `Stores parsed prescriptions, synchronizes execution state, and isolates user namespaces while allowing legal peer expression "stealing".` | `Runtime Report \rightarrow Persisted PostgreSQL Row Records` |
| **`4. Fault-Tolerant & Operation Layer`** | `ApiCircuitBreaker, FeatureFlagEngine, RollbackHandler` | `Manages 5-second API circuit breaking to IndexedDB, 30-second TTL feature hotfixes, and 8-second deadline transaction controls.` | `Active Connection \rightarrow Sheltered / Hotfixed / Rolled-back State` |

**`Production Schema vs. Staged Migration Callout`**`: In the active remote Supabase production environment (public), the deployed tables are ai_prescriptions and github_webhook_deliveries. Tables referenced in legacy or staging specifications (prescription_logs, user_profiles, system_feature_flags, and system_routing_config) exist in local SQL migration files (00_system_tables_setup.sql, 02_init_text_schema.sql) and represent target architecture migrations.`

#### **`Automated GitHub Webhook Ingress & Continuous Deployment Pipeline`**

`When operational log assets are pushed to assets/stage_05_repository_pool/ in the remote repository, the system triggers an automated background ingestion flow managed by the repo-webhook-receiver Supabase Edge Function.`

`[Operator: Git Push to Repository]`

  `│`

  `▼`

`[GitHub Webhook Event Triggered]`

  `│  POST to /functions/v1/repo-webhook-receiver`

  `│  Header: x-hub-signature-256 (HMAC-SHA256)`

  `▼`

`[Edge Function Verification & Filtering]`

  `│  1. Verify HMAC-SHA256 against GITHUB_WEBHOOK_SECRET`

  `│  2. Filter payload commits for assets/stage_05_repository_pool/`

  `▼`

`[Private Metadata Logging & Execution]`

  `│  Uses SUPABASE_SERVICE_ROLE_KEY`

  `▼`

`[Database Persistence]`

  `│  Inserts delivery summary to public.github_webhook_deliveries`

  `└─ (Delivery UUID, repo name, commit count, target file count)`

1. **`HMAC Signature Verification`**`: The Edge Function captures the raw request body bytes and calculates an HMAC-SHA256 digest, comparing it against the incoming x-hub-signature-256 header. Invalid signatures return HTTP 401 immediately.`  
2. **`Path-Based Directory Filtering`**`: The handler inspects payload.commits for modified or added paths. If no files under assets/stage_05_repository_pool/ were changed, processing halts with a 200 SKIPPED response to preserve infrastructure resources.`  
3. **`Private Metadata Persistence`**`: Delivery metadata (delivery UUID, repository full name, commit count, target pool file count) is persisted directly to public.github_webhook_deliveries using the elevated SUPABASE_SERVICE_ROLE_KEY. Raw body payloads and user prescription text are explicitly excluded from webhook logs to ensure zero privacy leakage.`

#### **`Integration with the 8-Phase Evolution Model`**

`The architecture aligns with the platform's 8-Phase Evolution Model, incorporating defensive armors as operational maturity progresses:`

| `Evolution Phase` | `Core Product Target` | `Operational Risk Armor & Governance` |
| :---- | :---- | :---- |
| **`Phase 1`** | **`MVP Parser Pipeline`** | `Basic static parsing (mdStaticParser) and speech splitting (scriptSplitter).` |
| **`Phase 2`** | **`Sample Data Integration`** | `Mock dataset execution and unit test assertion boundaries.` |
| **`Phase 3`** | **`Synthetic Data Factory`** | `Bulk asset generation via persona metadata profiles (datasetGenerator.ts).` |
| **`Phase 4`** | **`Orange CI Automation`** | `GitHub Actions build-time verification and bulk stress testing (syntheticBulk.test.ts).` |
| **`Phase 5`** | **`Purple CD & Webhook Ingest`** | `Supabase Edge Function deployment and repository pool live webhook sync (repo-webhook-receiver).` |
| **`Phase 6`** | **`Green Circuit Breaker`** | `Network failure isolation and local IndexedDB emergency sheltering (Green Armor).` |
| **`Phase 7`** | **`Yellow Feature Flag Control`** | `Zero-downtime hotfixes and in-memory TTL component toggles (Yellow Armor).` |
| **`Phase 8`** | **`Blue Governance & Rollback`** | `8-second deadline execution guards and Blue/Green prompt switching (Blue Armor).` |

#### **`Step-by-Step Technical Walkthrough: Front-End UI to Back-End Execution`**

1. **`User Input Capture`**`: The React interface captures target goals and dialogue logs via text inputs or file uploads.`  
2. **`Parsing & Isolation`**`: mdStaticParser extracts metadata (YAML Front Matter, quote lines > , checklist tokens - [ ] / - [x]). scriptSplitter applies regex sequences to isolate lines belonging to the specified user nickname.`  
3. **`AI Prescription Generation`**`: Extracted text context is passed to aiContrastEngine. Using GPT-4o with structured JSON outputs (AiPrescriptionSchema), the engine produces a 4-step prescription (originalText, simplifiedText, cheatCodeText, sensoryText, actionPlan).`  
4. **`Purple KPI Scanning`**`: Parsed goal keywords are passed to purpleKpiEngine.ts. The engine executes a 3-stage scanning algorithm across isolated user speech lines. If a keyword hit or hardcoded whitelist token (완료, 했습, 읽었, 포기 안, 성공) is detected, isAchieved is set to true.`  
5. **`Persistence & Peer Sharing`**`: Output payloads write to Supabase PostgreSQL (ai_prescriptions in production; prescription_logs in staged schema). RLS policies evaluate (SELECT auth.uid()) = user_id for writes while permitting open read access (FOR SELECT) for peer expression stealing.`  
6. **`Fault Isolation Escalation`**`:`  
   * `If AI network requests exceed 5000ms or fail 3 consecutive times, ApiCircuitBreaker trips to OPEN, redirecting inputs to local IndexedDB (DidItEmergencyShelter).`  
   * `If UI component rendering encounters unhandled symbols, FeatureFlagEngine falls back to standard plain-text rendering via ToggleGateway.`  
   * `If backend execution stalls past 8000ms, RollbackHandler cancels the request via AbortSignal and flags TIMEOUT_INDETERMINATE.`

### **`1.2 Authentication & Security Lifecycle Flow`**

`[User Session Trigger]`

  `│  supabase.auth.signInWithOAuth({ provider: 'google' })`

  `▼`

`[Google OAuth 2.0 Web Provider]`

  `│  Authorized Redirect: https://supabase.co`

  `▼`

`[Session Authorization & Token Issue]`

  ``│  `auth.users` verifies/issues user UUID``

  `▼`

`[Client Session Context Capture]`

  `│  supabase.auth.getUser() extracts authenticated UUID`

  `▼`

`[Database Persistence Binding]`

  `│  Foreign Key Link: public.ai_prescriptions.user_id = auth.users.id`

  `▼`

`[Row Level Security (RLS) Enforcement]`

  `│  Policy: (SELECT auth.uid()) = user_id`

  `├─► authenticated: SELECT / INSERT allowed for matching user_id`

  `└─► anon: Table permissions revoked (0 rows accessible)`

1. **`OAuth Session Establishment`**`: Authentication initiates via supabase.auth.signInWithOAuth configured for Google OAuth 2.0 (Web Application provider with https://supabase.co as the authorized redirect URI).`  
2. **`Session Identification`**`: Upon successful redirect, supabase.auth.getUser captures the session context and extracts the verified UUID from auth.users.`  
3. **`Foreign Key Context Binding`**`: The extracted UUID binds directly to the user_id foreign key column in public.ai_prescriptions (as well as staged tables public.user_profiles and public.prescription_logs).`  
4. **`Row Level Security Enforcement`**`:`  
   * `RLS policies restrict table interaction by evaluating (SELECT auth.uid()) = user_id.`  
   * `authenticated roles can read and insert records where their auth.uid() matches user_id.`  
   * `anon roles have table permissions completely revoked on ai_prescriptions, preventing unauthenticated access.`  
   * `UPDATE, DELETE, and TRUNCATE operations are disabled for both anon and authenticated roles on ai_prescriptions to enforce append-only log immutability.`

## **`2. Common Core Pipeline User Flow`**

### **`2.1 Unstructured Markdown Ingestion & Multi-User Script Parsing Flow`**

`[Raw Markdown Document Input]`

  `│`

  `├──► mdStaticParser (TypeScript Native String Parsing)`

  ``│     ├─► Front Matter Parsing: Split on `---`, map key-value pairs, strip quotes.``

  ``│     ├─► Quote Parser: Match `> ` lines to isolate user mindset/goals.``

  ``│     └─► Checklist Parser: Match `- [ ]` -> completed: false | `- [x]` -> completed: true.``

  `│`

  `└──► scriptSplitter (3-Tier Regex Sequence)`

        `├─► Priority 1: /^\s*\*\*(.*?)\*\*?\s*:\s*(.*)/  (Bold Nickname)`

        `├─► Priority 2: /^\s*`

`$(.*?)$`

`\s*:?\s*(.*)/       (Bracket Nickname)`

        `└─► Priority 3: /^\s*([^:\s]+)\s*:\s*(.*)/         (Standard Colon)`

#### **`Parsing & Extraction Mechanics`**

`mdStaticParser uses native TypeScript string manipulation methods to eliminate external library overhead and isolate memory boundaries.`

* **`YAML Front Matter`**`: Locates the opening and closing --- delimiters at the file head. The inner block splits line-by-line into key-value pairs, with surrounding quotes normalized via string/regex operations.`  
* **`Blockquote Tokens (> )`**`: Identifies lines starting with > . The prefix is stripped, and the trimmed string is stored as the user's mindset or target statement.`  
* **`Checklist Tokens (- [ ], - [x])`**`: Scans for checklist prefixes. Lines matching - [ ] map to completed: false, while lines matching - [x] or - [X] map to completed: true.`

#### **`Parsing Crash Defense`**

1. **`Unclosed Front Matter`**`: If an opening --- exists without a closing delimiter, the parser safely falls back to placing the entire content body into rawBody without throwing a runtime exception.`  
2. **`Whitespace & Line-Break Sanitization`**`: Input strings undergo .trim() and ^\s* regex normalization prior to processing to prevent syntax crashes caused by unexpected whitespace or line-ending sequences.`

#### **`Multi-User Script Parsing (scriptSplitter)`**

`When parsing multi-user chat logs (global_script_w1.md), scriptSplitter applies a 3-tier regex sequence to extract target user speeches from shared dialogue dumps:`

1. **`Priority 1 (Bold Match)`**`: /^\s*\*\*(.*?)\*\*?\s*:\s*(.*)/ — Matches bolded nicknames (e.g., **EasyPeasy**: Today was a success!).`  
2. **`Priority 2 (Bracket Match)`**`: /^\s*`  
3. `$(.*?)$`  
4. `\s*:?\s*(.*)/ — Matches bracketed nicknames (e.g., [EasyPeasy]: Memorized 1 word).`  
5. **`Priority 3 (Standard Colon Match)`**`: /^\s*([^:\s]+)\s*:\s*(.*)/ — Matches plain text nicknames followed by a colon (e.g., EasyPeasy: Reading complete).`

#### **`Context Separation Rules`**

* **`Nickname Normalization`**`: Target nicknames are normalized using .toLowerCase() and stripped of surrounding whitespace (.trim()), ensuring EasyPeasy and easypeasy resolve to the same identity context.`  
* **`Token Conflict Bypass`**`: To prevent goal blockquotes (> ) or checklist items (- [ ]) containing colons from being misinterpreted as dialogue entries, lines starting with Markdown control symbols are excluded from Priority 3 matching.`

### **`2.2 AI 4-Step Prescription Generation Workflow`**

`The aiContrastEngine transforms raw perfectionist or hesitant goal statements into actionable micro-steps using GPT-4o with structured output schema enforcement (AiPrescriptionSchema).`

`[Raw Target Goal Context]`

  `│  "매일 영어 회화 한 문장 완벽하게 외우기"`

  `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ aiContrastEngine (GPT-4o Structured Outputs)           │`

`├─────────────────────────────────────────────────────────┤`

`│ 1. originalText    ➜ Preserves raw goal intact          │`

`│ 2. simplifiedText  ➜ Lowers emotional tension/length    │`

`│ 3. cheatCodeText  ➜ 5-Year-Old barrier reduction       │`

`│ 4. sensoryText     ➜ Sound/rhythm action cue            │`

`│ 5. actionPlan      ➜ 3 to 5 executable steps            │`

`└───────────────────────────┬─────────────────────────────┘`

                            `▼`

`[Structured JSON Output Instance]`

#### **`Prescription Mapping Logic`**

1. **`originalText`**`: Preserves the exact user input without modification.`  
2. **`simplifiedText`**`: Removes emotional strain and perfectionist conditions ("perfectly", "without fail"), condensing the core intent into a clear baseline sentence.`  
3. **`cheatCodeText`**`: Applies a "5-Year-Old Cheat Key" transformation, drastically lowering the execution threshold (e.g., "Just 1 sentence today", "1 minute start is enough").`  
4. **`sensoryText / Phonics`**`: Replaces abstract planning with physical, auditory, or sensory prompts (e.g., "Read aloud 3 times", "Speak it out loud once").`  
5. **`actionPlan`**`: Generates a discrete list of 3 to 5 standalone micro-actions.`

#### **`Schema Implementation Example`**

`{`

  `"userId": "user_001",`

  `"personaId": "easy_peasy",`

  `"sourceType": "target",`

  `"originalText": "매일 영어 회화 한 문장 완벽하게 외우기",`

  `"simplifiedText": "매일 영어 문장 하나를 암기해보세요.",`

  `"cheatCodeText": "오늘은 한 문장만! 완벽하지 않아도 괜찮아요.",`

  `"sensoryText": "작게라도 한 번 크게 읽고, 입으로 따라 말해보면 됩니다.",`

  `"actionPlan": [`

    `"오늘 영어 문장 1개를 고른다",`

    `"크게 소리 내서 3번 읽는다",`

    `"한 문장으로 의미를 말해본다",`

    `"완료 로그를 남긴다"`

  `],`

  `"confidence": 0.94,`

  `"generatedAt": "2026-10-26T09:00:00.000Z"`

`}`

### **`2.3 Purple KPI Valuation Engine Flow (Single-Hit Achievement Scanning)`**

`The purpleKpiEngine.ts module replaces "All-or-Nothing" evaluation models with a Single-Hit Success mechanism. If a user executes or logs their target action even once within a dialogue stream, the engine evaluates the overall achievement as valid (isAchieved: true).`

`[Parsed Markdown Target & Dialogue Stream Input]`

                         `│`

                         `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ Step 1: Goal Keyword Pool Generation                   │`

`│ - Split quotes/todos by whitespace                      │`

`│ - Extract unique tokens >= 2 characters                 │`

`│ - Lowercase normalization                               │`

`└───────────────────────────┬─────────────────────────────┘`

                            `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ Step 2: Substring Pattern Scan                          │`

`│ - Scan isolated user speech lines for exact keyword hits│`

`└───────────────────────────┬─────────────────────────────┘`

                            `│ (If substring scan finds no match)`

                            `▼`

`┌─────────────────────────────────────────────────────────┐`

`│ Step 3: Hardcoded Trigger Override Scan                 │`

`│ - Scan speech lines against Whitelist Tokens:           │`

`│   ['완료', '했습', '읽었', '포기 안', '성공']            │`

`└───────────────────────────┬─────────────────────────────┘`

                            `▼`

`[Single-Hit Condition: 1+ Matches Found ➜ isAchieved: true]`

                            `│`

                            `▼`

`[Generate KpiMatchReport Payload]`

#### **`Fallback Trigger Whitelist Precision`**

`The fallback trigger array is defined in Source 05 as exactly five string literals: ['완료', '했습', '읽었', '포기 안', '성공']`

`Morphological variants in user speech (e.g., "했습니", "공부했습") match against the string literal token '했습', ensuring defensive or truncated user statements are evaluated successfully.`

#### **`Output Payload Schema (KpiMatchReport)`**

| `Field Name` | `Type` | `Description` |
| :---- | :---- | :---- |
| `userNickname` | `string` | `Unique identifier nickname of the evaluated user.` |
| `isAchieved` | `boolean` | `true if at least 1 keyword match or execution trigger token is detected; otherwise false.` |
| `matchedSpeeches` | `Array<{ lineNumber: number, matchedText: string, reason: string }>` | `Array containing exact line numbers (1-based), raw speech strings, and matching reasons.` |
| `achievementRate` | `number` | `Ratio of matched achievement speeches relative to total user speeches (Percentage).` |
| `evaluatedAt` | `string` | `ISO 8601 formatted execution timestamp.` |

### **`2.4 Supabase Data Persistence & Peer Expression Theft (Steal) Flow`**

`[User Browses Community Feed]`

       `│`

       `▼`

``[SELECT Operation] ──► RLS Policy (FOR SELECT): Open to `authenticated` users``

       `│`

       `▼`

`[User Clicks "Steal Expression"]`

       `│`

       `▼`

`` [INSERT Operation] ──► RLS Policy (FOR INSERT): Enforces `(SELECT auth.uid()) = user_id` ``

                       `` Sets `is_stolen_from_peer: true` & `source_log_id: <original_id>` ``

       `│`

       `▼`

`[UPDATE / DELETE]  ──► RLS Policy (FOR UPDATE/DELETE): Blocked for non-owners (0 rows affected)`

#### **`RLS Operational Security Rules`**

* **`FOR SELECT (Public Community Browsing)`**`: Accessible to authenticated users. Users can browse and review peer 4-step prescriptions and physical action cues.`  
* **`FOR INSERT (Self-Namespace Stealing)`**`: Enforced via WITH CHECK ((SELECT auth.uid()) = user_id). When a user "steals" a peer's expression, the system creates a new row under the thief's user_id, setting is_stolen_from_peer = true and linking source_log_id to the source record. Users cannot insert records under another user's UUID.`  
* **`FOR UPDATE / DELETE (Owner Isolation)`**`: Governed by USING ((SELECT auth.uid()) = user_id). Requests attempting to alter or delete records owned by other users affect 0 rows (UPDATE 0). On public.ai_prescriptions, UPDATE and DELETE are disabled across both anon and authenticated roles.`

## **`3. 4-Stage User Lifecycle Flows`**

### **`Lifecycle Comparison Matrix`**

| `Lifecycle Stage` | `UX / User Experience` | `Functional Permissions & Storage` | `Technical Constraints` |
| :---- | :---- | :---- | :---- |
| **`3.1 Guest`** | `Zero-friction browser demo. Direct entry into "01 내가 하려던 것" (Goal) and "02 실제로 해본 것" (Attempt).` | `In-memory React state (useState) only. No persistent database storage.` | `No external AI API calls; relies on client-side functions (parseMarkdown, evaluatePurpleKpi) and static output templates.` |
| **`3.2 Free Tier`** | `Authenticated via Google OAuth. History tracking, weekly basic quota, community feed reading, and peer expression stealing.` | `Writes to user-owned rows in ai_prescriptions. Entitled to 3 AI prescriptions per week.` | `AI calls restricted by weekly quota; enforces RLS security policies.` |
| **`3.3 Pro Tier (BYOK)`** | `Power user experience. Bring Your Own Key (Gemini API) integration, unlimited AI generation, real-time Purple KPI analysis.` | `Unlimited AI execution using personal API key. Full read/write storage on Supabase with IndexedDB emergency caching.` | `Requires valid user-supplied Google Gemini API Key. Client manages fallback routing and sync.` |
| **`3.4 Canceled`** | `Read-only mode for historical data. Past achievement logs and stolen peer expressions remain preserved.` | `Existing data remains intact in Supabase PostgreSQL tables (ai_prescriptions, user_profiles).` | `New AI generation reverts to Free Tier weekly quota limits. Historical records remain protected via RLS.` |

### **`3.1 Guest Lifecycle Flow (Unauthenticated Zero-Barrier Local Demo)`**

`[Guest User Accesses Demo Web UI]`

  `│`

  `├──► Input Goal ("01 내가 하려던 것") & Input Action Log ("02 실제로 해본 것")`

  ``│     └─ Retained strictly inside React Component State (`useState`)``

  `│`

  `├──► Client-Side Local Execution (No Network / API Requests)`

  `│     ├─ parseMarkdown(): Extracts goal string client-side`

  `│     ├─ splitScriptByUser(): Isolates speech lines client-side`

  `│     └─ evaluatePurpleKpi(): Computes single-hit achievement locally`

  `│`

  `└──► Render Demo Output Cards & Metric Badge`

        `├─ "02 조금 더 쉽게": Formatted baseline template`

        `├─ "03 지금 할 수 있는 치트키": 1-minute barrier lowering template`

        `├─ "04 시작 소리": Phonics sound cue ("시-작-해-보자")`

        `└─ Metric Badge: Displays "시도 신호 100%" badge`

1. **`Client-Side Input Capture`**`: The guest user enters goal text into "01 내가 하려던 것" and attempt logs into "02 실제로 해본 것". Input strings remain in React browser state (useState).`  
2. **`Zero External Data Transfer`**`: No network requests are sent to OpenAI, Gemini, or remote databases.`  
3. **`Local Parsing & Evaluation`**`:`  
   * `parseMarkdown extracts goal structures directly in the browser.`  
   * `splitScriptByUser isolates input speech lines locally.`  
   * `evaluatePurpleKpi evaluates goal keywords against attempt text, rendering the "시도 신호 100%" metric badge.`  
4. **`Template Prescription Display`**`: The UI renders pre-formatted rule-based template cards:`  
   * `"02 조금 더 쉽게"`  
   * `"03 지금 할 수 있는 치트키"`  
   * `"04 시작 소리" (e.g., "시-작-해-보자")`

### **`3.2 Free Tier Lifecycle Flow (Authenticated Baseline Experience)`**

1. **`Authentication`**`: User completes Google OAuth 2.0 login, establishing an authenticated session with a unique auth.users UUID.`  
2. **`Profile Provisioning`**`: System provisions a record in user_profiles linked to the user's UUID.`  
3. **`Weekly AI Prescription Quota`**`: Grants 3 AI-generated 4-step prescriptions per week via aiContrastEngine.`  
4. **`Community Feed & Peer Theft Access`**`: User can browse global community prescription logs (FOR SELECTenabled) and copy peer expressions into their private profile (is_stolen_from_peer = true).`  
5. **`Data Isolation`**`: All saved records are enforced via RLS (SELECT auth.uid()) = user_id.`

### **`3.3 Pro Tier Lifecycle Flow - BYOK (Bring Your Own Key & Unlimited AI)`**

1. **`API Key Registration`**`: Pro subscribers enter their personal Google Gemini API Key into secure browser settings.`  
2. **`Unlimited Generation`**`: Bypasses platform quota limits, processing prompt transformations directly via the user's Gemini key.`  
3. **`Real-time Purple KPI Calculation`**`: Computes keyword matches and trigger fallbacks immediately upon log entry.`  
4. **`Resilient Local-to-Remote Sync`**`: If network disruptions occur during session execution, local actions buffer in IndexedDB (DidItEmergencyShelter) with syncStatus: 'PENDING_SYNC'. Upon reconnection, background workers push buffered records to Supabase.`

### **`3.4 Canceled Subscription Lifecycle Flow (Quota Downgrade & Preservation)`**

1. **`Pro Status Downgrade`**`: The system transitions the user's lifecycle state from Pro Tier to Canceled.`  
2. **`Data Preservation`**`: Historical prescription logs, 4-step actionable cards, and stolen peer expressions remain preserved in Supabase (ai_prescriptions, user_profiles).`  
3. **`Read-Only Access to History`**`: Users retain access to view, search, and review historical logs and achievement statistics.`  
4. **`Quota Reversion`**`: AI generation capabilities revert to the Free Tier limit (3 prescriptions per week).`

## **`4. Persona-Specific Detailed User Flows`**

              `┌─────────────────────────────────────────┐`

               `│   4 CORE PERSONAS IN METADATA REGISTRY  │`

               `└────────────────────┬────────────────────┘`

                                    `│`

    `┌─────────────────┬─────────────┴───────────────┬──────────────────┐`

    `▼                 ▼                             ▼                  ▼`

`EasyPeasy          NewYear                        Sara               Rina`

`(Perfectionist)    (Plan-Addict)                  (Role Model)       (Apathy Defensive)`

`Trigger: 0.4       Trigger: 0.2                   Trigger: 0.9       Trigger: 0.6`

### **`4.1 EasyPeasy (easy_peasy): Perfectionism Control User Flow`**

#### **`1. Persona Metadata Profile`**

* **`Psychological Trait`**`: Extreme perfectionism. Experiences cognitive friction unless conditions are ideal, relying on failure-defense mechanisms.`  
* **`Linguistic Style`**`: Uses grandiose English titles (> Perfect Native Conversation Mastery) alongside hesitant, self-critical Korean dialogue excuses.`  
* **`Action Trigger Rate`**`: 0.4 (40% probability of logging explicit execution).`

#### **`2. Input Lifecycle`**

`---`

`persona_id: easy_peasy`

`week: 1`

`---`

`> Perfect Native Conversation Mastery`

`- [ ] Read 1 English conversation chapter perfectly and record audio voice`

#### **`3. AI Prescription Transformation`**

* **`originalText`**`: "Perfect Native Conversation Mastery - Read 1 English conversation chapter perfectly"`  
* **`simplifiedText`**`: "Try memorizing single English sentences daily."`  
* **`cheatCodeText`**`: "Today, just 1 sentence! It's okay if it's not perfect."`  
* **`sensoryText`**`: "Read out loud once, even softly, and repeat with your mouth."`

#### **`4. Speech Log Matching & Purple KPI Rescue Trigger`**

* **`Logged Dialogue Stream`**`: "오늘 영어 회화 한 문장 간신히 외웠어요... 완벽하진 않았지만 소리 내서 크게 세 번 읽었습니다"`  
* **`Engine Execution`**`: purpleKpiEngine scans keywords (영어, 회화, 문장). Step 3 trigger override scan detects the whitelist token '읽었'.`  
* **`Outcome`**`: isAchieved: true, validating the execution attempt and counteracting perfectionist paralysis.`

### **`4.2 NewYear (new_year_hero): Plan-Addict User Flow`**

#### **`1. Persona Metadata Profile`**

* **`Psychological Trait`**`: Planning addict. Derives fake achievement from setting up elaborate tools and declarations, followed by cognitive avoidance when execution begins.`  
* **`Linguistic Style`**`: Markdown overloaded with exclamation points, bold declarations, and decorative formatting, paired with unchecked checklist boxes (- [ ]).`  
* **`Action Trigger Rate`**`: 0.2 (20% probability of logging explicit execution).`

#### **`2. Input Lifecycle`**

`# !!! NEW YEAR HEALTH DASHBOARD BOOTSTRAP !!!`

`> MUST EXERCISE 2 HOURS EVERY SINGLE MORNING AT 5 AM OVER 365 DAYS!`

`- [ ] 05:00 AM Gym Arrival`

`- [ ] 05:30 AM Cardio Blast`

#### **`3. AI Prescription Transformation`**

* **`originalText`**`: "MUST EXERCISE 2 HOURS EVERY SINGLE MORNING AT 5 AM OVER 365 DAYS!"`  
* **`simplifiedText`**`: "Move your body lightly in the morning."`  
* **`cheatCodeText`**`: "Just do a 10-second stretch right now. That counts as passing today!"`  
* **`sensoryText`**`: "Stand up, extend both arms above your head, and take a deep breath."`

#### **`4. Speech Log Matching & Purple KPI Rescue Trigger`**

* **`Logged Dialogue Stream`**`: "아 진짜 일어나기 피곤해서 침대에서 기지개 켰음... 다 읽고 공부했습"`  
* **`Engine Execution`**`: Keyword scan for "EXERCISE 2 HOURS" fails. Step 3 trigger override scan detects the whitelist token '했습' within "공부했습".`  
* **`Outcome`**`: isAchieved: true, turning a plan failure into a micro-execution success.`

### **`4.3 Sara (sara_active): Micro-Execution Role Model User Flow`**

#### **`1. Persona Metadata Profile`**

* **`Psychological Trait`**`: Action-oriented role model. Minimizes cognitive friction by taking immediate action before overthinking.`  
* **`Linguistic Style`**`: Minimalist goal statements accompanied by exclamation marks, emojis, and immediate execution logs (- [x] Done! 🔥).`  
* **`Action Trigger Rate`**`: 0.9 (90% probability of logging explicit execution).`

#### **`2. Input Lifecycle`**

`> 10 Pushups Right Now!`

`- [x] Completed in 30 seconds! 🔥`

#### **`3. AI Prescription Transformation`**

* **`originalText`**`: "10 Pushups Right Now!"`  
* **`simplifiedText`**`: "Do 10 pushups."`  
* **`cheatCodeText`**`: "Drop and do 1 pushup right now!"`  
* **`sensoryText`**`: "Place hands on the floor and push yourself up once."`

#### **`4. Speech Log Matching & Community Flow`**

* **`Logged Dialogue Stream`**`: "오늘도 10번 팔굽혀펴기 완료! 바로 해냈다 ⚡"`  
* **`Engine Execution`**`: Immediate match on keyword "팔굽혀펴기" and whitelist token '완료'. isAchieved: true.`  
* **`Community Feed Sharing`**`: Sara's log publishes to the global community feed (FOR SELECT enabled). Users with easy_peasy or rina_melancholy profiles can trigger "Steal Expression" to copy Sara's action template into their private workspace.`

### **`4.4 Rina (rina_melancholy): Chronic Apathy Defensive User Flow`**

#### **`1. Persona Metadata Profile`**

* **`Psychological Trait`**`: Chronically demotivated and defensive due to past failures. Cynical toward system intervention, keeping goals vague to prevent disappointment.`  
* **`Linguistic Style`**`: Brief, cynical, single-word or short fragment responses (> 그냥 그래요, 패스).`  
* **`Action Trigger Rate`**`: 0.6 (60% probability of logging explicit execution).`

#### **`2. Input Lifecycle`**

`> 그냥 그래요`

`- [ ] 패스`

#### **`3. AI Prescription Transformation`**

* **`originalText`**`: "그냥 그래요"`  
* **`simplifiedText`**`: "Take one small breath today."`  
* **`cheatCodeText`**`: "Just look out the window for 5 seconds."`  
* **`sensoryText`**`: "Take one slow, deep breath in and out."`

#### **`4. Speech Log Matching & Purple KPI Rescue Trigger`**

* **`Logged Dialogue Stream`**`: "오늘 지정시간독서 읽었"`  
* **`Engine Execution`**`: Core keyword scan returns empty due to vague target text. Step 3 trigger override scan matches the whitelist token '읽었'.`  
* **`Outcome`**`: isAchieved: true.`  
* **`Fallback Execution`**`: If Rina's custom parsing rules encounter syntax errors, ToggleGateway intercepts the request via feature flag (enable-rina-parser = false), safely routing execution to mdStaticParser.`

## **`5. Exception & Failure Mitigation User Flows`**

### **`Risk Armor & Evolution Phase Mapping`**

 `Phase 6: Green Circuit Breaker ──► Network / API Failure Isolation (IndexedDB Shelter)`

  `Phase 7: Yellow Feature Flag   ──► Runtime Component Hotfix (30s TTL Config Toggle)`

  `Phase 8: Blue Transaction Gate ──► 8s Deadline Timer & Prompt Blue/Green Switch`

### **`5.1 Green Circuit Breaker & IndexedDB Emergency Shelter Flow (Phase 6 Risk Armor)`**

`[API Request Initiated]`

       `│`

       `▼`

`[ApiCircuitBreaker Monitoring]`

       `│`

       `├─ Latency > 5000ms OR 3 Consecutive 50x Errors`

       `│  (failureThreshold: 3)`

       `▼`

`[Circuit State: CLOSED ──► OPEN]`

       `│`

       `▼`

`[Redirect Input to Local Emergency Shelter]`

       `│`

       `▼`

`[IndexedDB: DidItEmergencyShelter]`

  `` └─ Store: `markdown_backups` ``

  `` └─ Flag: `syncStatus: 'PENDING_SYNC'` ``

       `│`

       `▼`

`[10-Second Cooldown Period (cooldownPeriod: 10000ms)]`

       `│`

       `▼`

`[Circuit State: OPEN ──► HALF_OPEN]`

       `│`

       `├─ Test 1 Request ──► Success ──► Circuit State: HALF_OPEN ──► CLOSED`

       `│                                  │`

       `│                                  ▼`

       `│                          [Background Guardian Triggered]`

       `│                          - Calls getPendingSyncPayloads()`

       `│                          - Bulk Inserts pending logs to Supabase`

       `│                          - Purges local IndexedDB cache`

       `│`

       `└─ Test 1 Request ──► Failure ──► Circuit State: HALF_OPEN ──► OPEN`

1. **`Circuit Monitoring`**`: ApiCircuitBreaker.ts monitors latency and error rates on external network calls (e.g., OpenAI API, Supabase RPCs).`  
2. **`State Transition (CLOSED \rightarrow OPEN)`**`: If a request exceeds 5000ms or encounters 3 consecutive network/50x failures (failureThreshold: 3), the circuit opens.`  
3. **`Emergency Sheltering`**`: External API calls are blocked. Input Markdown payloads route directly to browser-local IndexedDB (DidItEmergencyShelter, markdown_backups store) with syncStatus: 'PENDING_SYNC'.`  
4. **`Cooldown & Half-Open State`**`: After a 10-second cooldown (cooldownPeriod: 10000ms), the breaker enters HALF_OPEN state and routes a single trial request to the backend.`  
5. **`Automatic Synchronization (CLOSED Transition)`**`: If the trial request succeeds, the circuit returns to CLOSED. A background process calls getPendingSyncPayloads(), bulk-inserts unsynced records into Supabase PostgreSQL, and purges the local emergency cache.`

### **`5.2 Yellow Feature Flag Hotfix & Cache Bypass Flow (Phase 7 Risk Armor)`**

`[Remote Config Table: system_feature_flags]`

       `│`

       `▼`

`[FeatureFlagEngine (30-Second TTL In-Memory Cache)]`

       `│  (Fallback: defaultValue = true if network fails)`

       `▼`

`[ToggleGateway Interface Routing]`

#### **`Component Switching Matrix`**

| `Feature Key` | `Normal State (true)` | `Hotfix / Isolated State (false)` |
| :---- | :---- | :---- |
| `enable-rina-parser` | `Runs Rina's custom defense text separation parser.` | `Isolates custom parser and routes inputs to standard mdStaticParser.` |
| `enable-phonics-hyphen-component` | `Renders hyphenated sound chips in the sensory UI view.` | `Converts broken hyphenated view strings to spaces and renders plain text mode.` |

#### **`Emergency Runbook Protocols`**

1. **`SQL Hotfix Execution`**`: When a broken UI or parser issue is reported, an administrator executes an update in the Supabase console:`

`UPDATE public.system_feature_flags` 

`SET is_enabled = false,` 

    `updated_at = TIMEZONE('utc'::text, NOW())`

`WHERE key = 'enable-phonics-hyphen-component';`

1. **`In-Memory Cache Purge`**`: If waiting for the 30-second TTL cache to expire is unacceptable, the administrator invokes clearCache() via the backend admin interface to purge the in-memory flag map immediately.`  
2. **`Live Verification`**`: The application switches affected UI components to fallback plain-text rendering without requiring code redeployments or container restarts.`

### **`5.3 Blue Transaction Rollback & Prompt Blue/Green Switching Flow (Phase 8 Risk Armor)`**

`[Backend Execution Gateway]`

       `│`

       `├──► 8-Second Deadline Control (RollbackHandler)`

       `│     ├─ Promise.race([ Processing logic, DeadlineTimer(8000ms) ])`

       `│     └─ On Timeout / AbortSignal ──► Returns TIMEOUT_INDETERMINATE`

       `│`

       `└──► Prompt Blue/Green Router (PromptBlueGreenRouter)`

             ``├─ Reads `system_routing_config` (active_color)``

             `│`

             ``├─ active_color === 'BLUE'  ──► Route to `v2.0_BLUE` (Baseline Prompt, Temp 0.3)``

             `│`

             ``└─ active_color === 'GREEN' ──► Route to `v2.1_GREEN` (Tuned Phonics, Temp 0.2)``

                   `│`

                   `└─ On Failure ──► Toggle active_color back to 'BLUE' (1-second instant rollback)`

#### **`8-Second Deadline Control (RollbackHandler)`**

* `RollbackHandler.ts applies a Promise.race capping backend transaction durations at 8000ms.`  
* `When a client deadline is exceeded, an AbortSignal is dispatched to cancel in-flight requests, returning TIMEOUT_INDETERMINATE.`

**`RPC Rollback Architecture Note`**`: The execute_safe_prescription_transaction RPC function represents scaffolding and is not currently deployed to the remote production database (15_WEBHOOK_AND_RPC_SAFETY.md). Client-side deadline timeouts issue an AbortSignal and return TIMEOUT_INDETERMINATE. Because client-side request cancellation cannot guarantee server-side transaction rollback on its own without a deployed atomic database procedure, the platform explicitly avoids claiming guaranteed rollback status (TIMEOUT_ROLLED_BACK) upon client cut-off.`

#### **`Prompt Blue/Green Router Governance (PromptBlueGreenRouter)`**

* **`Default State Isolation`**`: Locked to v2.0_BLUE (stable baseline prompt context, temperature 0.3).`  
* **`Green Route Deployment`**`: Updating active_color to GREEN in system_routing_config routes live traffic to v2.1_GREEN (temperature 0.2) without user logouts or downtime.`  
* **`1-Second Instant Rollback`**`: If v2.1_GREEN encounters schema breaking errors or unexpected exceptions, setting active_color back to BLUE in the remote configuration restores baseline prompt routing within 1 second.`

# **`whatImSupposedto-Didit MVP UI 명세서 (UI Specification Document)`**

## **`1. UI/UX 디자인 시스템 및 메인 대시보드 레이아웃 스펙 (Design System & Core Layout)`**

### **`섹션 개요`**

`완벽주의 성향을 지닌 사용자는 목표 달성 과정에서 실패에 대한 거부감, 복잡한 작성 양식, 그리고 과도한 인지적 부하(Cognitive Load)로 인해 시작 자체를 포기하거나 지속적인 실행을 중단하는 경향을 보입니다. 본 시스템의 UI/UX 디자인 철학은 사용자의 인지적 부하를 극단적으로 낮추고, "완벽하지 않아도 오늘 단 한 번의 작은 시도로 충분하다"는 심리적 안정감을 선사하는 데 목적을 둡니다. 이를 위해 서비스는 복잡한 하이라키 구조와 불필요한 레이어 진입 조작을 배제하고, 단일 화면 내에서 시각적 반응을 즉각 전달하는 3-Panel 반응형 대시보드 레이아웃을 채택합니다. 3-Panel 대시보드는 사용자가 작성한 마크다운 목표의 구조적 디코딩, AI 기반 4단 처방전의 실시간 시각화, 그리고 성취 지표 판정 및 커뮤니티 전광판 연동을 유기적으로 결합하여 무중단 클라이언트 제품 경험을 완결합니다.`

### **`디자인 톤앤매너 및 비주얼 가이드라인`**

* **`시각적 경량화 및 타이포그래피 스펙:`** `가독성을 최우선으로 고려하여 기본 본문 폰트 크기를 확대(최소 16px 이상)하고, 행간(line-height: 1.6) 및 자간(letter-spacing: -0.02em)을 넓혀 화면 진입 시 느껴지는 시각적 피로도를 최소화합니다.`  
* **`디자인 토큰 (Design Tokens) 및 파스텔/퍼플 포인트 색상 메커니즘:`**  
  1. `Purple Primary: #7C3AED (Tailwind: bg-purple-600) - 서비스 핵심 정체성 및 성취 구출 배지 강조용.`  
  2. `Pastel Purple / Soft Accent: #DDD6FE (Tailwind: bg-purple-200, text-purple-900) - 5세 치트키 카드 및 연동 완료 배지 백그라운드.`  
  3. `Accent Yellow: #FEF08A (Tailwind: bg-yellow-200) - 뉴이어 페르소나 우회 모드 및 주의 토스트 알림 포인트.`  
  4. `Background Neutral: #F9FAFB (Tailwind: bg-gray-50) - 대시보드 메인 베이스 캔버스 컬러.`  
  5. `Text Primary: #111827 (Tailwind: text-gray-900) / Secondary: #4B5563 (Tailwind: text-gray-600).`  
* **`대시보드 메인 체크인 및 4단 처방 Visual Flow 명세 (SOURCE UI Layout 기반):`** `사용자의 시선 흐름을 '체크인(입력) → 발견(스캔) → 처방(경량화)'의 직관적 축으로 유도합니다.`  
  1. **`01 내가 하려던 것 (목표 입력 영역):`** `"매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기"와 같이 완벽주의와 계획이 담긴 원문 목표를 부담 없이 입력하는 카드 영역.`  
  2. **`02 실제로 해본 것 (기록 입력 영역):`** `"오늘 영단어랑 회화 한 문장 간신히 외웠어요... 포기할 뻔한 걸 넘겼어요."와 같이 작은 시도나 중간에 멈춘 순간을 편하게 적어두는 타임라인 영역.`  
  3. **`오늘의 작은 성취 찾기 (트리거 버튼):`** `완벽함 대신 실전 시도 신호를 발굴해내는 핵심 실행 인터페이스 (aria-label="오늘의 작은 성취 찾기 실행").`  
  4. **`목표를 가볍게 바꿔보기 (4단 처방 카드):`**  
     * `01 내가 원한 것: 사용자 제출 원문 목표 재확인 뷰 (originalText).`  
     * `02 조금 더 쉽게: 원문의 감정적 긴장감 및 상투어를 압축 완화한 뷰 (simplifiedText).`  
     * `03 지금 할 수 있는 치트키: 완벽주의를 완화하는 5세 수준의 극단적 경량화 카드 (cheatCodeText).`  
     * `04 시작 소리: 행동 전환을 유도하는 리듬감 있는 감각/소리 표현 (sensoryText).`  
  5. **`기록에서 찾은 순간 (시도 신호 100% 리포트):`** `작성된 기록 문장 중 실행된 시도 신호를 스캔하여 키워드 및 트리거 기반 성취를 시각적으로 입증하는 리포트 영역.`

`+---------------------------------------------------------------------------------------------------+`

`|                                  whatImSupposedto-Didit Main Dashboard                            |`

`+---------------------------------+-----------------------------------+-----------------------------+`

`| [<TargetParserPanel>]           | [<PrescriptionCenterPanel>]       | [<KpiCommunityPanel>]       |`

`|  Left Panel: 목표 파싱          |  Center Panel: 대화록 & 4단 처방  |  Right Panel: KPI & Peer    |`

`|                                 |                                   |                             |`

`| - mdStaticParser 연동           | - scriptSplitter 유저 발화 격리   | - purpleKpiEngine 스캔      |`

`| - Front Matter 디코딩 (칩 렌더) | - 4단 처방전 렌더링 Card:         |   "성취 구출 성공!💜" 팝업  |`

`| - 인용구(> ) 강조 카드          |   1. originalText (원문)          | - Peer Steal 전광판 UI      |`

`| - 체크리스트(- [ ], - [x])     |   2. simplifiedText (조금 더 쉽게)|   (스틸하기 버튼 복제)      |`

`|   토글 컴포넌트                 |   3. cheatCodeText (5세 치트키)   |                             |`

`|                                 |   4. sensoryText (시작 소리)      | - aria-live="polite"        |`

`|                                 |   5. actionPlan (실천 플랜 리스트)|   접근성 토스트 노출        |`

`+---------------------------------+-----------------------------------+-----------------------------+`

### **`3-Panel 반응형 대시보드 구조 및 컴포넌트 명세`**

#### **`1) 컴포넌트 트라이앵글 및 상태 경계 (State Boundaries)`**

* **`상태 관리 모듈 분리:`**  
  * `useAuthStore: 유저 세션, OAuth 토큰 및 BYOK API Key 상태 관리.`  
  * `usePrescriptionStore: 파싱된 마크다운 데이터 및 AiPrescriptionSchema 기반 5대 프로퍼티 상태 관리.`  
  * `useCircuitBreakerStore: 그린/옐로우/블루 가드레일 상태 및 IndexedDB 대피소 동기화 플래그 관리.`

#### **`2) 좌측 패널 (<TargetParserPanel>) - 목표 파싱 영역`**

* **`mdStaticParser 연동 스펙:`** `서드파티 라이브러리 없이 TypeScript 네이티브 파서 기반으로 정적 마크다운(*_target.md)을 메모리에 직렬화 로드.`  
* **`YAML Front Matter 디코딩 스펙:`** `최상단 --- 블록을 행 단위로 분석하여 persona_type, nickname 구조체를 디코딩 후 UI 상단 파스텔 칩으로 노출. 미폐쇄(--- 유실) 예외 발생 시 파싱 크래시를 방지하기 위해 전체 텍스트를 rawBody로 자동 이관하여 안전 렌더링.`  
* **`인용구 및 체크리스트 UI 컴포넌트:`**  
  * `인용구 토큰(> ): 유저의 핵심 목표 문장으로 포획하여 좌측 퍼플 보더가 적용된 <QuoteBlock /> 컴포넌트로 강조.`  
  * `체크리스트 토큰(- [ ], - [x]): - [ ] 상태는 미완료(completed: false) 배지, - [x] 또는 - [X] 상태는 완료(completed: true) 퍼플 체크 배지로 엄격 매핑하여 토글 가능한 목록 UI로 출력.`

#### **`3) 중앙 패널 (<PrescriptionCenterPanel>) - 대화록 & AI 4단 처방전 카드`**

* **`scriptSplitter 기반 유저 발화 격리 뷰:`** `다중 대화 스트림(*_script.md)에서 유저 닉네임의 실전 행동 기록(Did)을 3단계 정규식 매칭 레이어(1순위 볼드 **NICK**:, 2순위 대괄호 [NICK]:, 3순위 일반 콜론 NICK:)로 필터링하여 타임라인 카드 뷰로 격리 노출.`  
* **`AI 4단 처방전 카드 렌더링 스펙 (AiPrescriptionSchema 5대 프로퍼티 완결 매핑):`**  
  1. `originalText (01 내가 원한 것): 완벽주의 성향이 담긴 원문 목표를 손상 없이 원형 그대로 상단 노출.`  
  2. `simplifiedText (02 조금 더 쉽게): 원문의 과도한 감정적 긴장과 완벽주의 상투어를 완화하여 읽기 쉬운 단문으로 압축 렌더링.`  
  3. `cheatCodeText (03 지금 할 수 있는 치트키): "오늘은 1문장만!", "완벽하지 않아도 1분만 시작" 등 5세 수준의 극단적 경량화 문구를 퍼플 하이라이트 카드로 노출.`  
  4. `sensoryText (04 시작 소리): "크게 소리 내서 3번 읽기", "입으로 따라 말하기" 등 뇌가 즉시 행동으로 전환되도록 돕는 감각/리듬 단서 출력.`  
  5. `actionPlan (실천 플랜 리스트): 즉시 실행 가능한 3~5개의 독립적 실천 항목을 체크박스 리스트 형태로 구성.`

#### **`4) 우측 패널 (<KpiCommunityPanel>) - KPI 배지 & 커뮤니티 전광판`**

* **`purpleKpiEngine 기반 성취 구출 배지 팝업:`**  
  * **`2글자 이상 핵심 토큰 추출 규칙:`** `목표 텍스트에서 공백을 제거하고 언어적 노이즈를 차단하기 위해 2글자 이상의 핵심 형태소 토큰만을 추려내어 고유 유니크 집합(Unique Set)을 빌드.`  
  * **`매칭 및 형태소 가드:`** `유저 발화 본문 내 키워드 서브스트링 매칭 또는 강제 행동 트리거 화이트리스트(['완료', '했습', '읽었', '포기 안', '성공']) 발견 시 isAchieved: true 판정과 함께 "성취 구출 성공!💜" 퍼플 배지 애니메이션 팝업을 트리거.`  
  * **`접근성 스펙:`** `Live Region 속성(aria-live="polite")을 적용하여 스크린 리더 유저에게 성취 구출 알림을 동적으로 전달.`  
* **`Peer Steal (스틸하기) 커뮤니티 전광판 UI:`** `타 유저의 훌륭한 4단 처방전이 실시간 흐르는 전광판 리스트 구성. 카드 내 '스틸하기' 버튼 클릭 시, 해당 처방 데이터가 로그인 유저의 보관함으로 복제 적재(is_stolen_from_peer: true, source_log_id 매핑)되는 인터랙션 제공.`

### **`결론 및 전환`**

`정밀하게 구성된 디자인 시스템 토큰과 3-Panel 대시보드 컴포넌트 레이아웃은, 사용자의 세션 권한 및 라이프사이클 단계 변화에 가변적으로 응답하며 무중단 UX를 보장하는 다음 라이프사이클 섹션으로 연결됩니다.`

## **`2. 사용자 라이프사이클 4단계별 화면 상태 및 권한 명세 (User Lifecycle UI States)`**

### **`섹션 개요`**

`시스템은 사용자의 진입 형태 및 구독 상태(게스트, Free, Pro BYOK, 구독중단)에 따라 차별화된 기능적 접근 권한과 데이터 흐름 제어 스펙을 적용합니다. 이는 비회원에게 진입 장벽 없는 무장벽 제품 경험을 제공하는 동시에, 인증 유저의 개인 데이터를 안전하게 격리하고, Pro 유저의 BYOK(Bring Your Own Key) 기반 AI 처방 연동을 효율적으로 제어하기 위함입니다.`

### **`라이프사이클 단계별 UI/UX Detailed Specs`**

#### **`1) 게스트 (Guest) 상태 UI`**

* **`무장벽 데모 UI 명세:`** `백엔드 DB 연동이나 외부 AI API 통신 없이, 브라우저 로컬 React State 기반으로 동작.`  
* **`1초 만에 예시 체험 퀵 배너:`** `최상단 고정 배너로 노출되며, 클릭 시 샘플 목표 및 대화록 데이터를 메모리에 즉시 로드.`  
* **`규칙 기반 데모 처방 안내 툴팁:`** `외부 AI 호출 없이 규칙 기반 템플릿으로 생성된 '데모 처방'임을 명시하고, 입력 데이터가 서버나 외부 DB로 전송/저장되지 않음을 안내.`

#### **`2) 로그인 (Free) 상태 UI`**

* **`Google OAuth 2.0 세션 프로필:`** `src/lib/auth.ts의 supabase.auth.signInWithOAuth 및 getUser 세션을 연동하여 구글 프로필 이미지와 닉네임을 상단 헤더에 표시.`  
* **`Supabase RLS 기반 프로덕션 DB 격리:`** `원격 프로덕션 DB의 active 테이블인 ai_prescriptions 접근 시 auth.uid() = user_id 조건의 Row Level Security(RLS) 정책이 적용되어 본인 데이터만 조회/삽입 허용. (※ 참고: prescription_logs 및 user_profiles 테이블은 원격 프로덕션 DB에 생성되지 않은 레거시/로컬 SQL 파일 스펙임).`  
* **`주간 3회 AI 쿼터 카운터 UI:`** `주간 AI 처방 생성 잔여 횟수를 상단 카운터 배지로 노출하며, 쿼터 소진 시 BYOK 전환 모달 안내.`  
* **`Peer Steal 활성화:`** `ai_prescriptions 테이블의 RLS FOR SELECT 개방 정책에 따라 커뮤니티 전광판의 동료 처방전을 자유롭게 읽고 본인 명의로 복제('스틸') 가능.`

#### **`3) 구독 (Pro - BYOK) 상태 UI`**

* **`Google Gemini API Key 설정 모달:`** `프로필/설정 레이어 내에서 유저가 직접 'Google Gemini API Key'를 입력 및 검증하는 모달 뷰 제공.`  
* **`연동 완료 배지 및 무제한 UI:`** `API Key 검증 완료 시 헤더 프로필 옆에 'BYOK 연동 완료' 파스텔 배지(bg-purple-200)가 부여되며, AI 4단 처방 생성 잔여 카운터가 해제되어 무제한 생성 UI로 전환.`  
* **`실시간 Purple KPI 구출 애니메이션:`** `purpleKpiEngine 스캔 성공 시 한층 화려한 퍼플 구출 애니메이션 팝업 발동.`  
* **`그린 대피소 동기화 상태 배지:`** `네트워크 장애로 IndexedDB에 임시 대피된 데이터가 존재할 경우, 헤더에 PENDING_SYNC 동기화 진행률 프로그레스 바 및 배지 표시.`

#### **`4) 구독중단 (Canceled) 상태 UI`**

* **`읽기 전용 (Read-Only) 배너:`** `과거 성취 기록 및 4단 처방 이력만 조회가 가능함을 알리는 읽기 전용 모드 안내 배너 상단 고정.`  
* **`Free 쿼터 전환 안내 및 마이크로 카피:`** `"다시 가벼운 시도를 이어가볼까요?"라는 문구와 함께 Free 주간 3회 쿼터 적용 안내 및 Pro BYOK 재구독 연결 버튼 배치.`

### **`4단계 라이프사이클 비교 표`**

| `구분` | `게스트 (Guest)` | `로그인 (Free)` | `구독 (Pro - BYOK)` | `구독중단 (Canceled)` |
| :---- | :---- | :---- | :---- | :---- |
| **`인증 방식`** | `미인증 (No-Auth)` | `Google OAuth 2.0` | `Google OAuth 2.0` | `Google OAuth 2.0 (전환)` |
| **`AI API 연동 방식`** | `규칙 기반 데모 템플릿` | `서버 공용 AI API (주간 제한)` | `유저 자체 Gemini API Key` | `서버 공용 AI API (Free 제한)` |
| **`데이터 저장소`** | `Browser Local State` | `Supabase RLS DB (ai_prescriptions)` | `Supabase RLS DB + IndexedDB` | `Supabase RLS DB (Read-Only)` |
| **`주간 AI 쿼터`** | `0회 (데모 전용)` | `주간 3회` | `무제한 (Unlimited)` | `주간 3회 (Free 수준 전환)` |
| **`Peer Steal 활성화`** | `비활성화 (조회만 가능)` | **`활성화`** `(본인 명의 복제)` | **`활성화`** `(본인 명의 복제)` | `비활성화 (기존 이력 조회만)` |

### **`결론 및 전환`**

`라이프사이클별 데이터 접근 권한 및 보안 모듈 위에서, 사용자 개개인의 심리적 장벽을 실시간 감지하고 해소하는 페르소나 인터랙션 시스템이 작동합니다.`

## **`3. 4대 페르소나별 인터랙션 및 UI 피드백 명세 (Persona-Driven UI Interactions)`**

### **`섹션 개요`**

`사용자가 목표를 실행하는 과정에서 느끼는 심리적 장벽은 완벽주의, 계획 중독, 마이크로 실행 주저, 만성 의욕상실 등 다양한 형태로 나타납니다. 서비스는 PERSONA_METADATA_REGISTRY에 정의된 4대 핵심 페르소나의 텍스트 패턴을 실시간 감지하여, 심리적 거부감을 즉각 완화하는 맞춤형 UI 피드백 인터랙션을 렌더링합니다.`

### **`페르소나별 맞춤형 UI 피드백 스펙`**

`[유저 목표 및 대화록 입력 Stream]`

       `│`

       `├─► [이지비지] 거창한 영문 타이틀 감지 ──► '5세 치트키' 카드 Highlight + 퍼플 배지 팝업`

       `├─► [뉴이어]   미완료 체크리스트(- [ ]) ──► '목표 다이어트' 처방 버튼 + 옐로우 우회 모드`

       `├─► [사라]     즉시 실행 발화 감지     ──► 체크리스트 즉시 완료 애니메이션 + 공유 토글`

       `└─► [리나]     모호/단답형 입력 감지   ──► 극단적 마이크로 처방 카드 + 구출 툴팁`

#### **`1) 이지비지 (EasyPeasy) - 완벽주의 통제 타겟`**

* **`심리적 장벽 및 특성:`** `실행 잠재력은 높으나 100% 준비되지 않으면 시작을 못 하는 극단적 완벽주의 (actionTriggerRate: 0.4).`  
* **`UI 감지 및 피드백:`** `Perfect Native Conversation Mastery와 같은 거창한 영문 챌린지 타이틀 입력 시, UI는 이를 완벽주의 과부하 상태로 판별. AI 처방 카드 중 cheatCodeText ('5세 치트키' 카드: "오늘은 1문장만! 완벽하지 않아도 괜찮아요")를 형광 하이라이트(bg-yellow-200)로 최상단 강조 렌더링. 스캔 완료 시 "성취 구출 성공!💜" 퍼플 배지 팝업을 트리거하여 즉각적 성공 경험 제공.`

#### **`2) 뉴이어 (NewYear) - 계획 중독형 타겟`**

* **`심리적 장벽 및 특성:`** `계획 수립과 형식을 갖추는 것에서 가짜 성취감을 얻으나 정작 실행 단계에서는 회피 (actionTriggerRate: 0.2).`  
* **`UI 감지 및 피드백:`** `마크다운 본문 내 체크리스트 박스가 미완료(- [ ]) 상태로 다수 방치된 것을 감지하면, UI 상단에 '목표 다이어트' 가벼운 처방 버튼 노출. 버튼 클릭 시 옐로우 우회 모드가 작동하여 세부 체크리스트를 숨기고 단 1개의 우선순위 행동만 남기는 우회 가이드 UI 렌더링.`

#### **`3) 사라 (Sara) - 마이크로 트리거 실행 타겟`**

* **`심리적 장벽 및 특성:`** `생각을 줄이고 즉각 행동을 터뜨리는 건강한 롤모델 (actionTriggerRate: 0.9).`  
* **`UI 감지 및 피드백:`** `대화록 내 느낌표(!) 및 행동 완료 표현 스캔 즉시, 대시보드 체크리스트가 자동으로 체크되는 폭죽 완료 애니메이션 재생. 동시에 "이 멋진 처방을 커뮤니티 전광판에 공유할까요?" 스위치 토글 UI 인터랙션 활성화.`

#### **`4) 리나 (Rina) - 만성 의욕상실 방어 타겟`**

* **`심리적 장벽 및 특성:`** `반복된 실패 경험으로 목표 자체를 거부하거나 모호하게 설정 (actionTriggerRate: 0.6).`  
* **`UI 감지 및 피드백:`** `"그냥 그래요", "패스" 등의 단답형 또는 주어가 생략된 방어적 텍스트 입력 감지 시, 인지 부하가 0에 가까운 '극단적 마이크로 처방'(예: "계단 3칸만 올라가기", "책 펼쳐보기") 카드를 최소 크기로 노출. 유저가 '했음' 상태를 스캔하면 즉시 "작은 불씨를 살려냈어요! 구출 성공" 툴팁 UI 노출.`

### **`페르소나 인터랙션 매트릭스 표`**

| `페르소나 ID` | `심리적 장벽` | `언어적 스타일 특성` | `UI 감지 트리거` | `시스템 맞춤 UI 피드백 렌더링 방식` |
| :---- | :---- | :---- | :---- | :---- |
| **`easy_peasy`** | `완벽주의 / 실패 공포` | `거창한 영문 타이틀 + 국문 변명` | `영문 챌린지 타이틀 스캔` | `'5세 치트키' 카드 강조 렌더링 + '성취 구출 성공!💜' 퍼플 배지 팝업` |
| **`new_year_hero`** | `계획 중독 / 실행 회피` | `화려한 문체 + 빈 체크리스트` | `미완료 체크리스트(- [ ]) 방치` | `'목표 다이어트' 처방 버튼 노출 + 옐로우 우회 모드 가이드 UI` |
| **`sara_active`** | `행동 우선 (롤모델)` | `느낌표(!), 이모지, 즉각 인증` | `행동 완료 키워드 즉시 스캔` | `체크리스트 즉시 완료 애니메이션 + '커뮤니티 공유' 토글 스위치` |
| **`rina_melancholy`** | `만성 의욕상실 / 방어` | `단답형("패스"), 모호한 표현` | `주어 생략 및 단답형 입력` | `극단적 마이크로 처방 카드 렌더링 + '했음' 스캔 시 구출 툴팁 UI` |

### **`결론 및 전환`**

`페르소나별 맞춤 인터랙션이 가동되는 도중 외부 API 장애나 런타임 타임아웃이 발생하더라도, 브라우저 단의 삼중 운영 가드레일이 이를 실시간 보정합니다.`

## **`4. 삼중 운영 가드레일(그린·옐로우·블루) 상태 보정 UI 명세 (Fault-Tolerant UI Guardrails)`**

### **`섹션 개요`**

`외부 AI API 통신 마비, 컴포넌트 렌더링 오염, DB 트랜잭션 타임아웃 상황 속에서도 사용자가 작성한 마크다운 데이터의 유실률 0%를 달성해야 합니다. 삼중 운영 가드레일 UI는 시스템 장애 발생 시 심리적 불안감을 해소하고 오프라인 보존 및 무다운타임 복구를 유저에게 시각적으로 안내하는 전략적 역할을 수행합니다.`

`[외부 API / 네트워크 / DB 상태 모니터링]`

       `│`

       `├─► [🟢 Green Armor]  5초 지연/오류 ──► 회로 OPEN ──► 상단 토스트 + IndexedDB PENDING_SYNC`

       `├─► [🟡 Yellow Armor] 원격 Config 차단 ──► Feature Flag ──► 안전 복구 Fallback 카드 우회 (30s TTL)`

       `└─► [🔵 Blue Armor]   8초 타임아웃 ──► Cancel Limit ──► '처방 재조제 중' + TIMEOUT_INDETERMINATE`

### **`삼중 가드레일 UI 스펙 상세`**

#### **`1) 🟢 그린 서킷 브레이커 & IndexedDB 대피소 UI`**

* **`동작 조건:`** `AI API 통신 지연이 5초(5000ms)를 초과하거나 네트워크 50x 에러가 연속 3회(failureThreshold: 3) 발생하여 ApiCircuitBreaker 회로가 OPEN 상태로 전환될 때 작동.`  
* **`상단 토스트 알림:`** `화면 상단에 🟢 그린 톤의 알림 메시지("오프라인 대피소 모드 - 안전 보존 중", role="alert")를 노출.`  
* **`IndexedDB 대피소 상세 스펙:`**  
  * **`Database Name:`** `DidItEmergencyShelter`  
  * **`Object Store:`** `markdown_backups`  
  * `사용자의 텍스트 원문이 비동기 대피 적재되며, 카드 우측 상단에 PENDING_SYNC 동기화 대기 배지가 박제됨.`  
* **`백그라운드 재동기화 프로그레스 바:`** `네트워크 복구 시 백그라운드 동기화 스트림의 진행 상태를 파스텔 프로그레스 바 UI로 노출하며, 완료 시 대피소 캐시 삭제와 함께 "안전하게 서버 동기화 완료" 안내로 전환.`

#### **`2) 🟡 옐로우 피처 플래그 핫픽스 UI`**

* **`동작 조건:`** `원격 Config 테이블(system_feature_flags) 스위치가 false로 전환될 때 발동.`  
* **`인메모리 캐시 및 TTL 스펙:`** `FeatureFlagEngine.ts는 30초 TTL 인메모리 캐시를 유지하며, 초긴급 상황 시 관리자 API를 통해 clearCache()를 호출하여 인메모리 스위치 메모리를 즉시 퍼지(Purge) 수행.`  
* **`안전 복구 화면 (Fallback Card) 및 우회 매트릭스:`**  
  * `enable-rina-parser: false 전환 시 리나 전용 컴포넌트를 격리하고 범용 mdStaticParser 대체 뷰로 우회.`  
  * `enable-phonics-hyphen-component: false 전환 시 음절 하이픈 기호를 공백으로 강제 변환하여 깨짐 없는 일반 플레인 텍스트 모드로 우회 출력.`

#### **`3) 🔵 블루 롤백 & 타임아웃 UI`**

* **`동작 조건:`** `DB 마이그레이션 및 AI 처방 적재 과정에서 8초(8000ms) 하드 타이머 커트오프가 발생하거나 프롬프트 배포 전환 시 작동.`  
* **`'처방 재조제 중' 스피너 모달:`** `8초 경과 시 블루 톤의 "처방 재조제 중..." 로딩 스피너 모달 개입.`  
* **`TIMEOUT_INDETERMINATE 상태 안내 캡션 (기술적 정밀성 반영):`** `원격 프로덕션 DB에 execute_safe_prescription_transaction RPC 기능이 미배포 상태이므로, 클라이언트 AbortSignal 전달만으로는 서버 측 DB 트랜잭션의 완전한 롤백을 보장할 수 없음. 이에 UI는 잘못된 롤백 확정 표현(TIMEOUT_ROLLED_BACK)을 지양하고, "처리 시간이 지연되고 있습니다. 이전 상태를 안전하게 보호 중입니다 (TIMEOUT_INDETERMINATE)" 캡션을 정확히 표시.`  
* **`프롬프트 블루/그린 스위칭 UI:`** `원격 system_routing_config의 active_color가 BLUE(v2.0)에서 GREEN(v2.1)으로 스위칭될 때, 페이지 새로고침 없이 정밀 처방 모드 변경 안내 배지가 교체 렌더링.`

### **`결론 및 전환`**

`완벽한 장애 보정 UI 가드레일 시스템에 이어, 시연 및 검증 환경을 원활하게 만드는 시연 전용 보조 인터페이스 명세로 넘어갑니다.`

## **`5. 시연 전용 UI 보조 기능 명세 (Demo Helper Interfaces)`**

### **`섹션 개요`**

`제품 시연(Demo) 및 기능 검증 과정에서 완벽주의 유저의 진입 장벽을 완전히 낮추고, 프론트엔드 액션에 따른 시스템의 실시간 반응성을 즉각적으로 입증하기 위해 시연 전용 보조 UI 기능을 제공합니다.`

### **`데모 보조 기능 Detailed Specs`**

#### **`1) 1클릭 Gemini API Key 자동 입력 버튼`**

* **`노출 조건 및 위치:`** `옐로우 피처 플래그 가동 시 또는 프로필 설정 모달 진입 시, API Key 입력 필드 우측에 노출.`  
* **`인터랙션 스펙:`** `버튼 클릭 시 시연용 유효 API Key 텍스트가 필드에 자동 채워지며, '즉시 연동 완료' 토글 스위치가 활성화되어 별도 키 발급 절차 없이 BYOK Pro 기능을 즉각 테스트 가능.`

#### **`2) 1초 데모 리셋 플로팅 UI`**

* **`노출 위치:`** `전체 화면 우측 하단 레이어에 고정(Fixed Position, z-index: 50).`  
* **`관리자 플로팅 인터랙션:`** `'시연 데모 1초 리셋' 버튼 클릭 시, 브라우저의 React Local State, sessionStorage, 그리고 IndexedDB 임시 스토어가 1초 만에 초기화(Purge)되며 초기 무장벽 데모 상태로 즉시 복귀.`

`+-----------------------------------------------------------------------------------+`

`| Dashboard Main View Layer                                                         |`

`|                                                                                   |`

`|                                                                                   |`

`|                                                      [ 🔄 시연 데모 1초 리셋 ]    |`

`+-----------------------------------------------------------------------------------+`

### **`종합 요약`**

`본 whatImSupposedto-Didit MVP UI 명세서는 완벽주의 유저의 인지적 부하를 극단적으로 낮추는 디자인 철학을 바탕으로 3-Panel 대시보드 레이아웃, 4단계 라이프사이클 권한, 페르소나별 맞춤 인터랙션, 삼중 운영 가드레일, 그리고 데모 보조 UI를 정밀하게 정의하였습니다. 이를 통해 사용자가 계획의 무게에서 벗어나 "오늘 단 한 번의 작은 실행"을 지속적으로 발견하고 구출해낼 수 있는 완벽한 무중단 프론트엔드 제품 경험을 제공합니다.`

# **`Design System & UI Component Specification: whatImSupposedto-Didit (MVP)`**

### **`1. Design Foundations & Design Tokens`**

#### **`1.1 Color Palette & Token Definitions`**

`The color architecture of whatImSupposedto-Didit is constructed to lower perfectionism-induced anxiety, accentuate local execution achievements, and provide clear operational feedback across micro-frontend boundaries.`

| `Token Name` | `Role / Semantic Purpose` | `Hex Code / Value` | `UI Application` |
| :---- | :---- | :---- | :---- |
| `color-brand-primary-base` | `Primary Brand Accent` | `#7C3AED` | `Primary call-to-action buttons, active state indicators, perfectionism rescue highlights` |
| `color-brand-primary-light` | `Primary Brand Highlight` | `#8B5CF6` | `Purple KPI badges, hover state overlays, achievement accents` |
| `color-accent-circuit-green` | `Local Safety & Circuit Breaker` | `#10B981` | `Green Circuit Breaker status badges, IndexedDB safety shelter notifications, sensory cue cards` |
| `color-accent-emergency-yellow` | `Emergency Bypass & Feature Flag` | `#F59E0B` | `Hotfix alerts, emergency bypass mode indicators, rule-based fallback views` |
| `color-neutral-bg-dark` | `Base Dark Background` | `#0F172A` | `Primary layout container background in dark theme` |
| `color-neutral-surface-dark` | `Surface Container (Dark)` | `#1E293B` | `Micro-frontend card backgrounds, panel containers in dark theme` |
| `color-neutral-surface-light` | `Surface Container (Light)` | `#F8FAFC` | `Primary viewport background, light panel surfaces` |
| `color-text-high-contrast-dark` | `High-Contrast Text (Dark)` | `#F8FAFC` | `Primary headings, interactive inputs, and high-emphasis body text on dark surfaces` |
| `color-text-high-contrast-light` | `High-Contrast Text (Light)` | `#0F172A` | `Primary headings and high-emphasis text on light surfaces` |

##### **`Design Token Architecture & Style Dictionary Hierarchy`**

`To maintain micro-frontend isolation and support zero-runtime multi-theme toggling, base values map to semantic variables using a nested taxonomy compliant with Style Dictionary specifications (token.color.[category].[concept].[variant]):`

`{`

  `"token": {`

    `"color": {`

      `"brand": {`

        `"primary": {`

          `"base": { "value": "#7C3AED" },`

          `"light": { "value": "#8B5CF6" }`

        `}`

      `},`

      `"semantic": {`

        `"surface": {`

          `"primary": {`

            `"dark": { "value": "{token.color.neutral.surface.dark.value}" },`

            `"light": { "value": "{token.color.neutral.surface.light.value}" }`

          `}`

        `},`

        `"text": {`

          `"primary": {`

            `"dark": { "value": "{token.color.text.high-contrast.dark.value}" },`

            `"light": { "value": "{token.color.text.high-contrast.light.value}" }`

          `}`

        `}`

      `}`

    `}`

  `}`

`}`

##### **`CSS Variable Dynamic Mapping (Theme Engine)`**

`:root[data-theme="dark"] {`

  `--color-brand-primary-base: #7C3AED;`

  `--color-brand-primary-light: #8B5CF6;`

  `--color-surface-primary: #1E293B;`

  `--color-surface-background: #0F172A;`

  `--color-text-primary: #F8FAFC;`

  `--color-text-muted: #94A3B8;`

  `--color-border-accent: #334155;`

  `--color-status-green: #10B981;`

  `--color-status-yellow: #F59E0B;`

`}`

`:root[data-theme="light"] {`

  `--color-brand-primary-base: #7C3AED;`

  `--color-brand-primary-light: #8B5CF6;`

  `--color-surface-primary: #FFFFFF;`

  `--color-surface-background: #F8FAFC;`

  `--color-text-primary: #0F172A;`

  `--color-text-muted: #64748B;`

  `--color-border-accent: #E2E8F0;`

  `--color-status-green: #10B981;`

  `--color-status-yellow: #F59E0B;`

`}`

#### **`1.2 Typography System & Hierarchy`**

`The typography hierarchy minimizes visual complexity during live interactive demonstrations through high scannability and clear semantic weight distribution.`

* **`Heading Styles`**`:`  
  * **`Heading 1 (font-h1)`**`: clamp(1.75rem, 4vw, 2rem) (28px–32px) / Line Height 1.2 / Weight 700. Applied exclusively to high-level page headers and core value statements ("완벽하게 하지 않아도, 시작한 건 사라지지 않으니까.").`  
  * **`Heading 2 (font-h2)`**`: 1.5rem (24px) / Line Height 1.3 / Weight 600. Applied to major dashboard section headers and dynamic panel titles.`  
  * **`Heading 3 (font-h3)`**`: 1.125rem (18px) / Line Height 1.4 / Weight 600. Applied to sub-panel header blocks, step titles, and card headers.`  
* **`Body Copy`**`:`  
  * **`Body Bold (font-body-bold)`**`: 0.875rem–1rem (14px–16px) / Line Height 1.5 / Weight 700. Used for active user goal inputs, execution signal highlights, and key prompt statements.`  
  * **`Body Regular (font-body-regular)`**`: 0.875rem–1rem (14px–16px) / Line Height 1.5 / Weight 400. Used for instructional captions, body paragraphs, and secondary labels.`  
* **`Specialized Formatting`**`:`  
  * **`Monospace (font-mono)`**`: 0.8125rem–0.875rem (13px–14px) / Line Height 1.4 / Font Family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace. Dedicated font spec for raw Markdown parsing displays, payload logs, and keyword match criteria.`  
  * **`Blockquote (font-blockquote)`**`: 0.9375rem (15px) / Line Height 1.6 / Weight 400 / Italicized with a 3pxsolid left border (--color-brand-primary-base). Dedicated visual treatment for rendering raw user goal text ("내가 하려던 것") and historical chat entries.`

#### **`1.3 3-Panel Responsive Dashboard Layout & Grid System`**

`The operational view relies on an isolated 3-panel micro-frontend architecture structured around container queries and client-side event loops to eliminate cross-panel rendering latency.`

`+---------------------------------------------------------------------------------------------------+`

`|                            3-PANEL RESPONSIVE DASHBOARD LAYOUT                                    |`

`+------------------------------------+--------------------------------+-----------------------------+`

`| LEFT PANEL (3 Cols)                | CENTER PANEL (6 Cols)          | RIGHT PANEL (3 Cols)        |`

`| Container Query: @container (left) | Container Query: @container (center) | Container Query: @container (right) |`

`|                                    |                                |                             |`

`| • Check-in Input Area              | • AI 4-Step Prescription Card  | • Purple KPI Metrics        |`

`| • Dual Inputs:                     |   01 내가 원한 것               | • Achievement Counters      |`

`|   - "내가 하려던 것"               |   02 조금 더 쉽게              | • Peer Steal Board          |`

`|   - "실제로 해본 것"               |   03 지금 할 수 있는 치트키    |   (Community Cards e.g. Sara) |`

`| • Browser Execution Notice         |   04 시작 소리                 | • Single-Pass Completion    |`

`|                                    | • Action Plan Checkbox List    |   Badge Triggers            |`

`+------------------------------------+--------------------------------+-----------------------------+`

##### **`Micro-Frontend Communication Architecture`**

`Panels operate as isolated web components or independent micro-frontend mounts. State synchronizes locally via a browser-native custom event bus (CustomEvent) and IndexedDB state listeners, bypassing external network hops:`

`// Inter-panel local custom event bus emission`

`window.dispatchEvent(`

  `new CustomEvent('didit:kpi-update', {`

    `detail: { keywordMatched: true, signalScore: 100, timestamp: Date.now() }`

  `})`

`);`

##### **`Grid Layout Properties & Container Queries`**

* **`Layout Container`**`: 12-column dynamic CSS Grid with gap-6 (24px padding/gap) and centered constraint (max-width: 1440px).`  
* **`Left Panel (Input & Parsing Area)`**`: Spans 3 columns (minmax(300px, 1fr)). Features client-side check-in tools, dual goal/log inputs, and privacy compliance disclosures.`  
* **`Center Panel (Prescription & Timeline)`**`: Spans 6 columns (minmax(480px, 2fr)). Hosts the AI 4-Step Prescription generation output, interactive step checklist, and execution signal visualizer.`  
* **`Right Panel (KPI & Community Board)`**`: Spans 3 columns (minmax(300px, 1fr)). Contains the Purple KPI rescue badge system, local achievement counters, and the Peer Steal community board.`

##### **`Responsive Breakpoints & Viewport Rules`**

* **`Desktop Viewport (> 1024px)`**`: Full 3-panel grid rendered concurrently in a single horizontal layout.`  
* **`Tablet Viewport (768px - 1024px)`**`: The Left and Right panels collapse into slide-out drawer sheets accessible via sticky action triggers. The Center Panel occupies 100% of the active container layout.`  
* **`Mobile Viewport (< 768px)`**`: Single-column stacked viewport. Viewport transitions between Check-In Input, AI Prescription, and KPI / Peer Steal sections are managed via a sticky bottom navigation tab bar (Input, Prescription, KPI & Peer).`

### **`2. Core UI Component Specifications`**

#### **`2.1 AI 4-Step Prescription Card Component`**

`The core AI Prescription Card decomposes overwhelming user goals into low-friction actions using the exact 4-step framework from the underlying system specifications, supplemented by an interactive checklist.`

`+-----------------------------------------------------------------------+`

`|  AI 4-Step Prescription Card Component                                |`

`+-----------------------------------------------------------------------+`

`|  01 내가 원한 것 (Original Text)                                      |`

`|  > Background: var(--color-surface-primary) | Border: 3px Primary     |`

`+-----------------------------------------------------------------------+`

`|  02 조금 더 쉽게 (Easier Step)                                        |`

`|  > Background: var(--color-surface-background)                        |`

`+-----------------------------------------------------------------------+`

`|  03 지금 할 수 있는 치트키 (5yo Cheat Code)                           |`

`|  > Background: var(--color-brand-primary-base) | Text: #FFFFFF        |`

`+-----------------------------------------------------------------------+`

`|  04 시작 소리 (Sensory Cue)                                           |`

`|  > Background: rgba(16, 185, 129, 0.15) | Border: 1px Green           |`

`+-----------------------------------------------------------------------+`

`|  ACTION PLAN STEP-BY-STEP (Interactive Checklist)                     |`

`|  [ ] 1분만 영단어 및 회화 문장 소리 내어 읽기                        |`

`|  [X] 포기하지 않고 톡-투-미-나우! 세 번 외치기                       |`

`+-----------------------------------------------------------------------+`

`| ▣ 이 분석은 브라우저에서만 실행돼요. 입력한 내용은 저장되지 않습니다. |`

`| 성취 신호는 저장소의 키워드 기반 KPI 판정 규칙을 사용합니다.          |`

`+-----------------------------------------------------------------------+`

##### **`React/TypeScript Interface Specification`**

`export interface ActionItem {`

  `id: string;`

  `label: string;`

  `completed: boolean;`

`}`

`export interface AI4StepPrescriptionCardProps {`

  `originalGoal: string;        // Step 01: "내가 원한 것"`

  `easierStep: string;          // Step 02: "조금 더 쉽게"`

  `cheatCode: string;           // Step 03: "지금 할 수 있는 치트키"`

  `sensoryCue: string;          // Step 04: "시작 소리"`

  `actionPlan: ActionItem[];    // Step-by-Step Interactive Checkbox List`

  `isLoading?: boolean;`

  `isDisabled?: boolean;`

  `onItemToggle: (id: string, completed: boolean) => void;`

`}`

##### **`Step Specifications & Styling Mappings`**

1. **`Step 01: Original Text (01 내가 원한 것)`**`:`  
   * **`Styling`**`: Background var(--color-surface-primary), muted text tone, left border accent 3px solid var(--color-brand-primary-base).`  
   * **`Behavior`**`: Renders exact verbatim input supplied by user ("매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기").`  
2. **`Step 02: Easier Step (02 조금 더 쉽게)`**`:`  
   * **`Styling`**`: Background var(--color-surface-background) with a subtle neutral border.`  
   * **`Behavior`**`: Strips perfectionist constraints to present a minimal baseline target ("“매일 영어 회화 한 문장 외우고 뱉기”을 한 번만 해봐요.").`  
3. **`Step 03: 5yo Cheat Code (03 지금 할 수 있는 치트키)`**`:`  
   * **`Styling`**`: High-contrast container rendered in var(--color-brand-primary-base) (#7C3AED) with crisp high-contrast white text (#F8FAFC) and extra-large typography (1.25rem / bold).`  
   * **`Behavior`**`: Focuses immediate physical initiation down to a 1-minute window ("지금 “매일 영어 회화 한 문장 외우고 뱉기”을 완벽하지 않아도 1분만 시작해요.").`  
4. **`Step 04: Sensory Cue (04 시작 소리)`**`:`  
   * **`Styling`**`: Soft Green/Teal highlight card with rgba(16, 185, 129, 0.15) fill and 1px solid #10B981border.`  
   * **`Behavior`**`: Displays phonetic/auditory triggers ("시-작-해-보자") to bridge intent and physical action.`  
5. **`Action Plan Checklist & Execution Signal Integration`**`:`  
   * **`Styling`**`: Interactive Markdown-rendered checkbox list ([ ] / [X]).`  
   * **`Execution Signal Logic`**`: Checking off an item immediately updates local client state, increments the 시도 신호 counter to 100%, updates local IndexedDB flags, and dispatches an event to display the Purple KPI Achievement Rescue Badge.`  
6. **`Embedded Privacy Compliance Notice`**`:`  
   * **`Mandatory Footer Text`**`: Renders verbatim source compliance disclaimers:`

*`"▣ 이 분석은 브라우저에서만 실행돼요. 입력한 내용은 저장되지 않습니다."`* `"성취 신호는 저장소의 키워드 기반 KPI 판정 규칙을 사용합니다."`

##### **`Interactive Component States & Accessibility (a11y) Specs`**

* **`Default State`**`: Standard render with dynamic CSS variables.`  
* **`Loading / Skeleton State`**`: Renders animated gray shimmer block (bg-slate-700/20 animate-pulse) across steps while prescription generates. Accessibility: aria-busy="true", aria-live="polite".`  
* **`Hover State`**`: Step cards apply transform: translateY(-1px) with subtle elevation shadow (box-shadow: 0 4px 12px rgba(0,0,0,0.15)).`  
* **`Active / Pressed State`**`: Action Plan checkboxes render scales down to 0.96 scale factor upon mouse/touch down.`  
* **`Disabled State`**`: Opacity reduced to 0.5, pointer-events: none, checkboxes blocked from toggle.`  
* **`Focus-Visible State`**`: Keyboard focus applies explicit multi-ring indicator outline: 2px solid #8B5CF6; outline-offset: 2px.`

#### **`2.2 Purple KPI Achievement Rescue Badge Component`**

`A reactive visual feedback badge triggered during local client-side execution logs parsing.`

* **`Trigger Evaluation Engine`**`: Client-side regex engine evaluates user execution logs ("실제로 해본 것") against stored key-based KPI evaluation rules looking for completion keywords (e.g., "완료", "했음", "간신히 외웠어요", "읽었습니다").`  
* **`Visual Output`**`: Pop-up floating badge styled in var(--color-brand-primary-light) (#8B5CF6) with bold high-contrast text displaying verbatim text:`

`"성취 구출 성공!💜"`

* **`Accessibility Specification`**`: Formatted with role="status" and aria-live="polite" so screen readers immediately announce the achievement event without interrupting user input focus.`  
* **`State Persistence Rules`**`: Saved locally to browser IndexedDB storage without external server round-trips.`

#### **`2.3 Peer Steal Card Component`**

`A micro-frontend community sharing card that empowers users to adopt and clone validated prescription patterns created by peer members.`

`export interface PeerStealCardProps {`

  `cardId: string;`

  `authorName: string;          // Explicitly supports community members (e.g., "Sara")`

  `originalGoal: string;`

  `cheatCode: string;`

  `stealCount: number;`

  `isStolen?: boolean;`

  `onStealAction: (cardId: string) => void;`

`}`

* **`Community Context & Attribution`**`: Card header explicitly attributes community origin (e.g., "Shared by Sara"/ "Stolen from Sara").`  
* **`Action Element`**`: Features a high-visibility "1-Click Steal" (스틸) button styled with var(--color-brand-primary-base).`  
* **`Cloned State Visual Indicator`**`: Upon triggering the steal action, the card updates with a distinct visual badge tag ("Duplicate / Cloned" / "내 서재에 복사됨") and inserts a copy into the user's local Center Panel timeline.`  
* **`Micro-Frontend Interactive States`**`:`  
  * *`Default`*`: Clear visual hierarchy showing author attribution, original goal, and cheat code preview.`  
  * *`Hover`*`: Button background transitions from #7C3AED to #8B5CF6.`  
  * *`Active/Stolen`*`: Button changes text to "스틸 완료!", background transitions to muted gray (#334155), and button enters disabled state.`

### **`3. User Lifecycle States & Demo UI Components`**

#### **`3.1 4-Stage User Lifecycle Matrix`**

`The dashboard dynamically adjusts its interface features, authentication displays, and API routing logic across four distinct user lifecycle tiers:`

| `User Lifecycle Tier` | `Authentication & Key Management` | `Quota & Execution Rules` | `Key UI Layout Adaptations` |
| :---- | :---- | :---- | :---- |
| **`Stage 1: Guest Tier`** | `Unauthenticated (No login required)` | `Static rule-based demo template engine; 0 server API cost` | `Displays prominent top zero-barrier header banner: "1초 만에 예시 체험". Client-only local parsing view that executes purely inside the browser.` |
| **`Stage 2: Free Tier`** | `Authenticated via Google OAuth` | `3 AI prescription generations per week (Server-backed Gemini API)` | `Top utility bar displays Google OAuth profile chip alongside a visible progress bar component tracking remaining weekly quota (3 / 3 remaining).` |
| **`Stage 3: Quota Exceeded Tier`** | `Authenticated via Google OAuth` | `0 AI prescription generations remaining for current week` | `Interactive AI triggers transition to disabled state; card displays fallback alert modal with options to wait for weekly reset or upgrade key mode. Generates local rule-based fallback templates ("데모용 템플릿").` |
| **`Stage 4: Pro Tier (BYOK)`** | `Authenticated + Custom Gemini Key` | `Unlimited AI Prescriptions (Bring Your Own Key architecture)` | `Unlocks profile modal for entering a custom "Google Gemini API Key". Displays persistent top badge tag: "Unlimited AI Prescription".` |

#### **`3.2 Live Demonstration Helper UI Controls`**

`To ensure smooth live presentations and fail-safe public demonstrations, the system includes floating control overlays for administrative presenters:`

* **`Auto-Fill Control`**`: Floating Action Button (FAB) or administrator drawer action executing "Gemini API Key 1-Click Auto-Fill". Instantly populates required API key state variables from local environment keys without manual keystrokes.`  
* **`Reset Control`**`: Administrative trigger button executing "1-Second Demo Session Reset". Purges browser IndexedDB tables, resets session state, clears local storage caches, and restores default check-in values ("매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기") in under 1 second without forcing a browser refresh.`

### **`4. Safety Guardrail & Error Recovery UI Components`**

#### **`4.1 🟢 Green Circuit Breaker Toast & Sync View`**

`Activates automatically when network connectivity degrades or the application operates in an offline-first state.`

`+-----------------------------------------------------------------------+`

`| 🟢 [IndexedDB 안전 대피소 작동 중]               [Data Syncing: 85%]  |`

`| Local data buffered safely in browser storage. Re-syncing in background... |`

`+-----------------------------------------------------------------------+`

* **`UI Alert Specification`**`: Top-anchored persistent toast notification styled with Emerald Green (#10B981) status borders and icons displaying verbatim string:`

`"IndexedDB 안전 대피소 작동 중" (IndexedDB Safety Shelter Active)`

* **`Sync View Interface`**`: Renders an active data synchronization progress bar component showing local input buffering and background queue processing.`  
* **`Accessibility Specs`**`: Includes role="status" and aria-live="polite" attributes.`

#### **`4.2 🟡 Yellow Feature Flag Emergency View`**

`Fallback card UI deployed automatically during upstream API latency spikes, model rate-limiting, or emergency hotfix deployments.`

* **`UI Alert Specification`**`: Card container bordered with Emergency Yellow (#F59E0B) accents and alert indicators.`  
* **`Fallback Card Layout`**`: Replaces live LLM generation outputs with the standardized "Safety Bypass Recovery View" (안전 우회 복구 뷰).`  
* **`Deterministic Engine Routing`**`: Switches execution instantly to local rule-based template prescription logic ("처방 문구는 AI 생성이 아닌 데모용 템플릿입니다.") to ensure uninterrupted user service.`

#### **`4.3 🔵 Blue Rollback Timeout Spinner`**

`Handles execution timeouts gracefully when AI response generation latencies exceed defined threshold limits.`

* **`Trigger Threshold`**`: Fires when AI response generation reaches an exact 8-second execution timeout limit.`  
* **`UI Visual Indicator`**`: Centered indeterminate loading spinner rendered in primary brand purple/blue accents accompanied by status text:`

`"처방 재조제 중" (Re-dispensing prescription...)`

* **`System Rollback Action`**`: Silently executes zero-downtime background prompt rerouting to a secondary model endpoint or deterministic fallback template without interrupting the user session or losing entered inputs.`  
* **`Accessibility Specs`**`: Configured with aria-live="polite" and aria-busy="true".`

# **`UI Implementation Specification for whatImSupposedto-Didit MVP`**

### **`1. Technology Stack & Architectural Overview`**

#### **`1.1 Core Technology Stack`**

`The frontend architecture for the whatImSupposedto-Didit MVP is engineered on a modern, strictly typed React ecosystem optimized for zero-latency client-side parsing, dynamic state management, and resilient offline/fallback states.`

| `Technology / Library` | `Version / Module` | `Target Application / Usage` |
| :---- | :---- | :---- |
| **`React 18`** | `^18.2.0` | `Core declarative framework, state orchestration, functional components, custom hooks, and concurrent UI rendering.` |
| **`TypeScript`** | `^5.0.0` | `Strict static contract enforcement, explicit interface definitions, prop validation, and API payload safety.` |
| **`Tailwind CSS`** | `^3.3.0` | `Utility-first layout construction, panel grid system, dynamic state styling, and responsive layout design.` |
| **`Framer Motion`** | `^10.16.0` | `Micro-interactions, KPI badge popups, staggered list entries, and smooth transition physics.` |
| **`Lucide Icons`** | `^0.284.0` | `System iconography, directional indicators, action buttons, and visual state triggers.` |

#### **`1.2 Directory Schema & Component Hierarchy`**

`To ensure strict separation of concerns, the frontend application follows a domain-driven component organization under src/components/:`

`src/components/`

`├── layout/`

`│   ├── MainDashboardLayout.tsx`

`│   ├── NavigationHeader.tsx`

`│   └── PanelGrid.tsx`

`├── prescription/`

`│   ├── MarkdownSourcePanel.tsx`

`│   ├── PrescriptionPanel.tsx`

`│   ├── OriginalTextQuote.tsx`

`│   ├── CheatCodeBox.tsx`

`│   ├── SensoryCueCard.tsx`

`│   └── ActionPlanInteractiveList.tsx`

`├── kpi/`

`│   ├── CommunityKpiPanel.tsx`

`│   ├── PurpleKpiBadge.tsx`

`│   └── PeerStealCard.tsx`

`├── auth/`

`│   ├── UserProfileChip.tsx`

`│   ├── WeeklyQuotaProgressBar.tsx`

`│   └── GeminiKeyModal.tsx`

`├── guardrails/`

`│   ├── GreenShelterToast.tsx`

`│   ├── YellowFallbackCard.tsx`

`│   └── BlueRollbackSpinner.tsx`

`└── demo/`

    `└── DemoHelperFab.tsx`

##### **`Architectural Component Partitioning Rules:`**

* `layout/: Structural containers enforcing 3-panel dynamic grids, responsive breakpoints, and top-level navigation headers.`  
* `prescription/: Client-side text entry, static parsers, BYOK AI prescription engines, and structured 4-tier execution cards.`  
* `kpi/: Real-time attempt metrics, rule-based completion badges, and 1-click peer goal cloning widgets.`  
* `auth/: Multi-stage user identity states (Guest, Free, Pro, Canceled), quota progress monitors, and client-side BYOK key management modals.`  
* `guardrails/: System resilience components including offline sync toasts, feature flag emergency fallbacks, and timeout rollback mechanisms.`  
* `demo/: Floating action controls for rapid testing resets, automated API key injections, and state hydration.`

### **`2. 3-Panel Dashboard Component & State Binding Specifications`**

#### **`2.1 Left Panel: MarkdownSourcePanel`**

`The MarkdownSourcePanel serves as the primary input workspace where users capture raw goal intentions and daily execution logs.`

##### **`TypeScript Interface Definition:`**

`export interface GoalPreset {`

  `id: string;`

  `label: string;`

  `goalText: string;`

  `logText: string;`

`}`

`export interface MarkdownSourcePanelProps {`

  `initialGoalText?: string;`

  `initialLogText?: string;`

  `onParseExecute: (parsedGoal: string, parsedLog: string) => void;`

  `isProcessing: boolean;`

`}`

##### **`Component State Hooks & Data Flow:`**

* `goalInput (useState<string>): Initializes with default or preset goal text ("매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기").`  
* `logInput (useState<string>): Stores actual raw user execution record ("오늘 영단어랑 회화 한 문장 간신히 외웠어요. 완벽하게 안 외워져서 힘들었지만 포기할 뻔한 걸 넘겼어요. 그래도 완전히 놓지 않고 소리 내서 크게 세 번 읽었습니다. 톡-투-미-나우!").`  
* `selectedPreset (useState<string | null>): Tracks active preset selection.`  
* **`Preset Selector Data Flow`**`: Selecting a preset updates both goalInput and logInput simultaneously via constant dictionary mappings:`

`const PRESET_DICTIONARY: Record<string, GoalPreset> = {`

  `preset_01: {`

    `id: "preset_01",`

    `label: "01 내가 하려던 것",`

    `goalText: "매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기",`

    `logText: "오늘 영단어랑 회화 한 문장 간신히 외웠어요. 완벽하게 안 외워져서 힘들었지만 포기할 뻔한 걸 넘겼어요. 그래도 완전히 놓지 않고 소리 내서 크게 세 번 읽었습니다. 톡-투-미-나우!"`

  `}`

`};`

`const handleSelectPreset = (presetId: string) => {`

  `const target = PRESET_DICTIONARY[presetId];`

  `if (target) {`

    `setSelectedPreset(presetId);`

    `setGoalInput(target.goalText);`

    `setLogInput(target.logText);`

  `}`

`};`

##### **`Primary Parsing CTA Button Specification:`**

* **`Caption Sub-Text`**`: "완벽함 대신, 시도한 순간을 찾아요"`  
* **`Main Button Text`**`: "오늘의 작은 성취 찾기 →"`  
* **`Tailwind CSS`**`: w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-between`  
* **`Interaction Logic`**`: Button is disabled when isProcessing === true or when both inputs are empty. Clicking invokes onParseExecute(goalInput, logInput).`

##### **`Parser & Notice Render Rules:`**

* **`Parser Integration`**`: Invokes mdStaticParser and scriptSplitter to isolate execution signals directly in browser memory.`  
* **`Browser Privacy & Technical Disclaimer Footers`**`:`  
  * `Primary Notice: "이 분석은 브라우저에서만 실행돼요. 입력한 내용은 저장되지 않습니다."`  
  * `Companion Disclaimer: "성취 신호는 저장소의 키워드 기반 KPI 판정 규칙을 사용합니다. 처방 문구는 AI 생성이 아닌 데모용 템플릿입니다."`

#### **`2.2 Center Panel: PrescriptionPanel & AI 4-Tier Cards`**

`The PrescriptionPanel orchestrates the breakdown of raw logs into an actionable, low-friction execution path using a 4-tier card structure.`

`+-----------------------------------------------------------------------+`

`| PrescriptionPanel                                                     |`

`| +-------------------------------------------------------------------+ |`

`| | OriginalTextQuote                                                 | |`

`| +-------------------------------------------------------------------+ |`

`| | CheatCodeBox ("A Gentler Plan" / "목표를 가볍게 바꿔보기")             | |`

`| +-------------------------------------------------------------------+ |`

`| | SensoryCueCard                                                    | |`

`| +-------------------------------------------------------------------+ |`

`| | ActionPlanInteractiveList ("시도 신호 100%")                        | |`

`| +-------------------------------------------------------------------+ |`

`+-----------------------------------------------------------------------+`

##### **`1. OriginalTextQuote Component`**

* **`TypeScript Contract`**`:`

`export interface OriginalTextQuoteProps {`

  `rawQuote: string;`

  `targetKeyword: string;`

  `matchConfirmed: boolean;`

`}`

* **`Tailwind Styling`**`: bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-lg text-slate-700 font-medium leading-relaxed`  
* **`Framer Motion Props`**`: initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}`  
* **`Render Text`**`: Renders the complete, untruncated user execution log:`

`"오늘 영단어랑 회화 한 문장 간신히 외웠어요. 완벽하게 안 외워져서 힘들었지만 포기할 뻔한 걸 넘겼어요. 그래도 완전히 놓지 않고 소리 내서 크게 세 번 읽었습니다. 톡-투-미-나우!"`

* **`Keyword Match Sub-Badge`**`: Displays 목표 키워드 [매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기] 일치 확인.`

##### **`2. CheatCodeBox Component`**

* **`TypeScript Contract`**`:`

`export interface CheatCodeBoxProps {`

  `originalGoal: string;`

  `gentlerPlanText: string;`

  `cheatCodeAction: string;`

  `startSound: string;`

  `isDemoTemplate?: boolean;`

`}`

* **`Tailwind Styling`**`: bg-emerald-50/60 border border-emerald-200 p-5 rounded-xl space-y-4 shadow-sm`  
* **`Framer Motion Props`**`: initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}`  
* **`Render Structure ("A Gentler Plan" / "목표를 가볍게 바꿔보기")`**`:`  
  * `01 내가 원한 것: "매일 영어 회화 한 문장 완벽하게 외우고 원어민처럼 뱉기"`  
  * `02 조금 더 쉽게: “매일 영어 회화 한 문장 외우고 뱉기”을 한 번만 해봐요.`  
  * `03 지금 할 수 있는 치트키: 지금 “매일 영어 회화 한 문장 외우고 뱉기”을 완벽하지 않아도 1분만 시작해요.`  
  * `04 시작 소리: 시-작-해-보자`

##### **`3. SensoryCueCard Component`**

* **`TypeScript Contract`**`:`

`export interface SensoryCueCardProps {`

  `audioTriggerText: string;`

  `visualSignalLabel: string;`

  `isActive: boolean;`

  `onTriggerCue: () => void;`

`}`

* **`Tailwind Styling`**`: flex items-center justify-between p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl shadow-sm`  
* **`Framer Motion Props`**`: whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}`  
* **`Render Logic`**`: Visual and auditory cue trigger for instant execution without cognitive friction.`

##### **`4. ActionPlanInteractiveList Component`**

* **`TypeScript Contract`**`:`

`export interface ActionPlanItem {`

  `id: string;`

  `label: string;`

  `isCompleted: boolean;`

`}`

`export interface ActionPlanInteractiveListProps {`

  `items: ActionPlanItem[];`

  `attemptRatioPercentage: number;`

  `detectedCount: number;`

  `totalLoggedCount: number;`

  `additionalSignalCount: number;`

  `onToggleItem: (id: string) => void;`

`}`

* **`Tailwind Styling`**`: bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3`  
* **`Framer Motion Variant`**`:`

`const listContainerVariants = {`

  `hidden: { opacity: 0 },`

  `visible: {`

    `opacity: 1,`

    `transition: { staggerChildren: 0.05, delayChildren: 0.1 }`

  `}`

`};`

* **`Render Metrics`**`: Renders attempt metric headers and secondary detection finding:`  
  * `Primary Header: 시도 신호 100%`  
  * `Metric Details: 기록한 2개 문장 중 2개에서 발견했어요`  
  * `Secondary Metric Finding: 그리고 1개의 시도도 더 발견했어요.`

#### **`2.3 Right Panel: CommunityKpiPanel & Interaction Handlers`**

`The CommunityKpiPanel tracks progress metrics, triggers achievement popups, and allows copying goals from peers.`

##### **`State Flow & Event Signatures:`**

1. **`Goal Achievement Handling`**`:`

`const handleGoalAchieved = (goalId: string, matchedKeywords: string[]): void => {`

  `if (matchedKeywords.length > 0) {`

    `setIsAchieved(true);`

    `triggerKpiBadgeAnimation(goalId);`

  `}`

`};`

1. **`PurpleKpiBadge Pop-up Component`**`:`  
   * **`Render Rule`**`: Mounts dynamically when isAchieved === true.`  
   * **`Framer Motion Implementation`**`:`

`<motion.div`

  `initial={{ scale: 0.3, rotate: -12, opacity: 0 }}`

  `animate={{ scale: 1, rotate: 0, opacity: 1 }}`

  `exit={{ scale: 0.8, opacity: 0 }}`

  `transition={{ type: "spring", stiffness: 300, damping: 22 }}`

  `className="bg-purple-600 text-white font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 w-fit"`

`>`

  `<Award className="w-5 h-5 text-amber-300" />`

  `<span>작은 시도, 해냈어요</span>`

`</motion.div>`

1. **`PeerStealCard ("동료 표현 스틸 카드")`**`:`  
   * **`TypeScript Contract`**`:`

`export interface PeerStealCardProps {`

  `peerId: string;`

  `peerGoalText: string;`

  `peerActionText: string;`

  `onCloneGoal: (clonedGoalText: string) => void;`

`}`

* **`1-Click Clone Signature & Workflow`**`:`

`const handleCloneClick = (peerGoalText: string): void => {`

  `onCloneGoal(peerGoalText);`

  `showToastNotification("동료의 목표를 Workspace로 가져왔습니다!");`

`};`

* **`Execution Sequence`**`:`  
  1. `User clicks "스틸하기 / 가져오기" button.`  
  2. `handleCloneClick intercepts peerGoalText.`  
  3. `Invokes onCloneGoal, injecting peerGoalText directly into MarkdownSourcePanel's goalInput state.`  
  4. `Triggers feedback toast in the KPI panel view.`

### **`3. 4-Stage User Lifecycle & Authentication Components`**

#### **`3.1 Guest Stage Implementation`**

`Provides zero-barrier immediate interactions managed via a localized Zustand store.`

##### **`Store Interface & State Contract (useGuestStore):`**

`export interface GuestState {`

  `isGuest: boolean;`

  `sessionId: string;`

  `localPrescriptions: Array<{ id: string; goal: string; createdAt: string }>;`

  `setGuestSession: (sessionId: string) => void;`

  `clearGuestSession: () => void;`

  `setLocalPrescription: (prescription: { id: string; goal: string; createdAt: string }) => void;`

`}`

`export const useGuestStore = create<GuestState>((set) => ({`

  `isGuest: true,`

  ``sessionId: `guest_${Date.now()}`,``

  `localPrescriptions: [],`

  `setGuestSession: (id) => set({ isGuest: true, sessionId: id }),`

  `clearGuestSession: () => set({ isGuest: false, sessionId: "", localPrescriptions: [] }),`

  `setLocalPrescription: (item) =>`

    `set((state) => ({ localPrescriptions: [...state.localPrescriptions, item] }))`

`}));`

* **`Persistence Policy`**`: Store memory bounded strictly to sessionStorage or volatile RAM. Closing the browser tab purges all guest session logs.`  
* **`UI Banner Callouts`**`:`  
  * **`Quick Trial Banner`**`: "↗ 예시로 바로 체험" button in top header area to instantly populate inputs.`  
  * **`Footer Callout`**`: "▣ 데모 세션 · 입력한 내용은 저장되지 않아요" banner displayed across all active panel footers.`

#### **`3.2 Free Tier Stage Implementation`**

`Authenticated stage using Google OAuth, capped by a weekly generation usage counter.`

* **`Components`**`:`  
  * `UserProfileChip: Displays Google user avatar, display name, and tag ("Free").`  
  * `WeeklyQuotaProgressBar: Tracks remaining free AI generation quotas for the current 7-day rolling period.`

##### **`User Action & Quota State Transitions:`**

| `User Action` | `UI Response & Quota State` |
| :---- | :---- |
| **`OAuth Login Completed`** | `UserProfileChip mounts. Free quota initialized to 3/3 generations remaining.` |
| **`Executes AI Generation (Quota > 0)`** | `Decrements quota by 1. WeeklyQuotaProgressBar animates width change (2/3 remaining).` |
| **`Executes Generation (Quota == 0)`** | `Blocks API request. Disables execution button and triggers GeminiKeyModal prompt.` |

#### **`3.3 Pro Tier (BYOK) Stage Implementation`**

`Unlocks unlimited generation capacity by enabling users to store their own Google Gemini API key locally.`

##### **`GeminiKeyModal Specifications:`**

* **`Input Fields`**`: Password-masked input field with visibility toggle icon (Eye / EyeOff) and validation status enum ('IDLE' | 'VALIDATING' | 'VALID' | 'INVALID').`  
* **`Client Validation Flow`**`: Submits a ping payload to https://generativelanguage.googleapis.com/v1beta/models.`  
  * `While validating: Inline loading spinner.`  
  * `On 200 OK: Green check mark and success callout.`  
  * `On Error: Red alert message detailing invalid key or rate limit.`  
* **`Storage Encryption Handlers`**`:`

`export const storeEncryptedKey = async (rawKey: string): Promise<void> => {`

  `const encoder = new TextEncoder();`

  `const keyData = encoder.encode(rawKey);`

  `const cryptoKey = await window.crypto.subtle.generateKey(`

    `{ name: "AES-GCM", length: 256 },`

    `false,`

    `["encrypt", "decrypt"]`

  `);`

  `// Stores encrypted array buffer in browser IndexedDB`

  `await saveToIndexedDB("byok_store", "gemini_api_key", keyData);`

`};`

* **`Top Navigation Badge`**`: Renders "Pro Unlimited (BYOK)" badge across NavigationHeader.`

#### **`3.4 Canceled Tier Stage Implementation`**

`Handles lapsed subscriptions by locking editing tools while keeping historical user logs readable.`

* **`Read-Only View`**`: Main panel transforms into a static container displaying past records ("오늘의 발견", "작은 시도, 해냈어요").`  
* **`Disabled Form Inputs`**`: Text inputs in MarkdownSourcePanel set disabled={true} with placeholder text:`

`"구독이 만료되었습니다. 다시 활성화하여 편집하세요."`

* **`Re-Subscription Banner`**`: Displays top notification banner with direct binding to reactivate subscription or switch to BYOK key mode.`

### **`4. System Guardrails & Demo Helper Components`**

#### **`4.1 System Failure Guardrails`**

`🟢 GREEN CIRCUIT BREAKER (GreenShelterToast)`

* **`Condition`**`: Offline network status or connection drop detected.`  
* **`UI Spec`**`: Floating bottom-right toast notification component.`  
* **`Behavior`**`: Intercepts outgoing network calls, queues local changes into browser IndexedDB, and renders a dynamic progress bar showing PENDING_SYNC status for auto-retry upon reconnection.`

`🟡 YELLOW FEATURE FLAG (YellowFallbackCard)`

* **`Condition`**`: Gemini API returns rate limits (429) or backend degradation (5xx).`  
* **`UI Spec`**`: Inline warning card replacing dynamic AI elements.`  
* **`Behavior`**`: Activates emergency client bypass utilizing pre-compiled local templates and in-memory cache with a 30-second TTL (Time-To-Live).`

`🔵 BLUE ROLLBACK SYSTEM (BlueRollbackSpinner)`

* **`Condition`**`: Async AI prescription generation request exceeds 8 seconds.`  
* **`UI Spec`**`: Loading spinner overlay featuring timeout countdown and manual abort button.`  
* **`Behavior`**`: At the 8-second mark, automatically aborts pending HTTP requests, rolls back UI state, and reroutes the user to rule-based offline parsing outputs without page refresh.`

#### **`4.2 Interactive Demo Helper FAB`**

`The DemoHelperFab floating action button facilitates product demonstrations and rapid session resets.`

* **`Target Condition`**`: Rendered when process.env.NODE_ENV === 'development' or when ?demo=true query parameter is detected.`  
* **`Positioning & Styling`**`:`  
  1. `Position: fixed bottom-6 right-6 z-50`  
  2. `Tailwind Styling: bg-slate-900/90 hover:bg-slate-800 text-white p-3.5 rounded-full shadow-2xl border border-slate-700 transition-all flex items-center justify-center backdrop-blur-md`  
  3. `Lucide Icon: <Wand2 className="w-5 h-5 text-indigo-400" />`  
* **`Action Signatures & State Handlers`**`:`  
  1. **`Automated Gemini Key Injection`**`:`  
     * `Action: "Auto-Fill Demo Key"`  
     * `Effect: Injects valid test key into IndexedDB, updates useGuestStore or Pro tier state, and enables immediate generation capabilities.`  
  2. **`1-Second Reset RPC Handler`**`:`  
     * `Action: "Reset Demo Session"`  
     * `Effect: Purges IndexedDB, resets Zustand store, clears sessionStorage, and refreshes application UI within 1 second.`

# **`MVP Specification Update: Live Attendee Feedback & Realtime Comment Wall Integration`**

## **`1. Executive Overview & Scope of Update`**

`This document details the architectural pivot for the whatImSupposedto-Didit web service MVP specification suite. The core mission of the platform—moving users from perfection paralysis to action ("작게, 해냄 - 오늘 한 번의 실행")—is extended from a individual reflection tool into a shared live demonstration experience.`

`Previously, the application operated strictly within an isolated local session, governed by the disclaimer "이 분석은 브라우저에서만 실행돼요. 입력한 내용은 저장되지 않습니다." ("▣ 데모 세션 · 입력한 내용은 저장되지 않아요"). To transform live product demonstrations into interactive, social-proof engines, this update introduces the Demonstration Attendee Live Feedback & Realtime Comment/Emoji Reaction System.`

`By establishing a real-time event pipeline backed by cloud persistence, live attendees can submit ratings, single-line reflections, and emoji reactions on their mobile devices, instantly broadcasting them to the presenter's central screen.`

### **`Summary of Scope Changes`**

| `Previous MVP Baseline (Local Browser-Only)` | `Updated MVP Scope (Realtime Cloud-Backed)` |
| :---- | :---- |
| **`Session & Storage:`** `Browser memory only; zero database persistence or inter-client communication ("입력한 내용은 저장되지 않습니다").` | **`Cloud Persistence:`** `Persistent record storage in PostgreSQL (public.demo_feedbacks) via Supabase infrastructure.` |
| **`Security & Access Control:`** `No authorization layer required; execution limited to local state.` | **`Guest Access & RLS:`** `Secure Row Level Security (RLS) policies allowing unauthenticated public inserts and broadcasts.` |
| **`Audience Engagement:`** `Passive viewing; presentation display static execution reflection without feedback loops.` | **`Interactive WebSocket Wall:`** `Real-time bi-directional streaming feed with dynamic cards and floating emoji animations.` |
| **`Mobile Entry:`** `N/A (Desktop display only).` | **`QR Deep-Linking:`** `Embedded URL QR codes mapping to target mobile routes with automatic modal trigger (?action=feedback).` |

## **`2. Product Requirements Document (PRD) Backlog Updates`**

`The product backlog is updated to incorporate the new feedback channels, broken down into critical path features (P0) and high-priority enhancement modules (P1).`

| `Requirement ID` | `Feature Name` | `Priority` | `Description & Acceptance Criteria` | `Target Component` |
| :---- | :---- | :---- | :---- | :---- |
| **`REQ-FB-01`** | `In-App Live Feedback Modal` | **`P0`** | **`Description:`** `Triggered post-demo or via a floating action launcher button.<br>Acceptance Criteria: Provides an interactive 5-star rating bar, a single-line text input field (max 200 chars), and preset emoji reaction selector pills ("🔥", "💜", "5세 치트키 대박"). Resets form state upon submission without page reload.` | `src/components/demo/FeedbackModal.tsx` |
| **`REQ-FB-02`** | `QR Code Mobile Quick Form` | **`P1`** | **`Description:`** `Standalone QR code chip rendered in the presentation UI.<br>Acceptance Criteria: Renders an 80x80px SVG QR code using qrcode.react. Encodes a deep-link URL (?action=feedback) that automatically launches the feedback submission form on guest mobile devices.` | `src/components/demo/QRCodeChip.tsx` |
| **`REQ-FB-03`** | `Interactive Live Comment Wall` | **`P0`** | **`Description:`** `Real-time streaming wall hosted in the viewport's Right Panel.<br>Acceptance Criteria: Establishes a WebSocket subscription (supabase.channel('demo_comments')). Listens for PostgreSQL INSERT events, dedupes payloads, and appends incoming comments at the top of the feed with CSS animations.` | `src/components/community/LiveCommentWall.tsx` |

## **`3. User Flow & Scenario Mapping (Act 5 & Attendee Journey)`**

`The demonstration scenario is updated to expand Act 5: Post-Demo Reflection & Audience Engagement, detailing the interaction loop between Presenter and Guest.`

 `[ Presenter Screen ]                             [ Guest Mobile Device ]`

          `│                                                   │`

`1. Triggers Act 5 (Demo End)                                  │`

          `│                                                   │`

          `├── Displays QR Code Chip ─────────────────────────►│ 2. Scans QR Code`

          `│   (Deep-link: ?action=feedback)                   │    Opens Web App`

          `│                                                   │`

          `│                                                   ├── 3. Auto-opens Feedback Modal`

          `│                                                   │    Selects Stars, Enters Text:`

          `` │                                                   │    `"완벽함 대신 시도한 순간이 보여요"` ``

          `` │                                                   │    Selects Badge: `"5세 치트키 대박"` ``

          `│                                                   │`

          `│                                                   └── 4. Submits Form (HTTP POST)`

          `│                                                            │`

          `│◄─────────────────────── 5. Supabase Realtime ──────────────┘`

          `│                           WebSocket Broadcast`

          `│`

`6. Live Comment Wall Appends Item`

   `Floating Badges Render`

### **`Sequential Interaction Steps`**

1. **`Act 5 Trigger (Presenter)`**  
   * `The presenter completes the core demonstration ("Goal vs. Actual Execution" analysis).`  
   * `The system automatically highlights the top-right QRCodeChip and renders the persistent floating action launcher button at the bottom right.`  
2. **`Guest Entry & Route Handling (Attendee)`**  
   * **`Mobile Entry:`** `The guest scans the QRCodeChip displayed on the presenter's screen. The camera opens the web target URL appended with the query string ?action=feedback.`  
   * **`Router Handler:`** `On page load, the frontend router parses window.location.search. If action === 'feedback', the root application state automatically forces isFeedbackModalOpen = true.`  
   * **`Desktop Entry:`** `Alternatively, in-app users click the persistent floating action button (FAB).`  
3. **`Feedback Submission (Attendee)`**  
   * `The guest selects a rating (1 to 5 stars).`  
   * `The guest enters a 1-line reflection, such as "완벽함 대신 시도한 순간이 보여요" or "소리 내서 3번 읽기 실천해봅니다".`  
   * `The guest selects an emoji reaction button (e.g., "5세 치트키 대박").`  
   * `The guest clicks "Send Live Feedback".`  
4. **`Realtime Broadcast & UI Updating (System & Presenter)`**  
   * `The form sends an INSERT payload to public.demo_feedbacks.`  
   * `Supabase Postgres WAL triggers a broadcast to the demo_comments channel.`  
   * `The presenter's LiveCommentWall component catches the payload, verifies ID uniqueness, inserts the comment at the top of the feed with an @keyframes fadeIn animation, and spawns a floating reaction badge (@keyframes floatUp).`

## **`4. Data Architecture & Data Flow Specification`**

### **`Database Schema Definition (public.demo_feedbacks)`**

`To guard against database inflation and ensure data hygiene during high-concurrency public live streams, hard character length constraints are enforced at the database level.`

`-- Table Definition for Live Demo Feedback`

`CREATE TABLE IF NOT EXISTS public.demo_feedbacks (`

    `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`

    `created_at TIMESTAMPTZ DEFAULT now() NOT NULL,`

    `rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),`

    `comment VARCHAR(200) NOT NULL CHECK (char_length(comment) <= 200),`

    `emoji_reaction TEXT DEFAULT '🔥' NOT NULL`

`);`

### **`Security & Row Level Security (RLS) Policy`**

`Guest attendees do not authenticate prior to submitting feedback. Security is managed via granular RLS rules alongside rate-limiting constraints on the Supabase API Gateway.`

`-- Enable Row Level Security`

`ALTER TABLE public.demo_feedbacks ENABLE ROW LEVEL SECURITY;`

`-- Allow anonymous/public guest inserts`

`CREATE POLICY "Allow public inserts"` 

`ON public.demo_feedbacks` 

`FOR INSERT` 

`WITH CHECK (true);`

`-- Allow public read access for realtime display`

`CREATE POLICY "Allow public select"` 

`ON public.demo_feedbacks` 

`FOR SELECT` 

`USING (true);`

### **`WebSocket Architecture & Connection Lifecycle`**

`[ Attendee Mobile Client ]` 

       `│`

       `│  1. HTTP POST Insert (Validation: max 200 chars)`

       `▼`

`[ Supabase PostgreSQL: public.demo_feedbacks ]`

       `│`

       `│  2. Replication via Postgres WAL`

       `▼`

`[ Supabase Realtime Server ]`

       `│`

       `│  3. Realtime Broadcast Payload via WebSocket`

       `▼`

`[ Presenter UI: LiveCommentWall ]`

       `│`

       `├── Connection State Handler:`

       `│     ├─ 'SUBSCRIBED'    => Green Pulsing Status LED`

       `│     ├─ 'CHANNEL_ERROR' => Yellow Indicator + Auto-reconnect Backoff`

       `│     └─ 'CLOSED'        => Red Indicator + Poll Fallback (10s)`

       `│`

       `└── State Update:`

             `└─ Dedupe Check (item.id) => Prepend State => Trigger CSS Keyframe Animations`

#### **`Connection Resilience Strategy`**

* **`Status Tracking:`** `The client tracks WebSocket channel connection states (SUBSCRIBED, TIMED_OUT, CLOSED, CHANNEL_ERROR).`  
* **`Auto-Reconnect & Fallback:`** `If the connection encounters a CHANNEL_ERROR or drops to CLOSED, the system initiates exponential backoff reconnect attempts while temporarily activating a 10-second HTTP polling fallback loop to guarantee continuous presentation operation.`

## **`5. UI Specifications & Design System Updates`**

### **`Right Panel (LiveCommentWall) Layout Component`**

* **`Dimensions:`** `Width: 320px fixed, Height: 100% viewport height.`  
* **`Header Bar:`** `Title "Live Attendee Wall" paired with a dynamic connection status badge (bg-green-500 animate-pulse when SUBSCRIBED).`  
* **`Feed Stream:`** `Scrollable feed displaying incoming cards. New cards insert at the top.`

`+---------------------------------------+`

`| Live Attendee Wall               [●]  |`

`+---------------------------------------+`

`| [ QR Code Chip Component ]            |`

`|                                       |`

`| Live Stream Feed:                     |`

`| +-----------------------------------+ |`

`| | ★★★★★        [5세 치트키 대박]   | |`

`| | "완벽함 대신 시도한 순간이 보여요"| |`

`| +-----------------------------------+ |`

`| | ★★★★★        [🔥]                 | |`

`| | "소리 내서 3번 읽기 실천해봅니다"  | |`

`| +-----------------------------------+ |`

`|                                       |`

`| ( Floating Animations: 🔥  💜  ✦ )    |`

`+---------------------------------------+`

### **`Dedicated QR Code Chip Breakdown (QRCodeChip.tsx)`**

* **`Outer Container:`** `w-full bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3.`  
* **`SVG Target Box:`** `80px x 80px rendered size with 8px quiet zone white margin (p-2 border rounded-lg bg-white).`  
* **`Deep-Link Target Mapping:`** `Encodes ${window.location.origin}/demo?action=feedback.`

`+-------------------------------------------------+`

`|  +--------------------+                         |`

`|  | [QR Code Canvas]   |  Scan to Participate    |`

`|  |  80px x 80px       |                         |`

`|  |  Quiet Zone: 8px   |  Submit live feedback   |`

`|  +--------------------+  & instant reactions    |`

`+-------------------------------------------------+`

### **`FeedbackModal Component`**

* **`Backdrop:`** `fixed inset-0 bg-black/50 backdrop-blur-sm z-50.`  
* **`Container:`** `max-w-md bg-white rounded-xl shadow-2xl p-6.`  
* **`Form Controls:`**  
  * `Interactive 5-star bar.`  
  * `Single-line input field with char counter (0/200).`  
  * `Reaction selector pills: "🔥", "💜", "5세 치트키 대박".`

`+---------------------------------------+`

`| Demonstration Feedback            [X] |`

`+---------------------------------------+`

`| Rating                                |`

`| ★ ★ ★ ★ ★                             |`

`|                                       |`

`| 1-Line Feedback (Max 200 chars)       |`

`| [ Enter your comment...         0/200 ]|`

`|                                       |`

`| Emoji Reaction                        |`

`| ( 🔥 )  ( 💜 )  ( 5세 치트키 대박 )    |`

`|                                       |`

`| [ Send Live Feedback                ] |`

`+---------------------------------------+`

### **`Keyframe Animation Specifications`**

`To guide frontend engine implementation without extra CSS dependencies, design tokens for keyframe animations are defined below:`

`/* Animation Tokens for Tailwind Config / Custom CSS */`

`@keyframes fadeIn {`

  `0% {`

    `opacity: 0;`

    `transform: translateY(-12px) scale(0.96);`

  `}`

  `100% {`

    `opacity: 1;`

    `transform: translateY(0) scale(1);`

  `}`

`}`

`@keyframes floatUp {`

  `0% {`

    `opacity: 1;`

    `transform: translateY(0) scale(1);`

  `}`

  `50% {`

    `opacity: 0.8;`

    `transform: translateY(-40px) scale(1.2);`

  `}`

  `100% {`

    `opacity: 0;`

    `transform: translateY(-80px) scale(0.8);`

  `}`

`}`

`.animate-fade-in {`

  `animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;`

`}`

`.animate-float-up {`

  `animation: floatUp 2s ease-out forwards;`

`}`

## **`6. Technical UI Implementation & Code Specifications`**

### **`1. Database Migration & Realtime Configuration`**

`-- Migration: supabase/migrations/20260330_demo_feedbacks_schema.sql`

`-- 1. Create table with length and rating constraints`

`CREATE TABLE IF NOT EXISTS public.demo_feedbacks (`

    `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),`

    `created_at TIMESTAMPTZ DEFAULT now() NOT NULL,`

    `rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),`

    `comment VARCHAR(200) NOT NULL CHECK (char_length(comment) <= 200),`

    `emoji_reaction TEXT DEFAULT '🔥' NOT NULL`

`);`

`-- 2. Configure RLS Policies`

`ALTER TABLE public.demo_feedbacks ENABLE ROW LEVEL SECURITY;`

`DROP POLICY IF EXISTS "Allow public inserts" ON public.demo_feedbacks;`

`CREATE POLICY "Allow public inserts"` 

`ON public.demo_feedbacks` 

`FOR INSERT` 

`WITH CHECK (true);`

`DROP POLICY IF EXISTS "Allow public select" ON public.demo_feedbacks;`

`CREATE POLICY "Allow public select"` 

`ON public.demo_feedbacks` 

`FOR SELECT` 

`USING (true);`

`-- 3. Add table to Supabase Realtime Publication`

`ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_feedbacks;`

### **`2. Standalone QR Code Chip Component (src/components/demo/QRCodeChip.tsx)`**

`import React from 'react';`

`import { QRCodeSVG } from 'qrcode.react';`

`interface QRCodeChipProps {`

  `targetPath?: string;`

`}`

`export const QRCodeChip: React.FC<QRCodeChipProps> = ({ targetPath = '/demo?action=feedback' }) => {`

  `const fullUrl = typeof window !== 'undefined'` 

    `` ? `$window.location.origin${targetPath}` `` 

    ``: `https://whatimsupposedto-didit.vercel.app${targetPath}`;``

  `return (`

    `<div className="w-full bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">`

      `<div className="p-1.5 border border-gray-100 rounded-lg bg-white shadow-inner flex-shrink-0">`

        `<QRCodeSVG` 

          `value={fullUrl}` 

          `size={72}`

          `level="M"`

          `includeMargin={false}`

        `/>`

      `</div>`

      `<div className="text-xs">`

        `<span className="inline-block px-2 py-0.5 mb-1 bg-indigo-50 text-indigo-600 font-bold text-[10px] rounded-full">`

          `Live Participation`

        `</span>`

        `<p className="font-bold text-gray-800 leading-tight">Scan to Give Feedback</p>`

        `<p className="text-gray-500 text-[11px] mt-0.5">Submit instant ratings & reactions</p>`

      `</div>`

    `</div>`

  `);`

`};`

### **`3. Feedback Modal Component (src/components/demo/FeedbackModal.tsx)`**

`import React, { useState } from 'react';`

`import { supabase } from '../../lib/supabase';`

`interface FeedbackModalProps {`

  `isOpen: boolean;`

  `onClose: () => void;`

`}`

`export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {`

  `const [rating, setRating] = useState<number>(5);`

  `const [comment, setComment] = useState<string>('');`

  `const [emojiReaction, setEmojiReaction] = useState<string>('🔥');`

  `const [isSubmitting, setIsSubmitting] = useState<boolean>(false);`

  `const [errorMessage, setErrorMessage] = useState<string | null>(null);`

  `if (!isOpen) return null;`

  `const handleSubmit = async (e: React.FormEvent) => {`

    `e.preventDefault();`

    `if (!comment.trim()) return;`

    `if (comment.length > 200) {`

      `setErrorMessage('Comment exceeds 200 characters limit.');`

      `return;`

    `}`

    `setIsSubmitting(true);`

    `setErrorMessage(null);`

    `const { error } = await supabase`

      `.from('demo_feedbacks')`

      `.insert([`

        `{`

          `rating,`

          `comment: comment.trim(),`

          `emoji_reaction: emojiReaction,`

        `},`

      `]);`

    `setIsSubmitting(false);`

    `if (error) {`

      `setErrorMessage(error.message);`

    `} else {`

      `// Full form reset state upon successful insertion`

      `setRating(5);`

      `setComment('');`

      `setEmojiReaction('🔥');`

      `onClose();`

    `}`

  `};`

  `return (`

    `<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">`

      `<div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in">`

        `<button` 

          `onClick={onClose}`

          `className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"`

          `aria-label="Close"`

        `>`

          `✕`

        `</button>`

        `<h3 className="text-xl font-bold mb-1 text-gray-900">Demonstration Feedback</h3>`

        `<p className="text-xs text-gray-500 mb-4">"완벽한 계획보다, 오늘 한 번의 실행."</p>`

        `{errorMessage && (`

          `<div className="mb-3 p-2 text-xs bg-red-50 text-red-600 rounded border border-red-200">`

            `{errorMessage}`

          `</div>`

        `)}`

        `<form onSubmit={handleSubmit} className="space-y-4">`

          `<div>`

            `<label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>`

            `<div className="flex gap-1 text-2xl text-yellow-400 cursor-pointer">`

              `{[1, 2, 3, 4, 5].map((star) => (`

                `<button`

                  `type="button"`

                  `key={star}`

                  `onClick={() => setRating(star)}`

                  ``className={`focus:outline-none transition-transform hover:scale-110 ${``

                    `star <= rating ? 'text-yellow-400' : 'text-gray-300'`

                  ``}`}``

                `>`

                  `★`

                `</button>`

              `))}`

            `</div>`

          `</div>`

          `<div>`

            `<div className="flex justify-between items-center mb-1">`

              `<label className="block text-sm font-medium text-gray-700">1-Line Feedback</label>`

              ``<span className={`text-[10px] ${comment.length > 200 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>``

                `{comment.length}/200`

              `</span>`

            `</div>`

            `<input`

              `type="text"`

              `maxLength={200}`

              `value={comment}`

              `onChange={(e) => setComment(e.target.value)}`

              `placeholder="완벽함 대신 시도한 순간이 보여요..."`

              `className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"`

              `required`

            `/>`

          `</div>`

          `<div>`

            `<label className="block text-sm font-medium text-gray-700 mb-1">Emoji Reaction</label>`

            `<div className="flex gap-2">`

              `{['🔥', '💜', '5세 치트키 대박'].map((reaction) => (`

                `<button`

                  `type="button"`

                  `key={reaction}`

                  `onClick={() => setEmojiReaction(reaction)}`

                  ``className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${``

                    `emojiReaction === reaction` 

                      `? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm scale-105'` 

                      `: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'`

                  ``}`}``

                `>`

                  `{reaction}`

                `</button>`

              `))}`

            `</div>`

          `</div>`

          `<button`

            `type="submit"`

            `disabled={isSubmitting}`

            `className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-md disabled:opacity-50"`

          `>`

            `{isSubmitting ? 'Submitting...' : 'Send Live Feedback'}`

          `</button>`

        `</form>`

      `</div>`

    `</div>`

  `);`

`};`

### **`4. Realtime Live Comment Wall Component (src/components/community/LiveCommentWall.tsx)`**

`import React, { useEffect, useState } from 'react';`

`import { supabase } from '../../lib/supabase';`

`import { QRCodeChip } from '../demo/QRCodeChip';`

`import { FeedbackModal } from '../demo/FeedbackModal';`

`interface FeedbackItem {`

  `id: string;`

  `created_at: string;`

  `rating: number;`

  `comment: string;`

  `emoji_reaction: string;`

`}`

`export const LiveCommentWall: React.FC = () => {`

  `const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);`

  `const [connectionState, setConnectionState] = useState<'CONNECTING' | 'SUBSCRIBED' | 'ERROR'>('CONNECTING');`

  `const [isModalOpen, setIsModalOpen] = useState<boolean>(false);`

  `// Router deep-link detection for ?action=feedback`

  `useEffect(() => {`

    `if (typeof window !== 'undefined') {`

      `const params = new URLSearchParams(window.location.search);`

      `if (params.get('action') === 'feedback') {`

        `setIsModalOpen(true);`

      `}`

    `}`

  `}, []);`

  `useEffect(() => {`

    `// 1. Initial Snapshot Fetch`

    `const fetchInitialFeedbacks = async () => {`

      `const { data, error } = await supabase`

        `.from('demo_feedbacks')`

        `.select('*')`

        `.order('created_at', { ascending: false })`

        `.limit(25);`

      `if (!error && data) {`

        `setFeedbacks(data);`

      `}`

    `};`

    `fetchInitialFeedbacks();`

    `// 2. Realtime WebSocket Subscription with Reconnection & Deduplication`

    `const channel = supabase`

      `.channel('demo_comments')`

      `.on(`

        `'postgres_changes',`

        `{`

          `event: 'INSERT',`

          `schema: 'public',`

          `table: 'demo_feedbacks',`

        `},`

        `(payload) => {`

          `const newFeedback = payload.new as FeedbackItem;`

          `// Guard against duplicate frames or multi-broadcast key collisions`

          `setFeedbacks((prev) => {`

            `if (prev.some((item) => item.id === newFeedback.id)) {`

              `return prev;`

            `}`

            `return [newFeedback, ...prev];`

          `});`

        `}`

      `)`

      `.subscribe((status) => {`

        `if (status === 'SUBSCRIBED') {`

          `setConnectionState('SUBSCRIBED');`

        `} else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {`

          `setConnectionState('ERROR');`

        `}`

      `});`

    `return () => {`

      `supabase.removeChannel(channel);`

    `};`

  `}, []);`

  `return (`

    `<aside className="flex flex-col h-full bg-gray-50 border-l border-gray-200 p-4 w-80 overflow-hidden relative select-none">`

      `{/* Header with Connection Status Indicator */}`

      `<div className="flex items-center justify-between mb-3">`

        `<h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">`

          `<span` 

            ``className={`w-2.5 h-2.5 rounded-full transition-colors ${``

              `connectionState === 'SUBSCRIBED'` 

                `? 'bg-green-500 animate-pulse'` 

                `: connectionState === 'CONNECTING'` 

                `? 'bg-yellow-400'` 

                `: 'bg-red-500'`

            ``}`}`` 

            ``title={`Status: ${connectionState}`}``

          `/>`

          `Live Attendee Wall`

        `</h4>`

        `<span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">`

          `{connectionState}`

        `</span>`

      `</div>`

      `{/* Embedded Mobile Quick Form QR Chip */}`

      `<div className="mb-4">`

        `<QRCodeChip targetPath="/demo?action=feedback" />`

      `</div>`

      `{/* Realtime Stream List */}`

      `<div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">`

        `{feedbacks.length === 0 ? (`

          `<div className="text-center py-8 text-gray-400 text-xs">`

            `Waiting for live attendee reflections...`

          `</div>`

        `) : (`

          `feedbacks.map((item) => (`

            `<div` 

              `key={item.id}` 

              `className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 text-xs transition-all duration-300 animate-fade-in"`

            `>`

              `<div className="flex justify-between items-center mb-1.5">`

                `<span className="text-yellow-400 font-bold text-sm tracking-tighter">`

                  `{'★'.repeat(item.rating)}`

                  `<span className="text-gray-200">{'★'.repeat(5 - item.rating)}</span>`

                `</span>`

                `<span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100">`

                  `{item.emoji_reaction}`

                `</span>`

              `</div>`

              `<p className="text-gray-800 font-medium leading-relaxed break-words">`

                `"{item.comment}"`

              `</p>`

              `<span className="text-[9px] text-gray-400 block mt-1">`

                `{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`

              `</span>`

            `</div>`

          `))`

        `)}`

      `</div>`

      `{/* Floating Action Launcher Button (Desktop/Host trigger) */}`

      `<button`

        `onClick={() => setIsModalOpen(true)}`

        `className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2"`

      `>`

        `<span>💬</span> Give Live Feedback`

      `</button>`

      `{/* Embedded Submission Modal */}`

      `<FeedbackModal` 

        `isOpen={isModalOpen}` 

        `onClose={() => setIsModalOpen(false)}` 

      `/>`

    `</aside>`

  `);`

`};`
