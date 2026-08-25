# 0.11.0: README.ja.md and version consistency checks

## Summary

Bubble 0.11.0 standardizes the Japanese README filename as `README.ja.md` and adds repository checks that keep the README, generated Pages, CDN URLs, companion versions, package metadata, and package archive contents aligned.

## Compatibility

- Runtime behavior, block opcodes, Composition API exports, and rendering behavior are unchanged.
- The former `README_ja.md` file was renamed to `README.ja.md`.
- The direct SVG Text dependency remains pinned to `0.8.1` because that is the latest publishable registry version during this release preparation.
- The recommended companion versions are Asset Manager 0.13.0, Async Input 0.5.0, and Runtime Expression 0.4.0.

## Verification

- `pnpm run check`
- `pnpm run release:check`

## Rollback

If the README rename breaks external documentation links, revert this release commit and republish a patch that restores `README_ja.md`. Do not silently bypass the version checks; adjust `repo-policy.json` when the verified companion matrix changes.
