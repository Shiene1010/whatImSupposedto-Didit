CREATE OR REPLACE FUNCTION public.execute_safe_prescription_transaction(
    p_user_id UUID,
    p_original_target TEXT,
    p_five_year_old TEXT,
    p_cheat_key TEXT,
    p_phonics_sound TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. 데이터 원자성 보장을 위한 내부 격리 트랜잭션 블록 개시
    -- 충돌 발생 시 이 블록 내부의 모든 INSERT/UPDATE는 원천 무효화됨
    INSERT INTO public.prescription_logs (
        user_id, 
        original_target, 
        five_year_old_version, 
        cheat_key_action, 
        phonics_sound
    ) VALUES (
        p_user_id, 
        p_original_target, 
        p_five_year_old, 
        p_cheat_key, 
        p_phonics_sound
    );

    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    -- 내부 구문 파괴나 락 충돌 등 예외 감지 시 즉각 예외를 상위로 던져 트랜잭션 원천 롤백
    RAISE EXCEPTION 'DATABASE_TRANSACTION_CRASH_ROLLED_BACK';
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
