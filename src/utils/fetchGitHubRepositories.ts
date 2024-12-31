/* eslint-disable  @typescript-eslint/no-unsafe-assignment */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-argument */

import { Octokit } from '@octokit/core'
import * as core from '@actions/core'
import { paginateGraphQL } from '@octokit/plugin-paginate-graphql'

export async function fetchGitHubRepositories(
  inputGithubToken: string,
  orgId: string,
  increment: number
): Promise<Repo[]> {
  const MyOctokit = Octokit.plugin(paginateGraphQL)
  const octokit = new MyOctokit({ auth: inputGithubToken })

  // Get workflows from the repository
  // https://github.com/orgs/community/discussions/56300
  // This is not used as it is less efficient than querying the repositories directly after filtering
  // object(expression: "trunk:.github/workflows/") {
  //   ... on Tree {
  //     entries {
  //       name
  //     }
  //   }
  // }

  let repoResponse = null
  try {
    repoResponse = await octokit.graphql.paginate(
      `
      query ($orgId: ID!, $increment: Int = 30, $cursor: String) {
        node(id: $orgId) {
          ... on Organization {
            ghNode: repositories(first: $increment, after: $cursor) {
              totalCount
              edges {
                cursor
                node {
                  name
                  nameWithOwner
                  id
                  url
                  isArchived
                  repositoryTopics(first: 10) {
                    totalCount
                    edges {
                      node {
                        id
                        topic {
                          id
                          name
                        }
                        url
                      }
                    }
                  }
                  owner {
                    id
                    login
                    url
                  }             
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
      `,
      {
        orgId: orgId,
        increment: increment
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
    throw error
  }

  if (repoResponse.error !== undefined) {
    return []
  }
  const orgRepos: Repo[] = repoResponse.node.ghNode.edges.map(
    (repo: { node: Repo }) => {
      /* eslint-disable-next-line  @typescript-eslint/no-unsafe-return */
      return repo.node
    }
  )

  return orgRepos
}
