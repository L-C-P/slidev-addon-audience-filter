# AGENTS.md – slidev-addon-audience-filter

## Project overview

A [Slidev](https://sli.dev) addon that filters slides based on the target audience.
Per-slide visibility is controlled via `showFor` and `hideFor` frontmatter properties.
The active audience is set via the `AUDIENCE` environment variable or the `audience` headmatter field.

- **npm package:** `slidev-addon-audience-filter`
- **GitHub:** `https://github.com/L-C-P/slidev-addon-audience-filter`
- **License:** MIT
- **Author:** Denis Sowa

---

## Project structure

| Path | Description |
|---|---|
| `index.ts` | Main entry point – exports `createAudienceFilterPreparser()` |
| `setup/preparser.ts` | Preparser entry loaded by Slidev when the addon is listed in `addons` (also used by the standalone preview) |
| `setup/vite-plugins.ts` | Vite plugin: `virtual:audience-filter` state module and runtime audience switch via the Vite HMR channel (dev only) |
| `custom-nav-controls.vue` | Presenter nav bar control showing/switching the active audience |
| `slides.md` | Demo/preview slides for this addon |
| `.github/workflows/publish.yml` | CI/CD workflow – publishes to npm on tag push |

---

## Key concepts

- Consumer projects enable the filter by listing the addon in `addons`. This requires Slidev >= 52.17.1, which applies addon preparsers on the initial load (fix for slidevjs/slidev#2646 via PR #2664). `engines.slidev` enforces this.
- Fallback for older Slidev: consumers create their own `setup/preparser.ts` that imports `createAudienceFilterPreparser()` and do not list the addon in `addons`.
- `AUDIENCE=bypass` disables all filtering (useful for IDE editing).
- Runtime switch: the client sends `audience-filter:set` over the Vite HMR channel; the plugin sets `process.env.AUDIENCE` and emits a watcher change on the entry, so Slidev re-parses and the preparser applies the new audience. No HTTP endpoint and nothing in the consumer project is needed.
- Preparser and Vite plugin share state (known audiences, headmatter audience) via a `globalThis` symbol, because Slidev may load them as separate module instances.
- `showFor` and `hideFor` support both comma-separated strings and YAML arrays. Values are case-insensitive.

---

## Publish workflow (CI/CD)

Publishing to npm is fully automated via GitHub Actions using **Trusted Publishing (OIDC)** – no npm token or secret required.

### Trigger
A push of a version tag (`v*`) triggers the workflow in `.github/workflows/publish.yml`.

### Steps to release a new version

1. Ensure the working directory is clean (`git status`)
2. Bump the version and create a tag:
   ```bash
   npm version patch   # or minor / major
   ```
3. Push the commit and tag:
   ```bash
   git push --follow-tags
   ```
4. GitHub Actions picks up the tag and runs `npm publish --provenance --access public` automatically.

### Trusted Publishing setup (already configured)
- Configured on npmjs.com under the package settings → *Trusted Publishers*
- Owner: `L-C-P`, Repository: `slidev-addon-audience-filter`, Workflow: `publish.yml`
- The workflow requires `permissions.id-token: write` for OIDC authentication.

---

## Development

```bash
npm install       # install dependencies
npm run dev       # start Slidev dev server with demo slides
npm run typecheck # run TypeScript type check
```

### Important notes
- Always run `npm version patch/minor/major` from a **clean** working directory.
  If the directory is dirty, use `npm version patch --no-git-tag-version` to bump only `package.json`/`package-lock.json`, then commit manually and tag separately.
- Do not commit `node_modules`.
- All variables, comments, and commit messages must be in **English**.
- German text (e.g. in slides) must use UTF-8 encoded Umlauts.
