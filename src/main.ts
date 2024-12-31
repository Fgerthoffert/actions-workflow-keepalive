/* eslint-disable  @typescript-eslint/no-unsafe-assignment */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-argument */

import * as core from '@actions/core'
import { Octokit } from '@octokit/core'
import { paginateGraphQL } from '@octokit/plugin-paginate-graphql'
import {
  filterRepos,
  fetchGitHubOrganization,
  fetchGitHubRepositories
} from './utils/index.js'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const inputGithubToken = core.getInput('token')
  const inputGithubOrgName = core.getInput('org')
  const inputMaxQueryNodes = parseInt(core.getInput('max_query_nodes'), 10)

  const MyOctokit = Octokit.plugin(paginateGraphQL)
  const octokit = new MyOctokit({ auth: inputGithubToken })

  // Get details about the org to verify the user has access and that the org exists
  core.info(`Verifying the org: ${inputGithubOrgName} exists`)
  const githubOrg = await fetchGitHubOrganization(octokit, inputGithubOrgName)

  if (!githubOrg) {
    return
  }

  core.info(
    `Fetching all repositories from org: ${inputGithubOrgName} with ID: ${githubOrg.id}`
  )

  // Fetch all repositories from the organization
  const orgRepos: Repo[] = await fetchGitHubRepositories(
    inputGithubToken,
    githubOrg.id,
    inputMaxQueryNodes
  )

  // Based on the provided filters, filter the repositories before performing any operations on workflows
  const filteredRepos: Repo[] = filterRepos({
    repos: orgRepos,
    filterTopics:
      core.getInput('filter_topics').length > 0
        ? core.getInput('filter_topics').split(',')
        : [],
    filterOperator: core.getInput('filter_operator'),
    filterIgnoreArchived: true
  })

  core.info(
    `After filtering, workflows state will be checked about ${filteredRepos.length} repositories`
  )

  for (const repo of filteredRepos) {
    const repoWorkflowsReponse = await octokit.request(
      'GET /repos/{owner}/{repo}/actions/workflows',
      {
        owner: repo.owner.login,
        repo: repo.name,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
    const repoWorkflows: RepoWorkflows = repoWorkflowsReponse.data
    // Documentation: https://docs.github.com/en/rest/actions/workflows?apiVersion=2022-11-28
    if (repoWorkflows.total_count === 0) {
      core.info(`${repo.nameWithOwner}: No workflows found in the repository`)
    } else {
      core.info(
        `${repo.nameWithOwner}: has ${repoWorkflows.total_count} workflows`
      )
      for (const workflow of repoWorkflows.workflows) {
        core.debug(
          `${repo.nameWithOwner}: workflow ${workflow.name} is: ${workflow.state}`
        )
        if (workflow.state === 'disabled_inactivity') {
          core.info(
            `${repo.nameWithOwner}: workflow ${workflow.name} is disabled due to inactivity, re-enabling it...`
          )
          await octokit.request(
            'PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable',
            {
              owner: repo.owner.login,
              repo: repo.name,
              workflow_id: workflow.id,
              headers: {
                'X-GitHub-Api-Version': '2022-11-28'
              }
            }
          )
        } else if (workflow.state !== 'active') {
          core.info(
            `${repo.nameWithOwner}: workflow ${workflow.name} is not active, state is: ${workflow.state}. No action will be taken`
          )
        }
      }
    }
  }

  core.info(`Done processing repositories`)
}
