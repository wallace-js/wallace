# Canary

This app checks that Wallace is installable, so it is not a workspace.

`npm test` (or `npm run test:canary` from the repo root) packs `wallace` and
`babel-plugin-wallace` as they would be published, installs them into a copy of this app
outside the repo, then type checks it and builds it. See `test.mjs`.
