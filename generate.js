const fs = require('fs');
const https = require('https');

const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;
const MAX_PICKS = 7;

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
              console.log('LIMIT HIT - keeping old file');
              res(null);
            } else { res(json); }
          } else { res(json); }
        } catch (e) { rej(e); }
      });
    });
    r.on('error', rej);
    r.end();
  });
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  
  // FORCE NEW EVERY TIME THIS RUNS - old matches go comot
  console.log(`=== FORCE REFRESH FOR ${today} ===`);
  
  console.log(`Fetching fixtures for ${today}...`);
  const fx = await api(`/fixtures?date=${today}`);
  
  if (!fx) {
    console.log('❌ API LIMIT - wait till midnight UTC (1am WAT)');
    console.log('Old data.json go remain, no change');
    return;
  }
  
  const allFixtures = fx.response || [];
  console.log(`Found ${allFixtures.length} total games today`);

  if (allFixtures.length === 0) {
    console.log('No games today, keeping old');
    return;
  }

  // Take ONLY 7 - first 7
  const livePredictions = allFixtures.slice(0, MAX_PICKS).map(f => {
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
    hedgeStrategies: [],
    predictions: [],
    meta: { picks: MAX_PICKS }
  };

  fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
  
  // Also copy to bettingsite folder
  if (!fs.existsSync('bettingsite')) fs.mkdirSync('bettingsite', {recursive:true});
  fs.writeFileSync('bettingsite/data.json', JSON.stringify(finalData, null, 2));
  
  console.log(`✅ DONE: Deleted old matches, wrote ${livePredictions.length} NEW matches for ${today}`);
  console.log(`✅ Used only 1 API request - safe forever`);
}

main().catch(e => { console.error(e); process.exit(1); });
