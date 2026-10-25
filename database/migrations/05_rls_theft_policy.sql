-- 1. 테이블 단위 Row Level Security 보안 락 가동
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_logs ENABLE ROW LEVEL SECURITY;

-- 2. 프로필용 RLS: 본인의 프로필만 수정 가능, 읽기는 전체 공개 허용
CREATE POLICY "전체 유저는 타인의 닉네임을 조회할 수 있다" 
ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY "인증된 유저는 본인의 프로필만 생성 및 수정할 수 있다" 
ON public.user_profiles FOR ALL USING (auth.uid() = id);

-- 3. 처방전 및 표현 스틸용 RLS 가드레일 수립
-- 규칙 A: 다른 유저의 처방전 데이터를 자유롭게 SELECT(조회)하여 볼 수 있게 열어둠 (합법적 표현 스틸의 전제 조건)
CREATE POLICY "모든 인증된 유저는 동료의 처방전을 읽을 수 있다"
ON public.prescription_logs FOR SELECT
TO authenticated
USING (true);

-- 규칙 B: 데이터의 삽입(INSERT)은 오직 본인의 auth.uid() 명의로만 수행 가능하도록 강제하여 타인 명의 도용 차단
CREATE POLICY "유저는 오직 본인의 명의로만 처방전이나 스틸 데이터를 삽입할 수 있다"
ON public.prescription_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 규칙 C: 수정(UPDATE) 및 삭제(DELETE)는 철저히 본인이 소유한 데이터 행만 가능하도록 격리 가드레일 설치
CREATE POLICY "유저는 본인이 생성한 처방전 데이터만 수정 및 삭제할 수 있다"
ON public.prescription_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
