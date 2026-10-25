# 🔵 BLUE TRANSACTION ROLLBACK GATE
> **8초 데드라인 타이머 제한 복구 트랜잭션 및 AI 프롬프트 블루/그린 무다운타임 스위칭 명세서**

본 문서는 사용자의 파일 업로드 오염, 파싱 예외 또는 데드락 트랜잭션 충돌 시 시스템이 좀비 상태로 대기하는 것을 원천 차단하는 **8초 데드라인 제안 롤백**과, AI 핵심 알고리즘 배포 시 다운타임 리스크를 완전히 파괴하는 **프롬프트 블루/그린 원격 라우팅 엔진**의 **🔵 블루(Blue) 최종 수호 가드레일**을 정의합니다.

---

## ⚡ 1. 8초 데드라인 제한 복구 트랜잭션 (RollbackHandler)

`RollbackHandler.ts` 모듈은 비정형 마크다운의 파싱 및 영속화 과정에서 발생할 수 있는 데이터 오염 및 무한 블로킹 리스크를 제어하기 위해, 애플리케이션 백엔드 런타임 최상위에 강력한 하드 타이머 가드레일을 집행합니다.

### ⚙️ 원자성 사수 및 롤백 매커니즘 (Atomicity Guard)
*   **8000ms 하드 타이머 경쟁 (`Promise.race`):** 사용자의 입력 데이터가 데이터베이스 마이그레이션 적재 프로세스에 진입하는 순간, 8초 제한 시간 프로미스와 실제 처리 프로미스의 실시간 레이스 경쟁이 유도됩니다.
*   **PostgreSQL 내부 격리 저장 프로시저 (`RPC`):** Supabase 레이어에 탑재된 `execute_safe_prescription_transaction` 함수는 내부 원자성 보장 블록을 개시합니다. 8초 이내에 완료되지 못해 Node.js 런타임에서 강제 컷오프(`Reject`) 처리가 터지거나 구문 파괴 예외가 발생하면, 데이터베이스는 자동으로 이 블록 내부의 모든 INSERT/UPDATE 내역을 원천 무효화(Abort)하여 오염 전의 무결한 상태를 완벽히 유지해냅니다.

---

## 🎨 2. 프롬프트 블루/그린 무다운타임 스위칭 (PromptBlueGreenRouter)

AI 처방 알고리즘이나 시스템 프롬프트 서식이 업데이트되었을 때, 사용자를 로그아웃시키거나 전체 컨테이너 서버를 다시 재부팅시키는 무거운 다운타임 없이 원격에서 실시간으로 프롬프트 버전을 전환하고 즉각적인 1초 원격 롤백을 구현하는 엔진 거버넌스입니다.

```text
[라이브 유저 처방 요청 유입]
           │
           ▼
[PromptBlueGreenRouter 작동] ──► Supabase 원격 `system_routing_config` 실시간 스캔
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼ (active_color === 'BLUE')                                         ▼ (active_color === 'GREEN')
┌──────────────────────────────────────────┐                       ┌──────────────────────────────────────────┐
│ 구버전 안정 모드 (v2.0_BLUE)              │                       │ 신버전 정밀 모드 (v2.1_GREEN)              │
│ - 일반 4단 처방 분석 컨텍스트             │                       │ - 음절 간 하이픈 연결 무결성 극대화        │
│ - Temperature: 0.3                       │                       │ - Temperature: 0.2 (정밀 튜닝 가드)       │
└──────────────────────────────────────────┘                       └──────────────────────────────────────────┘
```

### 🔀 무다운타임 배포 및 무중단 스위칭 거버넌스 규격
1.  **안전 컬러 락인 정책 (Blue Isolation):** 초기 프로덕션 게이트는 항상 검증된 구버전인 `v2.0_BLUE` 자산으로 락인되어 구동됩니다.
2.  **실시간 원격 컬러 라우팅:** 신규 고도화 프롬프트 검증이 완료되면, 운영자는 데이터베이스 설정 테이블에서 `active_color` 값을 `GREEN`으로 업데이트하는 즉시 라이브 트래픽의 실행 경로를 실시간 전환합니다.
3.  **장애 발생 시 즉각 롤백 가드:** 만약 그린(Green) 신버전 가동 중 예기치 못한 Structured Outputs 스키마 파괴나 예외 로그가 관측되면, 코드를 수정할 필요 없이 데이터베이스 설정을 다시 `BLUE`로 바꾸는 즉시 1초 만에 안전한 이전 상태로 원격 복구 및 장애가 완전히 격리됩니다.

---

## 🛠️ 3. 운영 테이블 설정 DDL 명세 (Routing Schema)

블루/그린 게이트의 실시간 라우팅 상태를 기록하고 영속화하기 위해 Supabase 인프라에 장착되는 최종 시스템 테이블입니다.

```sql
CREATE TABLE public.system_routing_config (
    config_id TEXT PRIMARY KEY,
    active_color TEXT DEFAULT 'BLUE' NOT NULL, -- 'BLUE' 또는 'GREEN' 스위칭 값
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 프로덕션 게이트웨이 초기 기동 상태 데이터 박제
INSERT INTO public.system_routing_config (config_id, active_color) 
VALUES ('prompt_deployment_gate', 'BLUE')
ON CONFLICT (config_id) DO NOTHING;
```
