-- Reset only application data for the fixed MVP demo account.
-- The auth.users row and all other users' data are intentionally untouched.
CREATE OR REPLACE FUNCTION public.reset_demo_account_data()
RETURNS TABLE (deleted_ai_prescriptions BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.ai_prescriptions
    WHERE user_id = '36f604b8-6855-45d1-a9ee-75a94463e6a1'::UUID;

    GET DIAGNOSTICS deleted_ai_prescriptions = ROW_COUNT;
    RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_demo_account_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_demo_account_data() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_demo_account_data() TO service_role;

COMMENT ON FUNCTION public.reset_demo_account_data() IS
    'Deletes MVP application data for the dedicated demo account only; does not delete the Auth user.';
