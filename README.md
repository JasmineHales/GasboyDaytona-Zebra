# Remote Off — Gasboy Daytona MVP

Hertz **Daytona** field-app prototype for transport, VSA, and remote fueling workflows.

| | |
|---|---|
| **Local folder** | `remote-off` |
| **GitHub repo** | [Gasboy-Daytona-MVP](https://github.com/JasmineHales/Gasboy-Daytona-MVP) |
| **Active branch** | `v2` |
| **Version** | 2.0.0 |

## Folder layout

```
remote-off/                 ← repo root (do not drag the whole folder to GitHub — see Upload)
├── public/                 Static assets
├── scripts/                Dev helpers (emulator, phone link)
├── src/
│   ├── components/         UI screens and widgets
│   │   ├── dev/            Dev panel (sidebar for demos)
│   │   ├── fuel/           Fueling flow
│   │   ├── home/           Home workflow cards
│   │   └── …
│   ├── hooks/              Flow and tutorial state
│   ├── types/              TypeScript models
│   └── utils/              Navigation, progress, dev toggles
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

Do **not** add duplicate copies of this project (e.g. `*-upload/` folders or `.zip` exports) inside the repo.

## Upload to GitHub

**If GitHub says the folder is too big**, you are probably uploading the whole project including `node_modules/` (~120 MB). GitHub’s web uploader is meant for source only.

**Option A — Git (recommended)**

```bash
git push origin refs/heads/v2:refs/heads/v2
```

**Option B — Web upload (source only, ~3 MB)**

```bash
./scripts/prepare-github-upload.sh
```

That creates `../remote-off-github-upload.zip` next to this folder. Upload the zip on GitHub, or drag only the **source files** (not `node_modules/`, `dist/`, or `.git/`).

After upload, recipients run `npm install` then `npm run dev`.

## Quick start

```bash
npm install
npm run dev
```

Open on desktop — the **dev panel** (left sidebar) lets you switch pages, scenario toggles, and widget states for stakeholder reviews.

## Workflows

| Page | Description |
|------|-------------|
| Login | Device or browser SSO |
| Home | Entry to Transport, VSA, Fueling |
| Transport | Movement + fuel |
| VSA | Cleaning + fuel + optional stall |
| Fueling | Fuel-only page |
| Tracking | Click analytics (dev) |

## Build

```bash
npm run build
npm run preview
```
