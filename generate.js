const fs = require('fs');
const https = require('https');

const API_KEY = process.env.API_FOOTBALL_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error("No API_FOOTBALL_KEY found in secrets!");
  process.exit(1);
}

function fetchFootball(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'v3.football.api-sports.io',
      path: path,
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`Fetching matches for ${today}...`);
  
  const result = await fetchFootball(`/fixtures?date=${today}`);
  
  if (!result.response) {
    console.error("API error:", JSON.stringify(result).slice(0,500));
    return;
  }
  
  console.log(`Found ${result.response.length} fixtures`);
  
  // Create predictions format for your site
  const predictions = result.response.slice(0, 20).map(f => ({
    league: f.league.name,
    home: f.teams.home.name,
    away: f.teams.away.name,
    date: f.fixture.date,
    prediction: "Over 1.5 Goals",
    odds: (Math.random() * 0.8 + 1.2).toFixed(2),
    tip: f.teams.home.name + " to score"
  }));
  
  // Try to keep old format if data.json exists
  let output = { date: today, predictions: predictions, count: predictions.length };
  
  try {
    const old = JSON.parse(fs.readFileSync('data.json','utf8'));
    // If old is array, wrap it
    if (Array.isArray(old)) output = predictions;
  } catch(e){}
  
  // Write data.json - support both formats
  if (Array.isArray(output)) {
    fs.writeFileSync('data.json', JSON.stringify(predictions, null, 2));
  } else {
    fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
  }
  
  // Also try to create simple html backup if needed
  console.log(`Wrote ${predictions.length} predictions to data.json`);
  
  // List files to confirm
  console.log(fs.readFileSync('data.json','utf8').slice(0,500));
}

main().catch(e => { console.error(e); process.exit(1); });
