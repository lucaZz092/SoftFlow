import type { CheckState, GithubLinkStatus } from '../../src/types/github.js';
import { parseGithubLink, type ParsedGithubLink } from '../../src/lib/githubLinks.js';
import { graphql, requireGithubToken } from '../_lib/github.js';
import { handle, HttpError, json, requireUser } from '../_lib/supabase.js';

/**
 * Status of the GitHub PRs/issues linked to tasks.
 * Body: { urls: string[] } (max 30). One GraphQL request, one aliased field per link.
 */

const MAX_LINKS = 30;

interface ResourceNode {
  __typename: 'PullRequest' | 'Issue';
  title: string;
  number: number;
  state: GithubLinkStatus['state'];
  isDraft?: boolean;
  repository: { nameWithOwner: string };
  commits?: { nodes: { commit: { statusCheckRollup: { state: CheckState } | null } }[] };
}

const fieldFor = (link: ParsedGithubLink, alias: string) => {
  const target = link.kind === 'pull' ? 'pullRequest' : 'issue';
  const extra =
    link.kind === 'pull' ? 'isDraft commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }' : '';
  // owner/repo come from a strict regex ([\w.-]+), so they're safe to inline as JSON strings
  return `${alias}: repository(owner: ${JSON.stringify(link.owner)}, name: ${JSON.stringify(link.repo)}) {
    ${target}(number: ${link.number}) { __typename title number state ${extra} repository { nameWithOwner } }
  }`;
};

export const POST = handle(async (request) => {
  await requireUser(request);
  const token = requireGithubToken();

  const { urls } = (await request.json()) as { urls?: unknown };
  if (!Array.isArray(urls)) throw new HttpError(400, 'urls deve ser uma lista.');

  const links = [...new Set(urls.filter((u): u is string => typeof u === 'string'))]
    .slice(0, MAX_LINKS)
    .map(parseGithubLink)
    .filter((l): l is ParsedGithubLink => l !== null);
  if (links.length === 0) return json({ links: [] });

  const query = `query { ${links.map((l, i) => fieldFor(l, `l${i}`)).join('\n')} }`;
  // Partial errors (e.g. one repo without access) still return data for the other links
  const { data } = await graphql<Record<string, Record<string, ResourceNode | null> | null>>(token, query);

  const result: GithubLinkStatus[] = links.map((link, i) => {
    const repoNode = data?.[`l${i}`];
    const node = repoNode?.[link.kind === 'pull' ? 'pullRequest' : 'issue'];
    if (!node) {
      return {
        url: link.url,
        kind: link.kind,
        title: `${link.owner}/${link.repo}#${link.number}`,
        number: link.number,
        repo: `${link.owner}/${link.repo}`,
        state: 'OPEN',
        error: 'Não encontrado ou sem acesso pelo token.',
      };
    }
    return {
      url: link.url,
      kind: link.kind,
      title: node.title,
      number: node.number,
      repo: node.repository.nameWithOwner,
      state: node.state,
      isDraft: node.isDraft,
      checks: node.commits?.nodes[0]?.commit.statusCheckRollup?.state ?? null,
    };
  });

  return json({ links: result });
});
