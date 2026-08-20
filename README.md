# UminionsWebsite
The Folder Contents for the Uminion Website

## Pantry Finder deployment

The Pantry Finder frontend is embedded in page001 at `/includes/pantry-finder/dist`.
Its companion Node/SQLite API runs as the `pantry-api` service in `docker-compose.yml` and is exposed to the browser through the same-origin `/pantry-api` Apache proxy.

The production SQLite database is stored in the persistent `pantry_data` Docker volume. Before the first deployment, copy the existing Pantry Finder `database.sqlite` into that volume or restore it from backup; the repository does not contain a pantry database seed.
