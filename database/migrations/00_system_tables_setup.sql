-- =========================================================================
-- [SYSTEM SETUP] 피처 플래그 및 블루/그린 무다운타임 배포 게이트 구성 DDL
-- =========================================================================

-- 1. 시스템 피처 플래그 테이블 생성
CREATE TABLE IF NOT EXISTS public.system_feature_flags (
    key TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 블루/그린 라이브 라우팅 구성 테이블 생성
CREATE TABLE IF NOT EXISTS public.system_routing_config (
    config_id TEXT PRIMARY KEY,
    active_color TEXT DEFAULT 'BLUE' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 시스템 정상 가동을 위한 가드레일용 초기 마스터 데이터 일괄 적재
INSERT INTO public.system_feature_flags (key, is_enabled, description) VALUES
('enable-rina-parser', true, '리나 페르소나용 전용 비정형 마크다운 파서 엔진 가동 여부 스위치'),
('enable-phonics-hyphen-component', true, '처방전 4단의 하이픈 의성어 컴포넌트 렌더링 스위치')
ON CONFLICT (key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

INSERT INTO public.system_routing_config (config_id, active_color) VALUES
('prompt_deployment_gate', 'BLUE')
ON CONFLICT (config_id) DO UPDATE SET active_color = EXCLUDED.active_color;
