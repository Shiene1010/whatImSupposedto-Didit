CREATE TABLE public.github_webhook_deliveries (
    delivery_id UUID PRIMARY KEY,
    repository_full_name TEXT NOT NULL CHECK (length(repository_full_name) > 0),
    event_name TEXT NOT NULL CHECK (event_name = 'push'),
    commit_count INTEGER NOT NULL CHECK (commit_count >= 0),
    pool_file_count INTEGER NOT NULL CHECK (pool_file_count >= 0),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.github_webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_webhook_deliveries FORCE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.github_webhook_deliveries
FROM PUBLIC, anon, authenticated, service_role;

GRANT INSERT ON TABLE public.github_webhook_deliveries TO service_role;
