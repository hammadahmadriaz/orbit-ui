# Orbit UI

A Tailwind CSS v4 component library with semantic classes, themes and typed React components.

This is the monorepo. The published package lives in [`packages/ui`](./packages/ui) and the documentation site in [`apps/docs`](./apps/docs).

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 for the docs. Changes in `packages/ui` show up there right away.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Library in watch mode plus docs dev server |
| `pnpm build` | Build the library and the docs |
| `pnpm test` | Run component tests |
| `pnpm typecheck` | TypeScript checks |
| `pnpm new:component <name>` | Scaffold a new component (CSS, React, test, docs page) |
| `pnpm changeset` | Describe a change for the next release |

## First publish to npm

1. Create an account on [npmjs.com](https://www.npmjs.com) and run `npm login`.
2. `cd packages/ui && pnpm build && npm publish --access public`

After that, use the automated flow:

1. Push the repo to GitHub.
2. Create an npm **Automation** access token and add it to the GitHub repo as the secret `NPM_TOKEN`.
3. Every PR that changes the library includes a changeset (`pnpm changeset`).
4. Merging to `main` opens a "Version Packages" PR. Merging that publishes to npm and writes the changelog.

## Docs website

Live at **https://hammadahmadriaz.github.io/orbit-ui/**. Every push to `main` rebuilds it with the Docs workflow (GitHub Pages, static export).

To host it on Vercel instead, import the repo and set the root directory to `apps/docs`.

## Security

See [SECURITY.md](./SECURITY.md) for how to report a vulnerability. Releases are built only by GitHub Actions and published with npm provenance.

## License

[MIT](./LICENSE). Anyone can use, copy and modify Orbit UI in their own projects. Changes to this repository go through pull requests reviewed by the maintainer.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how components are built.
