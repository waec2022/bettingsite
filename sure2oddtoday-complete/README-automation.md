# Sure2OddToday automation (API-Football + Cloudflare Worker)

What it does, every 15 minutes, only when the schedule says it is due:
1. Fetches today's fixtures for your chosen leagues.
2. Fetches bookmaker odds, then checks every match for genuine arbitrage (all outcomes covered, sum of 1/odds below 1.00, at least two bookmakers, profit between your min and max). Publishes at most 2 per day. If none qualify it says so.
3. Builds each active rollover package's ticket for today from the odds (median across bookmakers). Picks that match API-Football's own prediction are tagged "API prediction"; the rest are tagged "odds-based suggestion". If the target cannot be reached honestly, the day stays empty and later shows "skipped".
4. Grades finished matches WON / LOST / VOID (postponed or cancelled = VOID) and stops checking them.
5. Marks arbitrage events expired when the match starts or the odds change, removes them after 24h, and commits `data.json` to GitHub only when something changed. Last cycle stays visible in "Previous runs".

Your API key is never written to `data.json`. It is stored encrypted in the Worker's KV, or as a Cloudflare secret (`APIFOOTBALL_KEY`, which takes priority).

## One-time setup (works from a phone browser)
1. Cloudflare dashboard > Workers & Pages > KV > Create namespace `S2O`. Copy its ID into `worker/wrangler.toml` (edit the file on GitHub).
2. Workers & Pages > Create > Import a repository > this repo. Set root directory to `worker`.
3. Worker > Settings > Variables and Secrets. Secrets: `ADMIN_TOKEN` (long random, 32+ chars), `GITHUB_TOKEN` (fine-grained token, Contents read/write on this one repo), `GITHUB_OWNER`, `GITHUB_REPO`. Variables: `ALLOWED_ORIGIN` = the address your editor opens from (e.g. https://sure2oddtoday.online), `GITHUB_BRANCH` (default main).
4. Open the editor > Football API. Enter the Worker URL and ADMIN_TOKEN, press Connect, paste your API-Football key, Save key, Test connection.
5. Check leagues and schedule, tick Automation enabled, Save settings, press Run now once. Open the site to check. After that it runs by itself.

## Request budget (API-Football free = 100/day, resets 00:00 UTC)
Default schedule, 5 leagues: fixtures 5 + odds 5 per refresh (3 refreshes = 15) + predictions up to 10 + results about 1-2 per check, only while selections are waiting. Roughly 30-40 a day at most, about 1,000-1,200 a month of 3,000. The daily limit resets every day, so there is no six-month pool to run out of. This is an estimate: the Usage panel shows the real count. The Worker never spends the last 15 requests of the day, caps each run at 25, caches responses, stops on any API error, pauses on a rejected key, and backs off after failures. Fewer leagues or fewer odds refreshes cut usage directly.

## Know the limits
- API-Football odds are pre-match snapshots and may only refresh about once a day, so published "arbitrage" can already be gone. The site says so, and expires entries when odds change. Treat it as odds comparison, not a guaranteed profit.
- First automatic run clears the sample (demo) packages and arbitrage events, then fills real ones.
- If you publish from the editor while the Worker has newer data, the Worker corrects it on its next change (within about 15 minutes).
- Confirm with API-Football support that your plan allows showing their data on a public, ad-supported site.
- The free Cloudflare Worker CPU limit is small. If the log ever shows a CPU error, lower "Tickets built per tick" or ask me to split the work further.

## Tests
`node tests/worker.test.js` runs 18 tests against a mocked API-Football and GitHub (quota guard, key encryption, scheduling, arbitrage maths, ticket targets, cycles, results, one-commit publish, no key in data.json). Nothing here has been tested against the real API-Football, GitHub or Cloudflare.
