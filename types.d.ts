interface RateLimit {
  limit: number
  cost: number
  remaining: number
  resetAt: string | null
}

interface RateLimitResponse {
  rateLimit: RateLimit
}

interface GhNode {
  totalCount: number
  edges: {
    cursor: string
    node: Repo
  }[]
}

interface GitHubNode {
  id: string
}

interface BaseQueryResponse {
  rateLimit: RateLimit
  viewer?: {
    ghNode: GhNode
  }
  node?: {
    ghNode: GhNode
  }
  nodes?: GitHubNode[]
}

interface Org {
  id: string
  login: string
  id: string
}

interface OrgResponse {
  organization: Org
  rateLimit: RateLimit
}

interface RepoCustomProperties {
  totalCount: number
  edges: {
    node: {
      name: string
      values: string[]
    }
  }[]
}

interface RepoTopics {
  totalCount: number
  edges: {
    node: {
      topic: {
        name: string
      }
    }
  }[]
}

interface Repo {
  id: string
  name: string
  nameWithOwner: string
  isArchived: boolean
  owner: {
    login: string
  }
  customProperties: RepoCustomProperties
  repositoryTopics: RepoTopics
}

interface GraphQLApiResponse {
  data: {
    rateLimit: RateLimit
  }
}

interface RepoWorkflows {
  total_count: number
  workflows: Workflow[]
}

interface Workflow {
  id: number
  node_id: string
  name: string
  path: string
  state:
    | 'active'
    | 'deleted'
    | 'disabled_fork'
    | 'disabled_inactivity'
    | 'disabled_manually'
  created_at: string
  updated_at: string
  url: string
  html_url: string
  badge_url: string
  deleted_at?: string
}
