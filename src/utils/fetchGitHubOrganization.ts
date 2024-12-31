import { Octokit } from '@octokit/core'
import * as core from '@actions/core'

export async function fetchGitHubOrganization(
  octokit: Octokit,
  inputGithubOrgName: string
): Promise<Org> {
  try {
    const githubOrgResponse = await octokit.graphql<{
      organization: {
        id: string
        login: string
        url: string
      }
      errors?: { message: string }[]
    }>(
      `
      query ($orgName: String!) {
        organization(login: $orgName) {
          id
          login
          url
        }
      }
      `,
      {
        orgName: inputGithubOrgName
      }
    )
    return githubOrgResponse.organization
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
    throw error
  }
}
