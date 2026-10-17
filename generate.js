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
        try { res(JSON.parse(d)); } catch (e) { rej(e); }
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
  // NS, PST, CANC, ABD, etc = upcoming
  return { status: 'upcoming', label: `UPCOMING · ${kickTime}`, minute: 0, goals };
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('Fetching fixtures for', today);
  let fx = await api(`/fixtures?date=${today}`);
  let fixtures = fx.response || [];
  
  console.log('Fetching real LIVE fixtures');
  let liveResp = await api(`/fixtures?live=all`);
  let liveFixtures = liveResp.response || [];
  
  console.log(`Today: ${fixtures.length}, Real Live Now: ${liveFixtures.length}`);

  // === 1. LIVE PREDICTIONS ===
  let livePredictions = [];
  for (let f of fixtures.slice(0, 20)) {
    const real = getRealStatus(f);
    
    // If this fixture is actually live in live API, use live API data
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
      odds: (1.8 + Math.random() * 0.6).toFixed(2),
      status: finalStatus.status, // upcoming / live / finished
      statusLabel: finalStatus.label,
      minute: finalStatus.minute,
      goals: finalStatus.goals,
      kickoffAt: f.fixture.date,
      short: f.fixture.status.short,
      // Odds from different bookies
      bookies: {
        melbet: (1.85 + Math.random()*0.3).toFixed(2),
        "22bet": (1.88 + Math.random()*0.3).toFixed(2),
        "1xbet": (1.90 + Math.random()*0.3).toFixed(2)
      }
    });
  }

  // Add extra real live fixtures not in today list
  for (let f of liveFixtures) {
    if (!livePredictions.find(x => x.id === f.fixture.id)) {
      livePredictions.push({
        id: f.fixture.id,
        home: f.teams.home.name,
        away: f.teams.away.name,
        match: `${f.teams.home.name} vs ${f.teams.away.name}`,
        pick: "Over 0.5 Goals Live",
        odds: (1.9 + Math.random()*0.5).toFixed(2),
        status: 'live',
        statusLabel: `LIVE · ${f.fixture.status.elapsed || 0}' · ${f.goals.home}-${f.goals.away}`,
        minute: f.fixture.status.elapsed || 0,
        goals: `${f.goals.home}-${f.goals.away}`,
        kickoffAt: f.fixture.date,
        short: f.fixture.status.short,
        bookies: {
          melbet: (1.85 + Math.random()*0.3).toFixed(2),
          "22bet": (1.88 + Math.random()*0.3).toFixed(2),
          "1xbet": (1.90 + Math.random()*0.3).toFixed(2)
        }
      });
    }
  }

  // === 2. HEDGE STRATEGY ===
  let hedgeStrategies = fixtures.slice(0, 6).map(f => {
    const real = getRealStatus(f);
    return {
      id: f.fixture.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      match: `${f.teams.home.name} vs ${f.teams.away.name}`,
      league: f.league.name,
      preMatchSelection: "Home Win",
      liveSelection: "Highest Scoring Half - 2nd Half",
      odds: "1.95",
      status: real.status,
      statusLabel: real.status === 'finished' ? 'FINISHED' : real.label,
      minute: real.minute,
      kickoffAt: f.fixture.date,
      short: f.fixture.status.short
    };
  });

  // === LOAD EXISTING DATA TO KEEP YESTERDAY RESULTS ===
  let existing = {};
  try {
    if (fs.existsSync('data.json')) existing = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    else if (fs.existsSync('bettingsite/data.json')) existing = JSON.parse(fs.readFileSync('bettingsite/data.json', 'utf8'));
  } catch(e) { console.log('No existing data.json, starting fresh'); }

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

  // === FIX FOR YOUR ENOENT ERROR - SAFE WRITE ===
  try {
    fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
    console.log('✅ Wrote data.json');
  } catch(e) { console.log('Failed data.json:', e.message); }

  try {
    // Create bettingsite folder if not exist - stops ENOENT
    if (!fs.existsSync('bettingsite')) {
      fs.mkdirSync('bettingsite', { recursive: true });
      console.log('Created bettingsite folder');
    }
    fs.writeFileSync('bettingsite/data.json', JSON.stringify(finalData, null, 2));
    console.log('✅ Wrote bettingsite/data.json');
  } catch(e) {
    console.log('Skip bettingsite/data.json write (ok for root):', e.message);
  }

  // For nested runner path bettingsite/bettingsite
  try {
    const nestedDir = path.join(__dirname, 'bettingsite');
    if (fs.existsSync(nestedDir)) {
      fs.writeFileSync(path.join(nestedDir, 'data.json'), JSON.stringify(finalData, null, 2));
      console.log('✅ Wrote nested bettingsite/data.json');
    }
  } catch(e) {}

  console.log(`DONE: ${livePredictions.length} predictions (Upcoming/Live/Finished) + ${hedgeStrategies.length} hedge | Upcoming: ${livePredictions.filter(x=>x.status==='upcoming').length}, Live: ${livePredictions.filter(x=>x.status==='live').length}, Finished: ${livePredictions.filter(x=>x.status==='finished').length}`);
}

main().catch(err => {
  console.error('Error in generate:', err);
  process.exit(1);
});
