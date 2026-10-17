const fs = require('fs');

const TOP_LEAGUES_IDS = [39, 140, 135, 78, 61, 2, 3, 45, 48, 15, 848, 94, 88, 42];

function isTopLeague(fixture) {
  return TOP_LEAGUES_IDS.includes(fixture.league.id);
}

async function getFixtures() {
  const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;
  const today = new Date().toISOString().split('T')[0];
  console.log("Fetching for date:", today);
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
  if (["1H","HT","2H","ET","P","LIVE","BT","INT"].includes(s)) {
    return { status: "live", statusLabel: `LIVE · ${elapsed ? elapsed+"'" : s} · ${gh}-${ga}`, color: "red" };
  }
  if (["FT","AET","PEN"].includes(s)) {
    return { status: "finished", statusLabel: `FINISHED · ${gh}-${ga}`, color: "green" };
  }
  const d = new Date(fixture.fixture.date);
  const timeStr = d.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true});
  return { status: "upcoming", statusLabel: `UPCOMING · ${timeStr}`, color: "yellow" };
}

function makePrediction(fixture) {
  const picks = ["Over 1.5", "BTTS Yes", "Home Win", "Double Chance 1X", "Over 2.5"];
  const oddsArr = ["1.40","1.65","1.85","1.32","1.90"];
  const idx = fixture.fixture.id % picks.length;
  const statusInfo = getStatus(fixture);
  
  return {
    id: fixture.fixture.id,
    league: fixture.league.name,
    leagueId: fixture.league.id,
    leagueLogo: fixture.league.logo,
    isTop: isTopLeague(fixture),
    home: fixture.teams.home.name,
    away: fixture.teams.away.name,
    homeLogo: fixture.teams.home.logo,
    awayLogo: fixture.teams.away.logo,
    time: fixture.fixture.date,
    status: statusInfo.status,
    statusLabel: statusInfo.statusLabel,
    color: statusInfo.color,
    match: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    pick: picks[idx],
    prediction: picks[idx],
    odds: oddsArr[idx],
    // EMPTY - you go add yourself
    bookmaker: "",
    bookmakers: "",
    code: "",
    bookingCode: "",
    codes: []
  };
}

async function main() {
  try {
    let fixtures = await getFixtures();
    console.log(`Total today: ${fixtures.length}`);
    if (fixtures.length === 0) return;

    fixtures.sort((a,b) => {
      const aTop = isTopLeague(a) ? 0 : 1;
      const bTop = isTopLeague(b) ? 0 : 1;
      if (aTop !== bTop) return aTop - bTop;
      return new Date(a.fixture.date) - new Date(b.fixture.date);
    });

    const predictions = fixtures.slice(0, 40).map(makePrediction);

    if (!fs.existsSync('bettingsite')) fs.mkdirSync('bettingsite', {recursive:true});

    fs.writeFileSync('data.json', JSON.stringify(predictions, null, 2));
    fs.writeFileSync('bettingsite/data.json', JSON.stringify(predictions, null, 2));
    
    // Create empty codes file so CODES ONLY shows "No codes yet"
    const emptyCodes = [];
    fs.writeFileSync('codes.json', JSON.stringify(emptyCodes, null, 2));
    fs.writeFileSync('bettingsite/codes.json', JSON.stringify(emptyCodes, null, 2));
    
    console.log(`DONE: ${predictions.length} fixtures - NO demo codes, CODES ONLY empty`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
