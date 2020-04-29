# Helm GH-Pages Action

This is a GitHub Action that publishes Helm charts to a Helm repository hosted on GitHub Pages.

The Helm gh-pages action takes 3 arguments:

* Helm chart path (required)
* GitHub Pages URL (required)
* Git tag (optional)

> **Note:** Your git repository must have a `gh-pages` branch published on GitHub Pages.

## Workflow

Package and push the Helm chart located at `chart/name` to the `gh-pages` branch:

```tf
workflow "Publish Helm chart" {
  on = "push"
  resolves = ["Helm gh-pages"]
}

action "Helm gh-pages" {
  uses = "sylus/gh-actions/helm-gh-pages@master"
  args = ["chart/name","https://user.github.io/name"]
  secrets = ["GITHUB_TOKEN"]
}
```

## Usage

Assuming your GitHub repository has a Helm chart named `name` located at `chart/name`:

```sh
> git commit -m "Bump chart version to v0.0.1"
> git push origin master
> git tag v0.0.1
> git push origin v1.0.0
```

GitHub will start the workflow and helm-gh-pages will do the following:

* check out the `v0.0.1` tag
* validate the chart by running Helm lint
* package the chart to `/github/home/pkg/name-0.0.1.tgz`
* checks out the `gh-pages` branch
* copies the `name-0.0.1.tgz` from `/github/home` to `/github/workspace`
* updates the Helm repository index using the GitHub pages URL
* commits the chart package and the Helm repository index
* pushed the changes to `gh-pages` using the GitHub token secret
