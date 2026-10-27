import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

/** Service-role client: bypasses RLS, only ever used server-side. */
export function getAdmin(): SupabaseClient {
  if (!admin) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configurados.');
    admin = createClient(url, key, { auth: { persistSession: false } });
  }
  return admin;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Resolves the signed-in user from the `Authorization: Bearer <supabase access token>` header
 * and checks they're on the workspace allowlist (public.allowed_emails).
 */
export async function requireUser(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Não autenticado.');
  const db = getAdmin();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'Sessão inválida.');

  const { data: allowed } = await db
    .from('allowed_emails')
    .select('email')
    .eq('email', (data.user.email ?? '').toLowerCase())
    .maybeSingle();
  if (!allowed) throw new HttpError(403, 'Acesso não autorizado.');
  return data.user;
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

/** Wraps a handler so thrown HttpErrors (and unexpected errors) become JSON responses. */
export function handle(fn: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      return await fn(request);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
    }
  };
}
