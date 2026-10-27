import type {
  CheckState,
  GithubActivity,
  GithubIssue,
  GithubOverview,
  GithubPullRequest,
  GithubRepo,
} from '../../src/types/github.js';
import { github, graphql, requireGithubToken } from '../_lib/github.js';
import { handle, HttpError, requireUser } from '../_lib/supabase.js';

/**
 * Read-only snapshot of the token owner's GitHub: their PRs, review requests,
 * assigned issues, recently pushed repositories and recent activity.
 * Uses GITHUB_TOKEN (a personal access token with read access), kept server-side.
 */

const PR_FIELDS = `
  number title url isDraft updatedAt reviewDecision
  author { login }
  repository { nameWithOwner }
  commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
`;

const QUERY = `
query {
  viewer {
    login name avatarUrl url
    repositories(first: 20, orderBy: { field: PUSHED_AT, direction: DESC }, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]) {
      nodes {
        nameWithOwner url description isPrivate pushedAt
        primaryLanguage { name color }
        pullRequests(states: OPEN) { totalCount }
        issues(states: OPEN) { totalCount }
      }
    }
  }
  authored: search(query: "is:pr is:open author:@me archived:false sort:updated-desc", type: ISSUE, first: 20) {
    nodes { ... on PullRequest { ${PR_FIELDS} } }
  }
  reviews: search(query: "is:pr is:open review-requested:@me archived:false sort:updated-desc", type: ISSUE, first: 20) {
    nodes { ... on PullRequest { ${PR_FIELDS} } }
  }
  issues: search(query: "is:issue is:open assignee:@me archived:false sort:updated-desc", type: ISSUE, first: 20) {
    nodes {
      ... on Issue {
        number title url updatedAt
        repository { nameWithOwner }
        labels(first: 5) { nodes { name color } }
      }
    }
  }
}`;

interface PrNode {
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  updatedAt: string;
  reviewDecision: GithubPullRequest['reviewDecision'];
  author: { login: string } | null;
  repository: { nameWithOwner: string };
  commits: { nodes: { commit: { statusCheckRollup: { state: CheckState } | null } }[] };
}

interface QueryResult {
  viewer: {
    login: string;
    name: string | null;
    avatarUrl: string;
    url: string;
    repositories: {
      nodes: {
        nameWithOwner: string;
        url: string;
        description: string | null;
        isPrivate: boolean;
        pushedAt: string | null;
        primaryLanguage: { name: string; color: string | null } | null;
        pullRequests: { totalCount: number };
        issues: { totalCount: number };
      }[];
    };
  };
  authored: { nodes: PrNode[] };
  reviews: { nodes: PrNode[] };
  issues: {
    nodes: {
      number: number;
      title: string;
      url: string;
      updatedAt: string;
      repository: { nameWithOwner: string };
      labels: { nodes: { name: string; color: string }[] };
    }[];
  };
}

const toPr = (n: PrNode): GithubPullRequest => ({
  number: n.number,
  title: n.title,
  url: n.url,
  repo: n.repository.nameWithOwner,
  author: n.author?.login ?? '',
  isDraft: n.isDraft,
  updatedAt: n.updatedAt,
  reviewDecision: n.reviewDecision,
  checks: n.commits.nodes[0]?.commit.statusCheckRollup?.state ?? null,
});

interface RawEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: Record<string, any>;
}

/** Turns a GitHub event into a one-line summary; returns null for event types we don't show. */
function toActivity(e: RawEvent): GithubActivity | null {
  const repoUrl = `https://github.com/${e.repo.name}`;
  const p = e.payload;
  const base = { id: e.id, type: e.type, repo: e.repo.name, createdAt: e.created_at };
  const branch = typeof p.ref === 'string' ? p.ref.replace('refs/heads/', '') : '';

  switch (e.type) {
    case 'PushEvent': {
      const count = p.size ?? p.commits?.length;
      return {
        ...base,
        summary: count ? `${count} ${count === 1 ? 'commit' : 'commits'} em ${branch}` : `Push em ${branch}`,
        url: `${repoUrl}/commits/${branch}`,
      };
    }
    case 'PullRequestEvent': {
      const pr = p.pull_request ?? {};
      const action = p.action === 'closed' && pr.merged ? 'mesclou' : ({ opened: 'abriu', closed: 'fechou', reopened: 'reabriu' } as Record<string, string>)[p.action];
      return action ? { ...base, summary: `${action[0].toUpperCase()}${action.slice(1)} o PR #${pr.number}: ${pr.title ?? ''}`, url: pr.html_url ?? repoUrl } : null;
    }
    case 'PullRequestReviewEvent':
      return { ...base, summary: `Revisou o PR #${p.pull_request?.number}`, url: p.review?.html_url ?? repoUrl };
    case 'IssuesEvent': {
      const action = ({ opened: 'Abriu', closed: 'Fechou', reopened: 'Reabriu' } as Record<string, string>)[p.action];
      return action ? { ...base, summary: `${action} a issue #${p.issue?.number}: ${p.issue?.title ?? ''}`, url: p.issue?.html_url ?? repoUrl } : null;
    }
    case 'IssueCommentEvent':
      return { ...base, summary: `Comentou em #${p.issue?.number}`, url: p.comment?.html_url ?? repoUrl };
    case 'CreateEvent':
      return {
        ...base,
        summary: p.ref_type === 'repository' ? 'Criou o repositório' : `Criou ${p.ref_type === 'tag' ? 'a tag' : 'a branch'} ${p.ref}`,
        url: repoUrl,
      };
    case 'ReleaseEvent':
      return { ...base, summary: `Publicou a release ${p.release?.tag_name ?? ''}`, url: p.release?.html_url ?? repoUrl };
    default:
      return null;
  }
}

export const GET = handle(async (request) => {
  await requireUser(request);
  const token = requireGithubToken();

  const { data, errors } = await graphql<QueryResult>(token, QUERY);
  if (!data) throw new HttpError(502, errors?.[0]?.message ?? 'Resposta inesperada do GitHub.');

  const events = await github<RawEvent[]>(token, `/users/${data.viewer.login}/events?per_page=50`);

  const repos: GithubRepo[] = data.viewer.repositories.nodes.map((r) => ({
    name: r.nameWithOwner,
    url: r.url,
    description: r.description,
    isPrivate: r.isPrivate,
    pushedAt: r.pushedAt,
    language: r.primaryLanguage,
    openPullRequests: r.pullRequests.totalCount,
    openIssues: r.issues.totalCount,
  }));

  const assignedIssues: GithubIssue[] = data.issues.nodes
    .filter((n) => n.number)
    .map((n) => ({
      number: n.number,
      title: n.title,
      url: n.url,
      repo: n.repository.nameWithOwner,
      updatedAt: n.updatedAt,
      labels: n.labels.nodes,
    }));

  const overview: GithubOverview = {
    viewer: { login: data.viewer.login, name: data.viewer.name, avatarUrl: data.viewer.avatarUrl, url: data.viewer.url },
    // Search can return non-PR nodes as empty objects; keep only real PRs
    authoredPullRequests: data.authored.nodes.filter((n) => n.number).map(toPr),
    reviewRequests: data.reviews.nodes.filter((n) => n.number).map(toPr),
    assignedIssues,
    repos,
    activity: events.map(toActivity).filter((a): a is GithubActivity => a !== null).slice(0, 25),
    fetchedAt: new Date().toISOString(),
  };

  return Response.json(overview, { headers: { 'Cache-Control': 'private, max-age=60' } });
});
