const fs = require('fs');

// ===== TOP LEAGUES PRIORITY - THESE MUST COME FIRST =====
const TOP_LEAGUES = [
  39,  // Premier League - England
  140, // La Liga - Spain
  135, // Serie A - Italy
  78,  // Bundesliga - Germany
  61,  // Ligue 1 - France
  2,   // Champions League
  3,   // Europa League
  45,  // FA Cup
  48,  // EFL Cup - Carabao
  15,  // FIFA Club World Cup
  848, // Conference League
  531, // UEFA Super Cup
  42,  // Championship - England (still top)
  88,  // Eredivisie - Netherlands
  94   // Primeira Liga - Portugal
];

const TOP_LEAGUE_NAMES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Champions League", "Europa League", "Eredivisie", "Primeira Liga"];

function isTopLeague(fixture) {
  // Check by ID
  if (TOP_LEAGUES.includes(fixture.league.id)) return true;
  // Check by name backup
  const name = fixture.league.name;
  return TOP_LEAGUE_NAMES.some(t => name.includes(t));
}

async function getFixtures() {
  // ... your existing fetch code here ...
  // Example - keep your API key logic
  const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;
  const today = new Date().toISOString().split('T')[0];
  
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  const json = await res.json();
  return json.response || [];
}

function getStatus(fixture) {
  const statusShort = fixture.fixture.status.short;
  const elapsed = fixture.fixture.status.elapsed;
  const goalsHome = fixture.goals.home ?? 0;
  const goalsAway = fixture.goals.away ?? 0;

  if (["1H", "HT", "2H", "ET", "P", "LIVE"].includes(statusShort)) {
    return {
      status: "live",
      statusLabel: `LIVE · ${elapsed ? elapsed + "'" : statusShort} · ${goalsHome}-${goalsAway}`,
      color: "red"
    };
  }
  if (["FT", "AET", "PEN"].includes(statusShort)) {
    return {
      status: "finished",
      statusLabel: `FINISHED · ${goalsHome}-${goalsAway}`,
      color: "green"
    };
  }
  // Upcoming
  const d = new Date(fixture.fixture.date);
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return {
    status: "upcoming",
    statusLabel: `UPCOMING · ${timeStr}`,
    color: "yellow"
  };
}

async function main() {
  const fixtures = await getFixtures();
  console.log(`Total fetched today: ${fixtures.length}`);

  // ===== PRIORITY SORT =====
  const topFixtures = fixtures.filter(isTopLeague);
  const otherFixtures = fixtures.filter(f => !isTopLeague(f));

  console.log(`Top league fixtures: ${topFixtures.length}`);
  console.log(`Other fixtures: ${otherFixtures.length}`);

  let finalFixtures = [];
  
  if (topFixtures.length >= 10) {
    // If we have enough top leagues, use ONLY top leagues
    finalFixtures = topFixtures.slice(0, 35);
    console.log("✅ Using ONLY TOP LEAGUES today (enough found)");
  } else if (topFixtures.length > 0) {
    // We have some top leagues, fill top first, then add others
    finalFixtures = [...topFixtures, ...otherFixtures].slice(0, 35);
    console.log(`✅ Using ${topFixtures.length} top + ${35 - topFixtures.length} others`);
  } else {
    // No top leagues today - use whatever we have
    finalFixtures = otherFixtures.slice(0, 35);
    console.log("⚠️ No top league today, using other leagues");
  }

  // Sort final list: Top leagues come first in display
  finalFixtures.sort((a, b) => {
    const aTop = isTopLeague(a) ? 0 : 1;
    const bTop = isTopLeague(b) ? 0 : 1;
    if (aTop !== bTop) return aTop - bTop;
    // Then sort by time
    return new Date(a.fixture.date) - new Date(b.fixture.date);
  });

  const predictions = finalFixtures.map(f => {
    const statusInfo = getStatus(f);
    return {
      id: f.fixture.id,
      league: f.league.name,
      leagueId: f.league.id,
      isTop: isTopLeague(f),
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeLogo: f.teams.home.logo,
      awayLogo: f.teams.away.logo,
      time: f.fixture.date,
      ...statusInfo,
      prediction: "Over 1.5", // your logic here
      odds: "1.40"
    };
  });

  // Live count
  const liveNow = predictions.filter(p => p.status === 'live').length;
  console.log(`Real Live Now: ${liveNow}`);

  fs.writeFileSync('data.json', JSON.stringify(predictions, null, 2));
  fs.writeFileSync('bettingsite/data.json', JSON.stringify(predictions, null, 2));
  
  console.log(`✅ Wrote data.json & bettingsite/data.json`);
  console.log(`DONE: ${predictions.length} predictions (${predictions.filter(p=>p.isTop).length} top leagues)`);
}

main();
