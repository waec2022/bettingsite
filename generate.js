const fs = require('fs');

async function getFixtures() {
  const key = process.env.API_FOOTBALL_KEY;
  const today = new Date().toISOString().split('T')[0];
  const r = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
    headers: { 'x-apisports-key': key }
  });
  const j = await r.json();
  return j.response || [];
}

function statusInfo(f) {
  const s = f.fixture.status.short;
  const e = f.fixture.status.elapsed;
  if (["1H","HT","2H","LIVE"].includes(s)) return {status:"live", label:`LIVE ${e}'`, color:"red"};
  if (["FT"].includes(s)) return {status:"finished", label:`FT ${f.goals.home}-${f.goals.away}`, color:"green"};
  const t = new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  return {status:"upcoming", label:t, color:"yellow"};
}

async function main() {
  const fixtures = await getFixtures();
  if (!fixtures.length) return;
  
  const TOP = [39,140,135,78,61,2,3];
  fixtures.sort((a,b) => (TOP.includes(a.league.id)?0:1) - (TOP.includes(b.league.id)?0:1));

  const data = fixtures.slice(0,35).map(f => {
    const st = statusInfo(f);
    return {
      id: f.fixture.id,
      league: f.league.name,
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeLogo: f.teams.home.logo,
      awayLogo: f.teams.away.logo,
      time: f.fixture.date,
      status: st.status,
      statusLabel: st.label,
      color: st.color,
      prediction: "Over 1.5",
      odds: "1.40",
      bookmaker: "", // EMPTY - you go add yourself
      code: ""       // EMPTY - you go add yourself
    };
  });

  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log("Restored to how e been dey before - " + data.length + " games");
}

main();
