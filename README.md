# Sure2OddToday

Mobile-first football information website for https://sure2oddtoday.online. The public website reads published, non-secret content from `data.json`. Cloudflare Worker automation and its existing API-Football adapter are kept in `worker/`; ordinary content is separate from API secrets.

## Deployment

Keep this repository connected to the existing Cloudflare Pages site and keep its static-root build settings. Deploy the existing Worker from the `worker/` directory. Its 15-minute cron checks the configured schedule and uses the existing `S2O` KV binding for operational state and caching. Keep the existing worker secrets private in Cloudflare. Do not put keys, tokens, passwords, private affiliate credentials, or admin secrets in repository files or JSON.

The companion administration interface lives in the separate `waec2022/matchforecast-editor` repository. The current Worker provides API-Football automation controls. It does not expose a manual GitHub JSON publishing API. Manual `data.json` publishing must be configured through the existing protected GitHub Pages Function/secure endpoint before editor publishing can be used. The key storage path in the current Worker uses encrypted KV unless `APIFOOTBALL_KEY` is provisioned as a Cloudflare secret; Workers cannot set their own Cloudflare secrets through a request.

No API credentials or match data are present in the new initial data file. Blank feeds are deliberate and do not represent fabricated results or predictions. The existing worker implementation and history remain in Git for recovery.

## Checks

Run `npm test` locally to execute the existing Worker tests. Cloudflare deployment, API credentials, and browser validation require the configured external environment and were not exercised in this GitHub editing operation.
