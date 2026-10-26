BEGIN;

CREATE TABLE public.demo_test_memberships (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('trial', 'simulated_active', 'cancelled', 'expired')),
    trial_started_at TIMESTAMPTZ NOT NULL,
    trial_ends_at TIMESTAMPTZ NOT NULL,
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (trial_ends_at > trial_started_at),
    CHECK (
        (status = 'simulated_active' AND subscription_started_at IS NOT NULL AND subscription_ends_at IS NOT NULL)
        OR status != 'simulated_active'
    )
);

ALTER TABLE public.demo_test_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_test_memberships FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.demo_test_memberships FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.demo_test_memberships TO service_role;

CREATE TABLE public.demo_test_billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('trial_granted', 'simulated_payment', 'subscription_cancelled')),
    idempotency_key TEXT UNIQUE,
    amount INTEGER NOT NULL DEFAULT 0 CHECK (amount = 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_test_billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_test_billing_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.demo_test_billing_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.demo_test_billing_events TO service_role;
CREATE INDEX demo_test_billing_events_user_id_idx ON public.demo_test_billing_events (user_id);

CREATE OR REPLACE FUNCTION public.grant_demo_test_trial(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    inserted_user UUID;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 1));

    INSERT INTO public.demo_test_memberships (
        user_id, status, trial_started_at, trial_ends_at
    ) VALUES (
        p_user_id, 'trial', NOW(), NOW() + INTERVAL '3 days'
    )
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id INTO inserted_user;

    IF inserted_user IS NULL THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.demo_test_billing_events (user_id, event_type)
    VALUES (p_user_id, 'trial_granted');
    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_demo_test_trial(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_demo_test_trial(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.start_demo_test_subscription(
    p_user_id UUID,
    p_idempotency_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    updated_user UUID;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 1));

    UPDATE public.demo_test_memberships
    SET status = 'expired', updated_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'simulated_active'
      AND subscription_ends_at <= NOW();

    UPDATE public.demo_test_memberships
    SET status = 'simulated_active',
        subscription_started_at = NOW(),
        subscription_ends_at = NOW() + INTERVAL '30 days',
        cancelled_at = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status IN ('trial', 'cancelled', 'expired')
    RETURNING user_id INTO updated_user;

    IF updated_user IS NULL THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.demo_test_billing_events (
        user_id, event_type, idempotency_key, amount
    ) VALUES (
        p_user_id, 'simulated_payment', p_idempotency_key, 0
    );
    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.start_demo_test_subscription(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_demo_test_subscription(UUID, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.cancel_demo_test_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    updated_user UUID;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::TEXT, 1));

    UPDATE public.demo_test_memberships
    SET status = 'cancelled',
        cancelled_at = NOW(),
        subscription_ends_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'simulated_active'
    RETURNING user_id INTO updated_user;

    IF updated_user IS NULL THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.demo_test_billing_events (user_id, event_type)
    VALUES (p_user_id, 'subscription_cancelled');
    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_demo_test_subscription(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_demo_test_subscription(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.delete_demo_test_user_data(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.demo_test_billing_events WHERE user_id = p_user_id;
    DELETE FROM public.demo_test_memberships WHERE user_id = p_user_id;
    DELETE FROM public.demo_subscription_payments WHERE user_id = p_user_id;
    DELETE FROM public.demo_subscriptions WHERE user_id = p_user_id;
    DELETE FROM public.ai_prescriptions WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_demo_test_user_data(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_test_user_data(UUID) TO service_role;

DROP FUNCTION public.reset_demo_account_data();

CREATE FUNCTION public.reset_demo_account_data()
RETURNS TABLE (
    deleted_ai_prescriptions BIGINT,
    deleted_demo_subscriptions BIGINT,
    deleted_demo_subscription_payments BIGINT,
    deleted_demo_test_memberships BIGINT,
    deleted_demo_test_billing_events BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.demo_test_billing_events
    WHERE user_id = '36f604b8-6855-45d1-a9ee-75a94463e6a1'::UUID;
    GET DIAGNOSTICS deleted_demo_test_billing_events = ROW_COUNT;

    DELETE FROM public.demo_test_memberships
    WHERE user_id = '36f604b8-6855-45d1-a9ee-75a94463e6a1'::UUID;
    GET DIAGNOSTICS deleted_demo_test_memberships = ROW_COUNT;

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

REVOKE ALL ON FUNCTION public.reset_demo_account_data() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_demo_account_data() TO service_role;

COMMIT;
