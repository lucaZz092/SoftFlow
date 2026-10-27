import { HttpError } from './supabase.js';

export function requireGithubToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new HttpError(503, 'GITHUB_TOKEN não configurado na Vercel.');
  return token;
}

export async function github<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'SoftFlow',
      ...init?.headers,
    },
  });
  if (response.status === 401) throw new HttpError(502, 'GITHUB_TOKEN inválido ou expirado.');
  if (!response.ok) throw new HttpError(502, `GitHub respondeu ${response.status}.`);
  return response.json() as Promise<T>;
}

export async function graphql<T>(token: string, query: string, variables?: Record<string, unknown>) {
  const { data, errors } = await github<{ data: T | null; errors?: { message: string }[] }>(token, '/graphql', {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  });
  return { data, errors };
}
