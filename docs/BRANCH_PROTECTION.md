# Recommended GitHub branch protection

The connected automation does not have repository-administration permission to change branch protection. Configure this manually for `main`.

Recommended rules:

- Require a pull request before merging.
- Require at least 1 approving review for production work.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merge.
- Require branches to be up to date before merge.
- Require these checks:
  - **GoAR CI / core-and-typecheck**
  - **GoAR Security Health / health**
- Block force pushes.
- Block branch deletion.
- Restrict direct pushes to `main`.
- Require signed commits where practical.

For urgent fixes, use a short-lived hotfix branch and the same required checks rather than bypassing `main` protections.
