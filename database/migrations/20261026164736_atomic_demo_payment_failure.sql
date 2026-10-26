CREATE OR REPLACE FUNCTION public.fail_demo_subscription_payment(
    p_user_id UUID,
    p_customer_key TEXT,
    p_order_id TEXT,
    p_provider_code TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    payment_rows INTEGER;
    subscription_rows INTEGER;
BEGIN
    UPDATE public.demo_subscription_payments
    SET status = 'failed',
        provider_code = p_provider_code,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND customer_key = p_customer_key
      AND order_id = p_order_id
      AND status IN ('created', 'processing');

    GET DIAGNOSTICS payment_rows = ROW_COUNT;
    IF payment_rows != 1 THEN
        RETURN FALSE;
    END IF;

    UPDATE public.demo_subscriptions
    SET status = 'failed', updated_at = NOW()
    WHERE user_id = p_user_id
      AND customer_key = p_customer_key
      AND pending_order_id = p_order_id
      AND status = 'pending';

    GET DIAGNOSTICS subscription_rows = ROW_COUNT;
    IF subscription_rows != 1 THEN
        RAISE EXCEPTION 'Demo subscription failure did not match one pending row';
    END IF;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.fail_demo_subscription_payment(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_demo_subscription_payment(UUID, TEXT, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_demo_subscription_payment(UUID, TEXT, TEXT, TEXT) TO service_role;
