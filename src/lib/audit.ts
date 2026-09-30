import { supabase } from './supabase';

export async function logAction(
  action: string,
  opts: { entity?: string; entityId?: string; details?: Record<string, unknown> } = {}
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('audit_logs').insert({
      actor_id: session?.user.id ?? null,
      actor_email: session?.user.email ?? null,
      action,
      entity: opts.entity ?? null,
      entity_id: opts.entityId ?? null,
      details: opts.details ?? {},
      user_agent: navigator.userAgent,
    });
  } catch (err) {
    console.error('audit log failed', err);
  }
}