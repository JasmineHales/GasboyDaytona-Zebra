# Vercel — Daytona-Gasboyboy-V2

## Required repo contents

The app **will not build** unless **all upload batches** are on GitHub (or you `git push` the full project).

Minimum root files on GitHub:

- `package.json`, `package-lock.json`
- `index.html`, `vite.config.ts`, `vercel.json`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`

## Vercel project settings

| Setting | Value |
|---------|--------|
| Framework Preset | **Vite** |
| Root Directory | `.` (leave blank) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | **20.x** |

`vercel.json` in the repo sets these automatically when present.

## If deploy fails

1. **Confirm all 4 batch zips** were uploaded (see `scripts/prepare-github-upload-batches.sh`).
2. On GitHub, check `src/main.tsx` and `vite.config.ts` exist.
3. Redeploy in Vercel → **Deployments** → **Redeploy**.
4. Open the failed deployment → **Building** log and look for the first red `error` line.

## Git push (recommended)

Web upload is easy to incomplete. Prefer:

```bash
git push -u origin refs/heads/v2:refs/heads/v2
```

Then in Vercel set **Production Branch** to `v2` (or `main` if you merged).
