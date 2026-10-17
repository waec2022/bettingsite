const fs = require('fs');

async function getFixtures() {
  const API_KEY = process.env.API_FOOTBALL_KEY;
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  const data = await res.json();
  return data.response || [];
}

function getStatus(f) {
  const s = f.fixture.status.short;
  const el = f.fixture.status.elapsed;
  const gh = f.goals.home ?? 0;
  const ga = f.goals.away ?? 0;
  if (["1H","HT","2H","LIVE"].includes(s)) return { status: "live", statusLabel: `LIVE ${el}' ${gh}-${ga}`, color: "red" };
  if (["FT","AET","PEN"].includes(s)) return { status: "finished", statusLabel: `FT ${gh}-${ga}`, color: "green" };
  const t = new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  return { status: "upcoming", statusLabel: t, color: "yellow" };
}

async function main() {
  const fixtures = await getFixtures();
  console.log("Fetched:", fixtures.length);
  
  if (fixtures.length === 0) {
    console.log("No fixtures today");
    return;
  }

  // Top leagues first - EPL 39, LaLiga 140, Serie A 135, Bundesliga 78, UCL 2
  const TOP = [39,140,135,78,61,2,3];
  fixtures.sort((a,b) => {
    const at = TOP.includes(a.league.id) ? 0 : 1;
    const bt = TOP.includes(b.league.id) ? 0 : 1;
    return at - bt;
  });

  const predictions = fixtures.slice(0, 35).map(f => {
    const st = getStatus(f);
    return {
      id: f.fixture.id,
      league: f.league.name,
      leagueId: f.league.id,
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeLogo: f.teams.home.logo,
      awayLogo: f.teams.away.logo,
      time: f.fixture.date,
      status: st.status,
      statusLabel: st.statusLabel,
      color: st.color,
      prediction: "Over 1.5",
      pick: "Over 1.5",
      odds: "1.40",
      // EMPTY - you go add yourself, no demo
      bookmaker: "",
      code: "",
      bookingCode: ""
    };
  });

  // Write ONLY to root data.json - this is what your site reads
  fs.writeFileSync('data.json', JSON.stringify(predictions, null, 2));
  
  // Also try bettingsite folder if e exist (no error if no exist)
  try {
    fs.writeFileSync('bettingsite/data.json', JSON.stringify(predictions, null, 2));
  } catch(e) {}

  console.log(`WROTE ${predictions.length} - site go show now, codes empty`);
}

main();
