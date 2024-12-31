<!-- markdownlint-disable MD041 -->
<p align="center">
  <img alt="ZenCrepesLogo" src="docs/zencrepes-logo.png" height="140" />
  <h2 align="center">Keepalive Workflows</h2>
  <p align="center">A GitHub Action to keep your workflows alive based 
  on repository topics by re-enableing workflows in the 
  "disabled_inactivity" state</p>
</p>

---

<div align="center">

[![GitHub Super-Linter](https://github.com/fgerthoffert/actions-workflow-keepaline/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/fgerthoffert/actions-workflow-keepaline/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/fgerthoffert/actions-workflow-keepaline/actions/workflows/check-dist.yml/badge.svg)](https://github.com/fgerthoffert/actions-workflow-keepaline/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/fgerthoffert/actions-workflow-keepaline/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/fgerthoffert/actions-workflow-keepaline/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

</div>

---

# About

After a specific time of inactivity, GitHub workflows are automatically disabled
by GitHub, which can be problematic when you have workflow running on schedule
or on events other than commits.

This action looks across all of the repositories of a GitHub organization and
will re-enable workflow having the `disabled_inactivity` state.

## Required privileges

The token used for performing the request must have the following scopes:
['read:org', 'workflows']

# :gear: Configuration

## Input Parameters

The following input parameters are available:

| Parameter       | Default | Description                                                                                                                                                                                                       |
| --------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| org             |         | A GitHub organization to fetch data from                                                                                                                                                                          |
| token           |         | A GitHub Personal API Token with the correct scopes (see above)                                                                                                                                                   |
| filter_topics   |         | A comma separated (no space) list of topics to filter repositories by before fetching all the data. You can specify the "EMPTY", for example to filter by repositories with the "tooling" topic OR without topics |
| filter_operator | AND     | Default operator to apply on filters. Can take "OR" or "AND"                                                                                                                                                      |

## Outputs

No outputs for this action

# :rocket: Usage

## Filter repos

For organizations with a very large number of repositories you might not want to
fetch data about absolutely all repositories, mechanisms are available to filter
repositories by:

- their topics (OR and AND operator available)

## Sample usage

Sample workflow

```yaml
name: Re-enable workflows

on:
  workflow_dispatch:

jobs:
  enable-wf:
    runs-on: ubuntu-latest
    steps:
      - name: Enable Workflows
        # Replace main by the release of your choice
        uses: fgerthoffert/actions-workflow-keepalive@main
        with:
          org: zencrepes
          token: YOUR_TOKEN
```

# How to contribute

- Fork the repository
- npm install
- Rename .env.example into .env
- Update the INPUT\_ variables
- Do your changes
- npx local-action . src/main.ts .env
- npm run bundle
- npm test
- PR into this repository, detailing your changes

More details about GitHub TypeScript action are
[available here](https://github.com/actions/typescript-action)
