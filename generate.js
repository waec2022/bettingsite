const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;

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
          // LIMIT PROTECTION - if limit reached, return null
          if (json.errors && (json.errors.requests || JSON.stringify(json).toLowerCase().includes('limit'))) {
            console.log('⚠️ API LIMIT REACHED - keeping old data.json');
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

function getRealStatus(f) {
  const short = f.fixture.status.short;
  const elapsed = f.fixture.status.elapsed || 0;
  const goals = `${f.goals.home ?? 0}-${f.goals.away ?? 0}`;
  const kickTime = new Date(f.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (['FT', 'AET', 'PEN'].includes(short)) {
    return { status: 'finished', label: `FINISHED · ${goals}`, minute: elapsed, goals };
  }
  if (['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(short)) {
    return { status: 'live', label: `LIVE · ${elapsed}' · ${goals}`, minute: elapsed, goals };
  }
  return { status: 'upcoming', label: `UPCOMING · ${kickTime}`, minute: 0, goals };
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  
  // LOAD EXISTING DATA FIRST - for 24hrs logic
  let existing = {};
  let existingRaw = null;
  try {
    if (fs.existsSync('data.json')) {
      existingRaw = fs.readFileSync('data.json', 'utf8');
      existing = JSON.parse(existingRaw);
    }
  } catch(e) { console.log('No existing data.json, starting fresh'); }

  const isNewDay = !existing.date || existing.date !== today;
  console.log(`Today: ${today}, Existing date: ${existing.date}, isNewDay: ${isNewDay}`);

  let fixtures = [];
  let liveFixtures = [];

  if (isNewDay) {
    // NEW DAY: Need full fixtures (1 request)
    console.log('Fetching fixtures for', today);
    let fx = await api(`/fixtures?date=${today}`);
    if (!fx) { console.log('Limit hit, keep old'); return; } // keep old
    fixtures = fx.response || [];
    console.log(`Today fixtures: ${fixtures.length}`);
  } else {
    // SAME DAY: Use cached fixtures from existing livePredictions to save request
    console.log('Same day - using cached fixtures from data.json');
    // Reconstruct fixtures from existing if possible, else fetch live only
    fixtures = []; // we will not re-fetch date
  }

  // ALWAYS fetch LIVE (1 request per run - this is the 24hrs update)
  console.log('Fetching real LIVE fixtures');
  let liveResp = await api(`/fixtures?live=all`);
  if (!liveResp) { console.log('Limit hit on live, keep old'); return; }
  liveFixtures = liveResp.response || [];
  console.log(`Real Live Now: ${liveFixtures.length}`);

  // If isNewDay = false, we need fixtures list - build from existing
  if (!isNewDay && existing.livePredictions) {
    // Convert existing predictions back to fixtures-like for processing
    // But easier: just use liveFixtures to update existing
  }

  let livePredictions = [];

  if (isNewDay) {
    // Build from fresh fixtures
    for (let f of fixtures.slice(0, 20)) {
      const real = getRealStatus(f);
      const realLive = liveFixtures.find(l => l.fixture.id === f.fixture.id);
      let finalStatus = real;
      if (realLive) {
        finalStatus = {
          status: 'live',
          label: `LIVE · ${realLive.fixture.status.elapsed || 0}' · ${realLive.goals.home}-${realLive.goals.away}`,
          minute: realLive.fixture.status.elapsed || 0,
          goals: `${realLive.goals.home}-${realLive.goals.away}`
        };
      }
      livePredictions.push({
        id: f.fixture.id,
        home: f.teams.home.name,
        away: f.teams.away.name,
        match: `${f.teams.home.name} vs ${f.teams.away.name}`,
        pick: "Over 0.5 Goals Live",
        odds: "",
        status: finalStatus.status,
        statusLabel: finalStatus.label,
        minute: finalStatus.minute,
        goals: finalStatus.goals,
        kickoffAt: f.fixture.date,
        short: f.fixture.status.short,
        bookies: {} // EMPTY - you go put your own original codes
      });
    }
  } else {
    // SAME DAY: Update existing livePredictions with live scores only (no new fetch)
    livePredictions = (existing.livePredictions || []).map(p => {
      const realLive = liveFixtures.find(l => l.fixture.id === p.id);
      if (realLive) {
        return {
          ...p,
          status: 'live',
          statusLabel: `LIVE · ${realLive.fixture.status.elapsed || 0}' · ${realLive.goals.home}-${realLive.goals.away}`,
          minute: realLive.fixture.status.elapsed || 0,
          goals: `${realLive.goals.home}-${realLive.goals.away}`,
          short: realLive.fixture.status.short,
          bookies: p.bookies || {} // keep empty
        };
      }
      // If match time don pass 3hrs and still upcoming, mark finished
      const matchTime = new Date(p.kickoffAt).getTime();
      if (Date.now() - matchTime > 3*60*60*1000 && p.status === 'upcoming') {
        return { ...p, status: 'finished', statusLabel: 'FINISHED' };
      }
      return p;
    });

    // Add extra real live fixtures not in today list
    for (let f of liveFixtures) {
      if (!livePredictions.find(x => x.id === f.fixture.id)) {
        livePredictions.push({
          id: f.fixture.id,
          home: f.teams.home.name,
          away: f.teams.away.name,
          match: `${f.teams.home.name} vs ${f.teams.away.name}`,
          pick: "Over 0.5 Goals Live",
          odds: "",
          status: 'live',
          statusLabel: `LIVE · ${f.fixture.status.elapsed || 0}' · ${f.goals.home}-${f.goals.away}`,
          minute: f.fixture.status.elapsed || 0,
          goals: `${f.goals.home}-${f.goals.away}`,
          kickoffAt: f.fixture.date,
          short: f.fixture.status.short,
          bookies: {}
        });
      }
    }
  }

  // HEDGE - only rebuild on new day
  let hedgeStrategies = [];
  if (isNewDay) {
    hedgeStrategies = fixtures.slice(0, 6).map(f => {
      const real = getRealStatus(f);
      return {
        id: f.fixture.id,
        home: f.teams.home.name,
        away: f.teams.away.name,
        match: `${f.teams.home.name} vs ${f.teams.away.name}`,
        league: f.league.name,
        preMatchSelection: "Home Win",
        liveSelection: "Highest Scoring Half - 2nd Half",
        odds: "",
        status: real.status,
        statusLabel: real.status === 'finished' ? 'FINISHED' : real.label,
        minute: real.minute,
        kickoffAt: f.fixture.date,
        short: f.fixture.status.short
      };
    });
  } else {
    hedgeStrategies = existing.hedgeStrategies || [];
  }

  const finalData = {
    ...existing,
    date: today,
    lastUpdated: new Date().toISOString(),
    livePredictions: livePredictions,
    hedgeStrategies: hedgeStrategies,
    predictions: existing.predictions || [],
    results: existing.results || [],
    accumulators: existing.accumulators || [],
    meta: existing.meta || { site: "ddtoday" }
  };

  try {
    fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
    console.log('✅ Wrote data.json');
  } catch(e) { console.log('Failed data.json:', e.message); }

  try {
    if (!fs.existsSync('bettingsite')) fs.mkdirSync('bettingsite', { recursive: true });
    fs.writeFileSync('bettingsite/data.json', JSON.stringify(finalData, null, 2));
    console.log('✅ Wrote bettingsite/data.json');
  } catch(e) { console.log('Skip bettingsite write:', e.message); }

  console.log(`DONE: ${livePredictions.length} predictions | Upcoming: ${livePredictions.filter(x=>x.status==='upcoming').length}, Live: ${livePredictions.filter(x=>x.status==='live').length}, Finished: ${livePredictions.filter(x=>x.status==='finished').length}`);
}

main().catch(err => {
  console.error('Error in generate:', err);
  process.exit(1);
});
