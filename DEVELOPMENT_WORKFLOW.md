# EPIPHANY Development Workflow

## Batch development and deployment

To reduce unnecessary Vercel deployments and avoid hitting the Hobby deployment rate limit, work in batches instead of publishing after every small change.

1. **Inspect and plan:** review related files and group compatible fixes and improvements.
2. **Implement as a batch:** make several related changes locally before pushing.
3. **Test locally:** run the relevant fast checks while working. Before publishing, run:
   ```bash
   npm run stamp
   npm test
   ```
   Follow the setup instructions in `CONTRIBUTING.md` if this is a fresh environment.
4. **Review:** inspect the final diff, check for regressions, and confirm that all intended changes are included.
5. **Publish once:** push the completed batch to GitHub so Vercel does not receive a separate update for every small edit.

## Important exceptions

- Fix critical bugs and security issues promptly; do not leave them broken just to wait for a batch.
- Do not skip the required checks in `CONTRIBUTING.md`.
- Prefer local checks and GitHub Actions during development. Use Vercel deployments for validating completed batches, not as the test loop for every tiny change.
- This workflow reduces avoidable deployments; it does not guarantee a particular Vercel quota or reset time.

## Related instructions

See `CONTRIBUTING.md` for the required per-change checks, test coverage, navigation rules, asset registration, and other coding safeguards.
