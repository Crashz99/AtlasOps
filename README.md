# AtlasOps — Rehauled

AtlasOps is a configurable operations workspace for organisations that need to collect structured information, manage records, map activity and understand what is happening across their operation.

This repository is a clean rebuild of the original static Express/SQLite prototype. It intentionally does **not** carry forward the fixed Activity / Incident / Tracking form model, Group A / Group B constraints, offline map tiles, local SQLite databases, session files, generated credentials or duplicated page-level JavaScript.

## What changed

- Next.js App Router + React + TypeScript, ready for Vercel.
- One reusable workspace shell instead of many standalone HTML pages.
- Unlimited custom forms.
- Unlimited fields per form.
- Unlimited options for single-select and multi-select fields.
- Form versioning.
- Universal dynamic record renderer.
- Universal records ledger with search, filters and JSON/CSV export.
- Online-only Leaflet maps.
- Dark, street, terrain and satellite online basemaps.
- Organisation locations, record-derived points and custom map markers as separate layers.
- Online place search on the full map.
- Dashboard mini-map uses the same live map data model.
- Flexible organisation hierarchy with no fixed Group A / Group B or five-level limit.
- Role-aware workspace experience: Members get a simplified work view, Owners/Admins get a separate Organisation setup hub, and Viewers remain read-only.
- Team / membership UI with Owner, Admin, Member and Viewer roles.
- Schema-aware analytics that can break down any compatible custom field.
- Fictional Northstar Facilities UK demo workspace with records and map data prefilled.
- Contextual guidance strips throughout the product plus a real interactive spotlight tour with animated arrows and action-based progression.
- Demo-only role preview switcher so the Owner/Admin/Member/Viewer experiences can be tested without real authentication; the guided tour explicitly walks Member → Admin → Member.
- Brighter interactive visual layer with a globe/orbit AtlasOps identity, branded globe cursor and pointer-reactive ambient background.
- Manrope body typography with Space Grotesk display typography instead of the previous generic Inter/system stack.
- Workspace accent colour and default map layer settings.

## Map policy

There are **no local/offline tile files** and no offline fallback. AtlasOps currently exposes four online providers:

- CARTO dark basemap
- OpenStreetMap standard tiles
- OpenTopoMap terrain
- Esri World Imagery satellite

Provider attribution is displayed through Leaflet. For a commercial production deployment, review each provider's current usage policy and replace the demo defaults with a provider/account appropriate for your expected traffic.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

The app uses standard Next.js conventions and contains `vercel.json` with the Next.js framework selected.

1. Push this folder to a Git repository.
2. Import the repository into Vercel.
3. Keep the default Next.js build settings.
4. Deploy.

No database or secret is required for the current product/demo build.

## Persistence in this build

The rehaul deliberately separates the **product/UI architecture** from the legacy SQLite persistence model. Workspaces are persisted in browser `localStorage` in this build so:

- the app can be deployed to Vercel immediately;
- the interactive demo works without credentials or infrastructure;
- custom forms/records/structure/settings are genuinely usable during product iteration;
- no old database, credential or session artefacts are carried into the new repository.

This is not the final multi-user persistence or authentication layer. The UI now behaves according to the selected organisation member role, but the demo role switcher is intentionally a prototype mechanism. Before production team usage, replace `lib/workspace-storage.ts` with a server-backed adapter (recommended: PostgreSQL/Neon or equivalent) and connect real sign-in so the server resolves the signed-in user's organisation membership and role automatically. The UI/data model has already been structured around workspaces, form IDs, form versions and membership roles so that migration does not require returning to the old fixed-form model.

## Key routes

- `/` — product landing page
- `/workspace/demo` — populated fictional UK demo
- `/workspace/[workspaceId]` — organisation overview
- `/workspace/[workspaceId]/submit` — simple worker-facing form launcher
- `/workspace/[workspaceId]/setup` — Owner/Admin organisation setup hub
- `/workspace/[workspaceId]/forms` — Owner/Admin universal form builder
- `/workspace/[workspaceId]/records` — universal ledger
- `/workspace/[workspaceId]/map` — online operational map
- `/workspace/[workspaceId]/analytics` — schema-aware analytics
- `/workspace/[workspaceId]/structure` — hierarchy and saved locations
- `/workspace/[workspaceId]/team` — organisation members
- `/workspace/[workspaceId]/settings` — branding and map defaults

## Security / sanitisation

The old archive contained runtime database/session/credential artefacts. None are included here. `.gitignore` explicitly excludes `.env`, SQLite databases and the previous generated first-run credential file name.

Do not restore the old `atlasops.db`, `sessions.db` or `FIRST_RUN_ADMIN_LOGIN.txt` into this repository.

## Product principle

The application code should never need to know which forms an organisation has.

Forms, fields, options, organisation structure and map data are workspace configuration. AtlasOps provides the infrastructure around them.
