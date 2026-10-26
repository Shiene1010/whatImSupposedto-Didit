CREATE TABLE public.demo_subscriptions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider = 'toss'),
    plan_code TEXT NOT NULL CHECK (plan_code = 'demo_30d_1000'),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'failed')),
    customer_key TEXT NOT NULL UNIQUE,
    pending_order_id TEXT NOT NULL UNIQUE,
    payment_key TEXT,
    amount INTEGER NOT NULL CHECK (amount = 1000),
    period_started_at TIMESTAMPTZ,
    period_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (status = 'active' AND period_started_at IS NOT NULL AND period_ends_at IS NOT NULL)
        OR status != 'active'
    )
);

ALTER TABLE public.demo_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_subscriptions FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.demo_subscriptions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.demo_subscriptions TO authenticated;
GRANT ALL ON TABLE public.demo_subscriptions TO service_role;

CREATE POLICY "시연 계정은 자신의 구독 상태만 조회할 수 있다"
ON public.demo_subscriptions
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE TABLE public.demo_subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_key TEXT NOT NULL,
    order_id TEXT NOT NULL UNIQUE,
    payment_key TEXT,
    amount INTEGER NOT NULL CHECK (amount = 1000),
    status TEXT NOT NULL CHECK (status IN ('created', 'processing', 'done', 'failed', 'indeterminate')),
    provider_code TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_subscription_payments FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.demo_subscription_payments FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.demo_subscription_payments TO service_role;

CREATE INDEX demo_subscription_payments_user_id_idx
ON public.demo_subscription_payments (user_id);

CREATE OR REPLACE FUNCTION public.prepare_demo_subscription_payment(
    p_user_id UUID,
    p_customer_key TEXT,
    p_order_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 0));

    UPDATE public.demo_subscriptions
    SET status = 'expired', updated_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'active'
      AND period_ends_at <= NOW();

    IF EXISTS (
        SELECT 1
        FROM public.demo_subscriptions
        WHERE user_id = p_user_id
          AND status IN ('active', 'pending')
    ) THEN
        RETURN FALSE;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.demo_subscription_payments
        WHERE user_id = p_user_id
          AND status IN ('processing', 'indeterminate')
    ) THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.demo_subscription_payments (
        user_id, customer_key, order_id, amount, status
    ) VALUES (
        p_user_id, p_customer_key, p_order_id, 1000, 'created'
    );

    INSERT INTO public.demo_subscriptions (
        user_id, provider, plan_code, status, customer_key, pending_order_id, amount
    ) VALUES (
        p_user_id, 'toss', 'demo_30d_1000', 'pending', p_customer_key, p_order_id, 1000
    )
    ON CONFLICT (user_id) DO UPDATE
    SET provider = EXCLUDED.provider,
        plan_code = EXCLUDED.plan_code,
        status = EXCLUDED.status,
        customer_key = EXCLUDED.customer_key,
        pending_order_id = EXCLUDED.pending_order_id,
        payment_key = NULL,
        amount = EXCLUDED.amount,
        period_started_at = NULL,
        period_ends_at = NULL,
        updated_at = NOW();

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_demo_subscription_payment(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prepare_demo_subscription_payment(UUID, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_demo_subscription_payment(UUID, TEXT, TEXT) TO service_role;

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

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.fail_demo_subscription_payment(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_demo_subscription_payment(UUID, TEXT, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_demo_subscription_payment(UUID, TEXT, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_demo_subscription_payment(
    p_user_id UUID,
    p_customer_key TEXT,
    p_order_id TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
    WITH claimed AS (
        UPDATE public.demo_subscription_payments
        SET status = 'processing', updated_at = NOW()
        WHERE user_id = p_user_id
          AND customer_key = p_customer_key
          AND order_id = p_order_id
          AND status = 'created'
        RETURNING 1
    )
    SELECT EXISTS (SELECT 1 FROM claimed);
$$;

REVOKE ALL ON FUNCTION public.claim_demo_subscription_payment(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_demo_subscription_payment(UUID, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_demo_subscription_payment(UUID, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.complete_demo_subscription_payment(
    p_user_id UUID,
    p_customer_key TEXT,
    p_order_id TEXT,
    p_payment_key TEXT,
    p_approved_at TIMESTAMPTZ
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
    SET status = 'done',
        payment_key = p_payment_key,
        approved_at = p_approved_at,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND customer_key = p_customer_key
      AND order_id = p_order_id
      AND status = 'processing';

    GET DIAGNOSTICS payment_rows = ROW_COUNT;
    IF payment_rows != 1 THEN
        RETURN FALSE;
    END IF;

    UPDATE public.demo_subscriptions
    SET status = 'active',
        payment_key = p_payment_key,
        period_started_at = p_approved_at,
        period_ends_at = p_approved_at + INTERVAL '30 days',
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND customer_key = p_customer_key
      AND pending_order_id = p_order_id
      AND status = 'pending';

    GET DIAGNOSTICS subscription_rows = ROW_COUNT;
    IF subscription_rows != 1 THEN
        RAISE EXCEPTION 'Demo subscription completion did not match one pending row';
    END IF;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_demo_subscription_payment(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_demo_subscription_payment(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_demo_subscription_payment(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO service_role;

DROP FUNCTION public.reset_demo_account_data();

CREATE FUNCTION public.reset_demo_account_data()
RETURNS TABLE (
    deleted_ai_prescriptions BIGINT,
    deleted_demo_subscriptions BIGINT,
    deleted_demo_subscription_payments BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.demo_subscription_payments
    WHERE user_id = '36f604b8-6855-45d1-a9ee-75a94463e6a1'::UUID;
    GET DIAGNOSTICS deleted_demo_subscription_payments = ROW_COUNT;

    DELETE FROM public.demo_subscriptions
    WHERE user_id = '36f604b8-6855-45d1-a9ee-75a94463e6a1'::UUID;
    GET DIAGNOSTICS deleted_demo_subscriptions = ROW_COUNT;

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
    'Deletes app and test-subscription records for the fixed demo account; does not delete the Auth user.';
