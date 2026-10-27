export interface ParsedGithubLink {
  owner: string;
  repo: string;
  kind: 'pull' | 'issue';
  number: number;
  url: string;
}

/** Accepts github.com PR and issue URLs (with or without trailing paths like /files). */
export function parseGithubLink(input: string): ParsedGithubLink | null {
  const match = input.trim().match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/(pull|issues)\/(\d+)/i);
  if (!match) return null;
  const [, owner, repo, kind, num] = match;
  const k = kind.toLowerCase() === 'pull' ? 'pull' : 'issue';
  return {
    owner,
    repo,
    kind: k,
    number: Number(num),
    url: `https://github.com/${owner}/${repo}/${k === 'pull' ? 'pull' : 'issues'}/${num}`,
  };
}
