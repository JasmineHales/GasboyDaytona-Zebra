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
remote-off/                 ← upload this folder (repo root only)
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
