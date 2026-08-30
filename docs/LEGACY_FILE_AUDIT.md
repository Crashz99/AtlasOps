# Legacy AtlasOps file audit → rehaul disposition

The original archive was treated as a source of product ideas, not as a page-by-page migration target.

| Legacy file / area | Rehaul disposition |
|---|---|
| `public/style.css` | Visual DNA retained: graphite surfaces, steel-blue accent, restrained borders. Rebuilt as a responsive component-oriented global system in `app/globals.css`. |
| `public/gateway.html` | Gateway idea retained and expanded into `/workspace/[workspaceId]` overview with KPIs, recent activity, quick actions and live online mini-map. |
| `public/dashboard.html` | Record-ledger concept, search, filters, export and embedded map retained. Rebuilt as generic schema-independent Records page. |
| `public/map.html` | Strongest legacy feature. Rebuilt as online-only operational map with multiple live basemaps, custom SVG markers, layer toggles, online place search, custom markers and record/location integration. Offline/local tile mode removed. |
| `public/stats.html` | Analytics concept retained. Hard-coded Activity/Incident/Tracking charts removed. New analytics can break down compatible fields from any custom form. |
| `public/form-config.html` | Configurable options idea retained and greatly expanded into universal Form Builder. Unlimited forms, fields and options; many field types; reordering, duplication and versioning. |
| `public/form1.html` | Removed. Replaced by universal dynamic form renderer. |
| `public/form2.html` | Removed. Replaced by universal dynamic form renderer. |
| `public/form3.html` | Removed. Replaced by universal dynamic form renderer. |
| `public/selection.html` | Removed. Forms are available directly from Forms, Records and dashboard quick actions. |
| `public/hierarchy.html` | Hierarchy concept retained but Group A / Group B and fixed depth removed. Rebuilt as flexible Organisation Structure. |
| `public/linked-groups.html` | Relationship concept is worthwhile but deferred from the first rehaul UI; new data model no longer depends on two special group types. |
| `public/admin-users.html` | User administration concept retained as Team / organisation membership UI with Owner/Admin/Member/Viewer roles. |
| `public/login.html` | Old local-session login implementation not migrated. Production auth should be server-backed; current deployable build uses workspace/demo mode. |
| `public/auth.js` | Removed with legacy local Express/session architecture. |
| `public/ai-workbench.html` | Removed from core navigation. AI is not required to prove the operations platform and should return later as a generic Insights layer over the new schema. |
| `public/assets/ai-controller.js` | Removed. Browser calls to local Ollama do not fit Vercel/product deployment. |
| `public/assets/leaflet.js` / `leaflet.css` | Local vendored Leaflet assets removed. Leaflet is installed as a package; map tiles remain online-only. |
| `public/assets/chart.umd.min.js` | Removed. Current analytics uses lightweight native UI; a chart library can be reintroduced when advanced analytics warrants it. |
| map PNG/SVG assets | Replaced by inline scalable map-pin SVGs and Lucide UI icons. |
| `server.js` | Express/SQLite server removed. App rebuilt around Next.js App Router for Vercel. |
| `scripts/reset-admin.js` | Removed with local admin credential model. |
| `atlasops.db` | Not migrated. Runtime database file contained an admin account and does not belong in the rebuilt repository. |
| `sessions.db` | Not migrated. Local session state does not belong in a Vercel deployment. |
| `FIRST_RUN_ADMIN_LOGIN.txt` | Not migrated. Generated credentials must never be committed. |
| `.env.example` | Replaced with a clean production-facing example. |
| `.gitignore` | Replaced; explicitly blocks local envs, SQLite files and legacy credential file names. |
| `package.json` / lockfile | Replaced with Next.js/React/Leaflet/Lucide stack. Legacy Express/SQLite dependencies removed. |
| `README.md` / deployment docs | Rewritten around the new product model and Vercel deployment. |
| `node_modules/` | Not copied. Third-party dependency tree is regenerated from `package.json`. |

## Legacy concepts intentionally not lost

- dark professional operating-console feel
- map-centric data exploration
- custom map annotations
- record ledger
- exports
- filtering/search
- configurable form options
- organisational hierarchy
- team administration
- analytics

## Legacy constraints intentionally not retained

- three fixed forms
- special Activity/Incident/Tracking payload fields
- Group A / Group B
- fixed hierarchy depth
- record-type inference from payload keys
- offline/local maps
- local SQLite/session files
- one-machine Ollama integration
- duplicated inline JavaScript across HTML pages
