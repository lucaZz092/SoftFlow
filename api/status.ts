import { handle, json, requireUser } from './_lib/supabase.js';

/** Which integrations have credentials configured (never returns the secrets themselves). */
export const GET = handle(async (request) => {
  await requireUser(request);
  return json({ github: { configured: Boolean(process.env.GITHUB_TOKEN) } });
});
