// Read-only GitHub data returned by GET /api/github/overview

export type CheckState = 'SUCCESS' | 'FAILURE' | 'ERROR' | 'PENDING' | 'EXPECTED' | null;

export interface GithubPullRequest {
  number: number;
  title: string;
  url: string;
  repo: string;
  author: string;
  isDraft: boolean;
  updatedAt: string;
  reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
  checks: CheckState;
}

export interface GithubIssue {
  number: number;
  title: string;
  url: string;
  repo: string;
  updatedAt: string;
  labels: { name: string; color: string }[];
}

export interface GithubRepo {
  name: string;
  url: string;
  description: string | null;
  isPrivate: boolean;
  pushedAt: string | null;
  language: { name: string; color: string | null } | null;
  openPullRequests: number;
  openIssues: number;
}

export interface GithubActivity {
  id: string;
  type: string;
  repo: string;
  /** Short human-readable summary, in Portuguese */
  summary: string;
  url: string | null;
  createdAt: string;
}

export interface GithubOverview {
  viewer: { login: string; name: string | null; avatarUrl: string; url: string };
  authoredPullRequests: GithubPullRequest[];
  reviewRequests: GithubPullRequest[];
  assignedIssues: GithubIssue[];
  repos: GithubRepo[];
  activity: GithubActivity[];
  fetchedAt: string;
}

/** Status of a PR or issue linked to a task, from POST /api/github/links */
export interface GithubLinkStatus {
  url: string;
  kind: 'pull' | 'issue';
  title: string;
  number: number;
  repo: string;
  /** OPEN, CLOSED, MERGED (PRs) */
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  isDraft?: boolean;
  checks?: CheckState;
  /** Set when GitHub couldn't resolve the link (no access, deleted, typo) */
  error?: string;
}
