import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWebhookHandler } from './webhookHandler.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(createWebhookHandler({
  secret: Deno.env.get('GITHUB_WEBHOOK_SECRET'),
  persist: async (delivery) => {
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Supabase Edge Function credentials are not configured');
      return { code: 'CONFIG_MISSING' };
    }

    const { error } = await createClient(supabaseUrl, serviceRoleKey)
      .from('github_webhook_deliveries')
      .insert(delivery);

    return error ? { code: error.code, message: error.message } : null;
  },
}));
