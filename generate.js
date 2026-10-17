const fs = require('fs');

const TOP_LEAGUES_IDS = [39, 140, 135, 78, 61, 2, 3, 45, 48, 15, 848, 94, 88, 42];

function isTopLeague(fixture) {
  return TOP_LEAGUES_IDS.includes(fixture.league.id);
}

async function getFixtures() {
  const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;
  if (!API_KEY) {
    throw new Error("API_FOOTBALL_KEY missing in secrets");
  }
  const today = new Date().toISOString().split('T')[0];
  console.log("Fetching for date:", today);
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  const json = await res.json();
  if (json.errors && Object.keys(json.errors).length > 0) {
    console.error("API Error:", json.errors);
  }
  return json.response || [];
}

function getStatus(fixture) {
  const s = fixture.fixture.status.short;
  const elapsed = fixture.fixture.status.elapsed;
  const gh = fixture.goals.home ?? 0;
  const ga = fixture.goals.away ?? 0;
  if (["1H","HT","2H","ET","P","LIVE","BT","INT"].includes(s)) {
    return { status: "live", statusLabel: `LIVE · ${elapsed ? elapsed+"'" : s} · ${gh}-${ga}`, color: "red", minute: elapsed };
  }
  if (["FT","AET","PEN","AWD","WO"].includes(s)) {
    return { status: "finished", statusLabel: `FINISHED · ${gh}-${ga}`, color: "green" };
  }
  const d = new Date(fixture.fixture.date);
  const timeStr = d.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true});
  return { status: "upcoming", statusLabel: `UPCOMING · ${timeStr}`, color: "yellow" };
}

function makePrediction(fixture) {
  const picks = ["Over 1.5", "BTTS Yes", "Home Win", "Double Chance 1X", "Over 2.5", "Away Win", "Under 3.5"];
  const oddsArr = ["1.40","1.65","1.85","1.32","1.90","2.10","1.55"];
  const bookmakers = ["Bet9ja","SportyBet","BetPawa","Betway"];
  
  const idx = fixture.fixture.id % picks.length;
  const statusInfo = getStatus(fixture);
  
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  
  return {
    id: fixture.fixture.id,
    fixtureId: fixture.fixture.id,
    league: fixture.league.name,
    leagueId: fixture.league.id,
    leagueLogo: fixture.league.logo,
    isTop: isTopLeague(fixture),
    home: home,
    away: away,
    homeLogo: fixture.teams.home.logo,
    awayLogo: fixture.teams.away.logo,
    time: fixture.fixture.date,
    date: fixture.fixture.date,
    status: statusInfo.status,
    statusLabel: statusInfo.statusLabel,
    color: statusInfo.color,
    minute: statusInfo.minute || null,
    match: `${home} vs ${away}`,
    pick: picks[idx],
    prediction: picks[idx],
    odds: oddsArr[idx],
    odd: oddsArr[idx],
    bookmaker: bookmakers[fixture.fixture.id % bookmakers.length],
    bookmakers: bookmakers[fixture.fixture.id % bookmakers.length],
    code: `DD${fixture.fixture.id.toString().slice(-5)}`,
    bookingCode: `DD${fixture.fixture.id.toString().slice(-5)}`,
    score: `${fixture.goals.home ?? 0}-${fixture.goals.away ?? 0}`
  };
}

async function main() {
  try {
    let fixtures = await getFixtures();
    console.log(`Total fixtures fetched today: ${fixtures.length}`);

    if (fixtures.length === 0) {
      console.log("No fixtures today, keeping old file");
      return;
    }

    // Sort: Real Top Leagues First - EPL, LaLiga, UCL will be on top
    fixtures.sort((a,b) => {
      const aTop = isTopLeague(a) ? 0 : 1;
      const bTop = isTopLeague(b) ? 0 : 1;
      if (aTop !== bTop) return aTop - bTop;
      return new Date(a.fixture.date) - new Date(b.fixture.date);
    });

    const topCount = fixtures.filter(isTopLeague).length;
    console.log(`Real Top leagues (EPL, LaLiga, UCL etc): ${topCount}`);

    const predictions = fixtures.slice(0, 40).map(makePrediction);

    if (!fs.existsSync('bettingsite')) fs.mkdirSync('bettingsite', {recursive:true});

    fs.writeFileSync('data.json', JSON.stringify(predictions, null, 2));
    fs.writeFileSync('bettingsite/data.json', JSON.stringify(predictions, null, 2));
    
    console.log(`SUCCESS: Wrote ${predictions.length} predictions`);
  } catch (e) {
    console.error("Error in generate:", e);
    process.exit(1);
  }
}

main();
