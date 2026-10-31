# Sure2OddToday automation (API-Football + Cloudflare Worker)

A small Cloudflare Worker wakes up every 15 minutes. It reads your schedule and budget, fetches only what is due from API-Football, builds the daily content, and commits `data.json` to GitHub through your existing publishing route. The public site then updates itself. Nothing here needs a computer after setup, and the API key never goes into `data.json`.

## What it does each day (defaults, editable in the editor, no code)
| Time (your time zone) | Task | API-Football requests |
|---|---|---|
| from 05:00 | Fixtures for each league (1 request per league) | 5 |
| 06:00, 12:00, 16:00 | Odds refresh, only for leagues with upcoming matches (1+ per league, 10 matches per page) | 0 to 15 |
| 06:00 | Predictions for the earliest matches, up to 10 | up to 10 |
| every 90 min until 23:00 | Results, only for picks whose match ended 2h+ ago; finished matches are never asked again | 0 to 4 |
| every 15 min | Free step (no requests): builds odds-comparison events, daily tickets, expires old items, publishes only if something changed | 0 |

Typical full match day: 20 to 45 requests. Quiet days: close to 5. Free plan = 100 per day, so this fits with room to spare. The Worker also keeps a reserve (default 15), a per-run cap (default 25), caches responses, counts every request before sending it, never retries in a loop, and pauses completely if the API rejects the key.

The free quota resets daily at 00:00 UTC. It is a daily allowance, so staying under it each day means staying on the free plan indefinitely. The editor shows real usage and a monthly estimate after a few days. I can't promise six months from here: it depends on your real match days, and on API-Football's terms allowing your use (ask their support to confirm in writing that an ad-supported public site is allowed on your plan).

## What gets published
* **Odds comparison / arbitrage (max 2 per day):** only when every outcome is covered, at least two different bookmakers are involved, the sum of 1/odds is below 1, and the profit is between your min and max (default 0.5% to 8%; higher is treated as bad data). Otherwise the site says no valid opportunity was found. Expired items are marked Expired, then removed after 24h.
* **Rollover tickets:** one ticket per day per active package, built from odds (median across bookmakers) and API-Football predictions. Picks are labelled "API prediction" or "odds-based suggestion". If today's matches cannot reach a target (for example 100 odds on a quiet day) the day shows "No qualifying selections" instead of being padded.
* **Cycles:** a package runs for its number of days. A lost day fails the cycle; the next day starts a new one. The latest finished cycle stays visible under Previous cycles.
* **Results:** graded from the 90-minute score as WON or LOST. Postponed or cancelled matches become VOID.

## Honest limits
* API-Football odds are pre-match snapshots from a limited set of bookmakers, refreshed a few times a day by this schedule. Real arbitrage disappears in minutes, so treat these as an odds comparison, not guaranteed profit. The site says so in the popup.
* Written from API-Football's documented endpoints and tested against simulated responses only (18 automated checks on the Worker, plus an end-to-end run of the editor against a mock Worker). It has not been run against the live API. The first Test connection and Run now are the real test. If something is off (for example a market id or the season), the activity log in the editor shows it.
* Season is guessed (August start). For a league with a different calendar, set it in Leagues as `id:name:season`, e.g. `71:Brasileirao:2026`.
* Free Cloudflare Workers allow about 10 ms of CPU per run. Ticket building is about 2 ms each and is spread 4 per run. If the Worker logs show CPU limit errors, a $5 Workers plan removes the issue.
* If you publish from the editor while automation is on, your copy replaces the automatic parts until the next run (within 15 minutes). Use the editor for site text, settings and links, and let automation own predictions.

## Setup (works from a phone browser)
1. Upload this `worker` folder to the root of your GitHub repo (next to `index.html`), and the new `index.html` and `editor.html`.
2. Cloudflare dashboard: Storage and Databases > KV > Create namespace named `S2O`. Copy its ID.
3. In GitHub edit `worker/wrangler.toml`: paste the KV ID, set `ALLOWED_ORIGIN` to the address where your editor opens (for example `https://sure2oddtoday.online`), and check `GITHUB_BRANCH`.
4. Cloudflare: Workers and Pages > Create > Import a repository > choose the repo > set Root directory to `worker` > Deploy. The 15-minute schedule comes from `wrangler.toml`.
5. Open the Worker > Settings > Variables and Secrets. Add as secrets:
   * `ADMIN_TOKEN`: a random string of 32 or more characters you invent
   * `GITHUB_TOKEN`: a GitHub fine-grained token for this repository only, with Contents read and write
   * `GITHUB_OWNER`, `GITHUB_REPO`: your GitHub user and repository names
   * optional `APIFOOTBALL_KEY` if you prefer a Cloudflare secret instead of saving the key in the editor
6. Open the editor > Football API. Enter the Worker URL and the admin token, press Connect. Paste your API-Football key, Save key, Test connection.
7. Check leagues and schedule, tick Automation enabled, Save settings, then Run now once. Check the Activity log and your site. After that nothing else is needed.

Tests: `node tests/worker.test.js` (Node 18+).
