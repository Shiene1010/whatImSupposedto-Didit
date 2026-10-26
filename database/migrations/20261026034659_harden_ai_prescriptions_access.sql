-- Restrict direct access to the user-owned prescription table.
REVOKE ALL PRIVILEGES ON TABLE public.ai_prescriptions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.ai_prescriptions TO authenticated;

ALTER POLICY "사용자는 자신의 처방 데이터만 조회할 수 있다"
ON public.ai_prescriptions
USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "사용자는 자신의 처방 데이터만 삽입할 수 있다"
ON public.ai_prescriptions
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS ai_prescriptions_user_id_idx
ON public.ai_prescriptions (user_id);
