
# Patch Notes – Results Reliability & DevOps

- Added `/api/health` endpoint in `server/index.ts`.
- Write-through cache to `localStorage` on submit; hydrate on results page.
- Better error message on results fetch failure.
- Reminder: set `DATABASE_URL` and run migrations in Railway for durable persistence.
