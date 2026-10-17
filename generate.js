const fs = require('fs');

// CORRECT TOP LEAGUES - ONLY ID, no name wahala
const TOP_LEAGUES_IDS = [39,140,135,78,61,2,3,45,48,15,848,94,88,42];

function isTopLeague(fixture) {
  // ONLY check by ID - no more name.contains wey dey spoil
  return TOP_LEAGUES_IDS.includes(fixture.league.id);
}

async function getFixtures() {
  const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  const json = await res.json();
  return json.response || [];
}

function getStatus(fixture) {
  const s = fixture.fixture.status.short;
  const elapsed = fixture.fixture.status.elapsed;
  const gh = fixture.goals.home ?? 0;
  const ga = fixture.goals.away ?? 0;
  
  if (["1H","HT","2H","ET","P","LIVE"].includes(s)) {
    return { status: "live", statusLabel: `LIVE · ${elapsed ? elapsed+"'" : s} · ${gh}-${ga}`, color: "red" };
  }
  if (["FT","AET","PEN"].includes(s)) {
    return { status: "finished", statusLabel: `FINISHED · ${gh}-${ga}`, color: "green" };
  }
  const d = new Date(fixture.fixture.date);
  const timeStr = d.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true});
  return { status: "upcoming", statusLabel: `UPCOMING · ${timeStr}`, color: "yellow" };
}

// YOUR OLD PICK LOGIC - restore am
function makePrediction(fixture) {
  const picks = ["Over 1.5", "BTTS Yes", "Home Win", "Double Chance 1X", "Over 2.5"];
  const odds = ["1.40","1.65","1.85","1.32","1.90"];
  const bookmakers = ["Bet9ja","SportyBet","BetPawa","Betway"];
  const idx = fixture.fixture.id % picks.length;
  
  const statusInfo = getStatus(fixture);
  
  return {
    id: fixture.fixture.id,
    league: fixture.league.name,
    leagueId: fixture.league.id,
    isTop: isTopLeague(fixture),
    home: fixture.teams.home.name,
    away: fixture.teams.away.name,
    homeLogo: fixture.teams.home.logo,
    awayLogo: fixture.teams.away.logo,
    time: fixture.fixture.date,
    ...statusInfo,
    // FOR YOUR SITE UI - these fields your site dey need
    match: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    pick: picks[idx],
    prediction: picks[idx],
    odds: odds[idx],
    bookmaker: bookmakers[fixture.fixture.id % bookmakers.length],
    bookmakers: bookmakers[fixture.fixture.id % bookmakers.length],
    code: `DD${fixture.fixture.id.toString().slice(-4)}`,
    bookingCode: `DD${fixture.fixture.id.toString().slice(-4)}`
  };
}

async function main() {
  let fixtures = await getFixtures();
  console.log(`Total today: ${fixtures.length}`);

  // SORT: Top leagues first - REAL top leagues only now
  fixtures.sort((a,b) => {
    const aTop = isTopLeague(a) ? 0 : 1;
    const bTop = isTopLeague(b) ? 0 : 1;
    if (aTop !== bTop) return aTop - bTop;
    return new Date(a.fixture.date) - new Date(b.fixture.date);
  });

  const topCount = fixtures.filter(isTopLeague).length;
  console.log(`Real Top leagues found: ${topCount} - ${fixtures.filter(isTopLeague).slice(0,5).map(f=>f.league.name).join(', ')}`);

  const predictions = fixtures.slice(0, 35).map(makePrediction);

  // Write to BOTH places your site dey read
  fs.writeFileSync('data.json', JSON.stringify(predictions, null, 2));
  fs.writeFileSync('bettingsite/data.json', JSON.stringify(predictions, null, 2));
  // Also write to root if your site reads from there
  try { fs.writeFileSync('./bettingsite/data.json', JSON.stringify(predictions, null, 2)); } catch(e){}
  
  console.log(`DONE: Wrote ${predictions.length} - Top first`);
}

main();
