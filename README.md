# UminionsWebsite

•This repository contains the page001 (uminionClassic's) Uminion website deployment,
and, 
•the Pantry Finder feature (of quest issue #54) integrated from page002 (which will be shutting down to be replaced with something else, (page002 that is)). 

•While:
Page001 remains a WordPress/Astra child-theme site backed by MySQL. 
•While:
Pantry Finder is an isolated React frontend with its own Node/Express/SQLite service and its own persistent Docker volume.

## Architecture

```mermaid
flowchart LR
	Browser[Browser]
	Nginx[Host nginx\npublic domain routing]
	WP[wordpress container\nPHP 8.2 + Apache\nVPS 4002:80]
	React[Pantry Finder bundle\n/pantry-finder/dist]
	Proxy[Apache reverse proxy\n/pantry-api/]
	API[pantry-api container\nExpress + Kysely\ninternal port 4000]
	SQLite[(pantry_data volume\ndatabase.sqlite)]
	SQLiteWeb[sqlite-web container\nSQLite admin UI\nVPS 127.0.0.1:8091]
	MySQL[(Existing MySQL\nexternal uminionnet)]
	Mounts[/root/private-includes\nlegacy page001 files]

	Browser -->|page001 domain| Nginx
	Nginx -->|VPS port 4002| WP
	WP -->|serves| React
	Browser -->|same-origin /pantry-api| WP
	WP --> Proxy
	Proxy -->|Docker DNS| API
	API --> SQLite
	SQLiteWeb --> SQLite
	WP -->|WORDPRESS_DB_*| MySQL
	WP --> Mounts
	WP ---|uminionnet| API
	WP ---|uminionnet| MySQL
```

### Request and data flow

1. Host nginx owns public port 80 and routes the page001 domain to the WordPress container on VPS port `4002`.
2. Apache serves the WordPress page and the repository-built Pantry Finder assets from `/pantry-finder/dist`.
3. The browser calls `/pantry-api/api/...` on the same page001 origin. Apache forwards that path to `pantry-api:4000` over the Docker network.
4. `pantry-api` reads and writes `/app/data/database.sqlite` through Kysely and better-sqlite3.
5. The `pantry_data` volume is mounted by both `pantry-api` and `sqlite-web`, so the API and database browser see the same records.
6. WordPress continues using its existing MySQL connection and legacy private bind mounts. Pantry Finder does not call page002 and does not use page001 MySQL for pantry data.

## Services and deployment

### `wordpress`

Built from the root [Dockerfile](Dockerfile). It runs WordPress with Apache, enables `rewrite`, `proxy`, and `proxy_http`, copies the Astra child theme, and copies the built Pantry Finder bundle to `/var/www/html/pantry-finder/dist`.

The Compose service preserves page001's existing configuration:

- Container port `80` is published as VPS port `4002`.
- Existing `WORDPRESS_DB_HOST`, user, password, and database variables connect to the external MySQL container/network.
- Existing `/root/private-includes` mounts provide legacy includes, uploads, imagery, and testing files.
- The service joins the external Docker network `uminionnet`.

### `pantry-api`

Built from [pantry-api/Dockerfile](pantry-api/Dockerfile) using a Node 22 Alpine multi-stage build. It compiles the TypeScript server, installs production dependencies, initializes the SQLite schema, runs the idempotent location backfill, and starts Express on internal port `4000`.

It is not published directly to the internet. Apache reaches it by the Docker service name `pantry-api`. Its database is stored in the named `pantry_data` volume at `/app/data/database.sqlite`.

### `sqlite-web`

Runs the `sqlite-web` browser in a Python 3.12 container and mounts the same `pantry_data` volume at `/data`. It is bound only to VPS loopback port `8091`, because page002 already uses VPS port `8090`.

### Compose and proxy files

[docker-compose.yml](docker-compose.yml) defines the three-service stack, the persistent volume, the existing external network, health checks, ports, and legacy bind mounts.

[apache-pantry-proxy.conf](apache-pantry-proxy.conf) maps `/pantry-api/` to the internal `pantry-api:4000` service. The browser therefore uses a same-origin API path and has no page002 dependency.

Do not remove the `pantry_data` volume during routine deployments. It contains page001's pantry records. The repository intentionally does not ship a database seed. 

## WordPress page001

[wp-content/themes/astra-child/front-page.php](wp-content/themes/astra-child/front-page.php) is the complete page001 front-page template. It contains the legacy page markup, inline CSS, inline JavaScript, forms, archive/store sections, the Pantry Finder stylesheet/script tags, the API base-path declaration, and the React mount element `emojiLineForGitHubQuest54onFrontPage`.

[wp-content/themes/astra-child/functions.php](wp-content/themes/astra-child/functions.php) is the child-theme hook file. It enqueues the Astra parent stylesheet, adds homepage head hooks, excludes or branches page-specific behavior, starts the PHP session, and creates the CSRF token.

[wp-content/themes/astra-child/style.css](wp-content/themes/astra-child/style.css) is the Astra child-theme metadata stylesheet. Most page001 styling currently lives in `front-page.php` rather than here. (This CSS is more for mounting)

The root [Dockerfile](Dockerfile) is the WordPress image definition. It enables Apache modules/configuration and copies the child theme and Pantry Finder production assets into the image. It does not copy the legacy private includes because those remain runtime bind mounts.

## Pantry Finder frontend

The frontend lives under `includes/pantry-finder`. Its source is page002's ("Find a Food Pantry") feature:> adapted into a standalone page001 bundle. <:It is built with Vite, React 18, TypeScript, Tailwind CSS, Radix UI, Lucide, and Leaflet.

### Entry and application

[includes/pantry-finder/src/main.tsx](includes/pantry-finder/src/main.tsx) finds the page001 mount element, applies the Pantry Finder isolation boundary, and mounts React. It also sets the transparent, content-sized launcher styles without changing page001 CSS.

[includes/pantry-finder/src/App.tsx](includes/pantry-finder/src/App.tsx) owns the top-level pantry collection, loads pantries from the API, filters deleted records, and submits new pantry records.

[includes/pantry-finder/src/lib/api.ts](includes/pantry-finder/src/lib/api.ts) joins the configured `window.PANTRY_API_BASE_URL` with API paths.

[includes/pantry-finder/src/lib/utils.ts](includes/pantry-finder/src/lib/utils.ts) combines conditional class names and merges Tailwind classes with `clsx` and `tailwind-merge`.

### Pages and feature components

[includes/pantry-finder/src/pages/landing/landing-page.tsx](includes/pantry-finder/src/pages/landing/landing-page.tsx) renders the page001 launcher button and the full-screen Pantry Finder dialog.

[includes/pantry-finder/src/pages/pantry-feature/the-food-pantry-feature.tsx](includes/pantry-finder/src/pages/pantry-feature/the-food-pantry-feature.tsx) is the main three-column feature layout: navigation, map, and controls. It loads politicians/candidates and applies country, state, category, and office filters.

[includes/pantry-finder/src/pages/pantry-feature/pantry-controls.tsx](includes/pantry-finder/src/pages/pantry-feature/pantry-controls.tsx) switches the right-side panel between find, host, details, and running-for-office views.

[includes/pantry-finder/src/pages/pantry-feature/find-pantry-view.tsx](includes/pantry-finder/src/pages/pantry-feature/find-pantry-view.tsx) renders category checkboxes and country/state filters.

[includes/pantry-finder/src/pages/pantry-feature/pantry-details-view.tsx](includes/pantry-finder/src/pages/pantry-feature/pantry-details-view.tsx) displays a selected pantry and its feedback controls.

[includes/pantry-finder/src/pages/pantry-feature/running-for-office-form.tsx](includes/pantry-finder/src/pages/pantry-feature/running-for-office-form.tsx) renders the candidate submission form and ballot-information response flow.

[includes/pantry-finder/src/pages/pantry-feature/countries-data.ts](includes/pantry-finder/src/pages/pantry-feature/countries-data.ts) supplies country-to-state/province lists for the forms and filters.

[includes/pantry-finder/src/pages/home/host-pantry-form.tsx](includes/pantry-finder/src/pages/home/host-pantry-form.tsx) validates and submits pantry details, calls geocoding, and renders the host-a-pantry form.

[includes/pantry-finder/src/pages/home/map.tsx](includes/pantry-finder/src/pages/home/map.tsx) creates the Leaflet map and renders pantry, politician, and candidate markers/popups.

[includes/pantry-finder/src/pages/home/marker-icons.ts](includes/pantry-finder/src/pages/home/marker-icons.ts) defines marker icons, colors, and marker selection behavior.

[includes/pantry-finder/src/pages/home/types.ts](includes/pantry-finder/src/pages/home/types.ts) defines the TypeScript data contracts for pantries, politicians, candidates, and related form values.

### UI components and styling

The files under [includes/pantry-finder/src/components/ui](includes/pantry-finder/src/components/ui) are reusable Radix/Tailwind controls:

- `button.tsx`, `input.tsx`, `textarea.tsx`, and `label.tsx`: form primitives and Pantry Finder-specific isolation classes.
- `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `toggle.tsx`, and `slider.tsx`: selection and value controls.
- `select.tsx`, `popover.tsx`, `command.tsx`, `calendar.tsx`, and `tooltip.tsx`: menus, lookup controls, date selection, and overlays.
- `dialog.tsx`: modal portal, overlay, close button, and dialog content.
- `card.tsx`, `table.tsx`, `progress.tsx`: general display and status primitives.

[includes/pantry-finder/src/index.css](includes/pantry-finder/src/index.css) contains Tailwind input plus the Pantry Finder isolation layer. It scopes generated/vendor selectors, controls, Leaflet popups, launcher behavior, modal stacking, dropdown colors, and field typography under `.pantry-finder-root`.

[includes/pantry-finder/tailwind.config.js](includes/pantry-finder/tailwind.config.js) tells Tailwind to scan the embedded `src` tree, scopes important utilities to `.pantry-finder-root`, disables global preflight, and defines the feature theme.

[includes/pantry-finder/postcss.config.js](includes/pantry-finder/postcss.config.js) runs Tailwind, prefixes generated selectors with `.pantry-finder-root`, and applies Autoprefixer.

[includes/pantry-finder/vite.config.js](includes/pantry-finder/vite.config.js) builds the standalone bundle into `dist` with the stable filenames `pantry-finder.js` and `pantry-finder.css`.


The frontend [package.json](includes/pantry-finder/package.json) defines the Vite build and runtime/UI dependencies. [package-lock.json](includes/pantry-finder/package-lock.json) locks those dependencies.

`includes/pantry-finder/index.html` is the standalone development/build entry document. The generated `includes/pantry-finder/dist/index.html`, `pantry-finder.js`, and `pantry-finder.css` are deployment artifacts consumed by the WordPress image.

## Pantry API backend

[pantry-api/server/index.ts](pantry-api/server/index.ts) creates the Express app, normalizes an optional base path, registers JSON/form middleware, defines pantry/politician/candidate/geocoding endpoints, and starts the server.

[pantry-api/server/db.ts](pantry-api/server/db.ts) opens the SQLite file from `DATA_DIRECTORY` and defines the Kysely database schema types.

[pantry-api/server/types.ts](pantry-api/server/types.ts) defines shared backend TypeScript types.

[pantry-api/server/static-serve.ts](pantry-api/server/static-serve.ts) contains the backend's static-serving helper used by the server entry point.

[pantry-api/scripts/init-db.cjs](pantry-api/scripts/init-db.cjs) creates missing SQLite tables and adds the country/state columns needed by Pantry Finder. It is safe to run repeatedly.

[pantry-api/scripts/backfill-pantry-locations.cjs](pantry-api/scripts/backfill-pantry-locations.cjs) classifies existing pantry addresses into country/state metadata, including international formats and ambiguous regional abbreviations. It runs during API startup.

[pantry-api/package.json](pantry-api/package.json) defines backend build/start scripts and dependencies. [pantry-api/tsconfig.server.json](pantry-api/tsconfig.server.json) configures TypeScript compilation for the server. [pantry-api/Dockerfile](pantry-api/Dockerfile) packages the compiled API and startup scripts into a production Node image.

The backend's `data/` directory is runtime storage when running outside Docker. Local SQLite files and dependency directories are excluded by [.gitignore](.gitignore) and [.dockerignore](.dockerignore). The repository should not commit production database files.

## Deployment automation

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) deploys this Docker Compose stack to `/docker/uminionclassicv001` over SSH when its configured branch receives a push. It pulls the repository, rebuilds the images, and restarts Compose.

[.github/workflows/AutoDeployWebsite.yml](.github/workflows/AutoDeployWebsite.yml) is the existing FTP deployment workflow for selected page001 PHP/includes files and the Astra child theme. Its large comments describe the older Hostinger FTP model. It is separate from the Docker Compose deployment and should be changed only with awareness that it controls a different delivery path.

## Files that combine responsibilities

These are recommendations for later organization, not current changes:

- `wp-content/themes/astra-child/front-page.php` combines the complete page markup, 
a very large inline stylesheet, 
extensive inline JavaScript, 
PHP session/database setup, 
and Pantry Finder bootstrapping. 

It is the clearest future split candidate: 
template markup, 
page001 CSS, 
page001 JavaScript, 
and small integration partials could eventually become separate files.

- `wp-content/themes/astra-child/functions.php` combines parent-theme setup, 
homepage hooks, 
page exclusions, 
session startup, 
and CSRF initialization. 

Session/security initialization could eventually move into a dedicated bootstrap/plugin boundary.

- `pantry-api/server/index.ts` combines Express setup, 
environment/base-path normalization, 
diagnostics, 
route definitions, 
and server startup. 

Routes could eventually be separated into route modules, with startup/configuration kept in the entry point.

- `pantry-api/server/db.ts` combines database connection construction with all table schema interfaces. A later split could keep the connection in `db.ts` and shared table types in a schema/types module.

- `pantry-api/scripts/backfill-pantry-locations.cjs` combines the country/state dataset, address parsing rules, coordinate disambiguation, and migration execution. The lookup dataset and classifier could eventually be separated from the migration runner.

- `includes/pantry-finder/src/pages/pantry-feature/the-food-pantry-feature.tsx` combines API loading, filter state, derived filtering, and the three-column layout. A later split could extract hooks for data/filter state and leave the component focused on layout.

- `includes/pantry-finder/src/index.css` combines Tailwind entry styles, isolation rules, form-control overrides, modal rules, dropdown rules, and Leaflet customization. These could later become separate scoped style modules if the feature grows.

- `docker-compose.yml` combines the page001 web service, Pantry API, SQLite administration service, persistent storage, external networking, health checks, and legacy mounts. It is still an appropriate deployment manifest, but service-specific Compose fragments could help if more features are added.

## Adding the next feature

Use this architecture as the placement guide:

- A visual React feature belongs under `includes/<feature-name>`, with its own build output and a mount point in the WordPress template.
- A feature-specific API belongs in its own service or an explicitly separated backend module. Avoid coupling new browser code directly to page002 or to page001's MySQL unless that is intentional.
- Persistent feature data belongs in a named Docker volume with an explicit backup/import plan.
- Apache proxy paths should be same-origin paths such as `/feature-api/`, routed to an internal Docker service.
- Page001's existing private mounts, MySQL environment, port `4002`, nginx routing, and Astra child-theme structure are infrastructure boundaries. New features should fit around them rather than replace them.
