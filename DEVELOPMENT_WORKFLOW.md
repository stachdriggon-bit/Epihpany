# EPIPHANY Development Workflow

## Batch development and validation

To reduce unnecessary deployments and avoid hitting the Vercel Hobby deployment rate limit, work in coherent batches instead of publishing after every small edit.

1. **Inspect and plan:** review the current `main` branch and the related files; group compatible fixes.
2. **Implement as a batch:** make the changes together and avoid unrelated product or content changes.
3. **Validate locally:** use the fast checks while iterating, then run the full checks before considering the batch complete:
   ```bash
   npm run test:fast
   npm run check
   ```
   `npm run check` runs the asset-reference validator and then the complete unit/static and Chromium browser suites. See `CONTRIBUTING.md` for the exact coverage and setup.
4. **Review:** inspect the final diff, verify that the intended files and cache registrations are included, and check for regressions.
5. **Integrate once:** push the completed batch to GitHub and use GitHub Actions as the authoritative CI result. Avoid repeated deployment attempts as a substitute for local or CI testing.

## Asset-version note

`npm run stamp` is the name of the existing validation command; it does not generate or update versions. Update the relevant `?v=` references and service-worker cache name/allowlists manually when required, then run the validator to catch missing or unstamped local assets.

## Important exceptions

- Fix critical bugs and security issues promptly; do not leave them broken just to wait for a batch.
- Do not skip the required checks in `CONTRIBUTING.md`.
- Prefer local checks and GitHub Actions during development. Do not use Vercel deployments as the test loop for individual changes.
- Batching reduces avoidable deployment attempts; it does not guarantee a particular Vercel quota or reset time.

## Related instructions

See `CONTRIBUTING.md` for test coverage, navigation rules, asset registration, offline behavior and other coding safeguards.
