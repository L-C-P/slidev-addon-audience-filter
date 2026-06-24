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
| `setup/preparser.ts` | Standalone preview entry (used when running this addon's own `slides.md`) |
| `slides.md` | Demo/preview slides for this addon |
| `.github/workflows/publish.yml` | CI/CD workflow – publishes to npm on tag push |

---

## Key concepts

- The Slidev preparser runs only from the **project root** on initial load. Addon preparsers are resolved too late.
- Consumer projects must create their own `setup/preparser.ts` that imports `createAudienceFilterPreparser()`.
- `AUDIENCE=bypass` disables all filtering (useful for IDE editing).
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
