const fs = require('fs');
const https = require('https');

const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;
const MAX_PICKS = 7; // Change to 10 if you want 10
const MIN_HOURS_BETWEEN_CALLS = 3; // This saves your limit

function api(p) {
  return new Promise((res, rej) => {
    const o = {
      hostname: 'v3.football.api-sports.io',
      path: p,
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY }
    };
    const r = https.request(o, rs => {
      let d = '';
      rs.on('data', c => d += c);
      rs.on('end', () => {
        try {
          const json = JSON.parse(d);
          const str = JSON.stringify(json).toLowerCase();
          if (json.errors && Object.keys(json.errors).length > 0) {
            console.log('API ERROR:', json.errors);
            if (str.includes('limit') || json.errors.requests) {
              console.log('⚠️ LIMIT REACHED - keeping old data.json');
              res(null); // Keep old file
            } else {
              res(json);
            }
          } else if (str.includes('limit') && json.response && json.response.length === 0) {
            console.log('⚠️ LIMIT - empty response');
            res(null);
          } else {
            res(json);
          }
        } catch (e) { rej(e); }
      });
    });
    r.on('error', rej);
    r.end();
  });
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  let existing = {};
  try { if (fs.existsSync('data.json')) existing = JSON.parse(fs.readFileSync('data.json','utf8')); } catch(e){}

  // === LIMIT PROTECTION 1: Don't call if updated less than 3 hours ago ===
  if (existing.lastUpdated) {
    const hoursSince = (Date.now() - new Date(existing.lastUpdated).getTime()) / (1000*60*60);
    console.log(`Last updated ${hoursSince.toFixed(1)} hours ago`);
    if (hoursSince < MIN_HOURS_BETWEEN_CALLS && existing.date === today) {
      console.log(`✅ Skipping API call - updated ${hoursSince.toFixed(1)}h ago. Still using ${existing.livePredictions?.length || 0} picks. No request used.`);
      return;
    }
  }

  const isNewDay = existing.date !== today;
  console.log(`Today: ${today} | Old date: ${existing.date} | New day: ${isNewDay}`);

  // === SAME DAY: Update scores only (1 request) ===
  if (!isNewDay && existing.livePredictions) {
    console.log('Same day - updating LIVE scores for 7 picks only (1 request)');
    const liveResp = await api(`/fixtures?live=all`);
    if (!liveResp) { console.log('Limit hit, keep old'); return; }
    const liveFixtures = liveResp.response || [];
    console.log(`Live now: ${liveFixtures.length}`);

    const updated = existing.livePredictions.map(p => {
      const live = liveFixtures.find(l => l.fixture.id === p.id);
      if (live) {
        const isFT = ['FT','AET','PEN'].includes(live.fixture.status.short);
        return {
          ...p,
          status: isFT ? 'finished' : 'live',
          statusLabel: isFT ? `FINISHED · ${live.goals.home}-${live.goals.away}` : `LIVE · ${live.fixture.status.elapsed}' · ${live.goals.home}-${live.goals.away}`,
          minute: live.fixture.status.elapsed || 0,
          goals: `${live.goals.home}-${live.goals.away}`,
          short: live.fixture.status.short
        };
      }
      return p;
    });

    existing.livePredictions = updated;
    existing.lastUpdated = new Date().toISOString();
    fs.writeFileSync('data.json', JSON.stringify(existing, null, 2));
    console.log(`✅ Updated scores - 1 request used - still ${updated.length} picks`);
    return;
  }

  // === NEW DAY: Fetch new 7 picks (1 request) ===
  console.log(`New day - fetching fresh ${MAX_PICKS} picks (1 request)`);
  const fx = await api(`/fixtures?date=${today}`);
  if (!fx) { console.log('Limit hit on date, keeping old'); return; }
  
  let fixtures = fx.response || [];
  console.log(`Total fixtures today: ${fixtures.length}`);
  
  // Take only 7 - no demo filtering
  const livePredictions = fixtures.slice(0, MAX_PICKS).map(f => {
    const kickTime = new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    return {
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      match: `${f.teams.home.name} vs ${f.teams.away.name}`,
      league: f.league.name,
      pick: "Over 0.5 Goals",
      status: 'upcoming',
      statusLabel: `UPCOMING · ${kickTime}`,
      minute: 0,
      goals: "0-0",
      kickoffAt: f.fixture.date,
      short: f.fixture.status.short
    };
  });

  const finalData = {
    date: today,
    lastUpdated: new Date().toISOString(),
    livePredictions: livePredictions,
    hedgeStrategies: [], // Empty - no demo
    predictions: [],
    meta: { site: "ddtoday", picks: MAX_PICKS, limit_protected: true }
  };

  fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
  if (!fs.existsSync('bettingsite')) fs.mkdirSync('bettingsite', {recursive:true});
  try { fs.writeFileSync('bettingsite/data.json', JSON.stringify(finalData, null, 2)); } catch(e){}
  
  console.log(`✅ NEW DAY DONE: ${livePredictions.length} picks - 1 request used`);
  console.log(`Monthly usage: ~30 requests/month - you have 100/day = NEVER EXCEED`);
}

main().catch(e => { console.error(e); process.exit(1); });
