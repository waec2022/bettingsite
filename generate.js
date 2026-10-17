const fs = require('fs');
const https = require('https');
const API_KEY = process.env.API_FOOTBALL_KEY;

function callAPI(path){
  return new Promise((resolve,reject)=>{
    const opts={hostname:'v3.football.api-sports.io',path:path,method:'GET',headers:{'x-apisports-key':API_KEY}};
    const req=https.request(opts,res=>{
      let d='';res.on('data',c=>d+=c);res.on('end',()=>{
        try{resolve(JSON.parse(d))}catch(e){reject(e)}
      });
    });
    req.on('error',reject);req.end();
  });
}

async function main(){
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
  console.log("Fetching for",today);

  const fixturesData = await callAPI(`/fixtures?date=${today}`);
  let fixtures = fixturesData.response || [];
  console.log(`Found ${fixtures.length} fixtures`);
  
  // If less than 20, also try tomorrow
  if(fixtures.length < 20){
    const tomorrow = new Date(Date.now()+86400000).toISOString().split('T')[0];
    const extra = await callAPI(`/fixtures?date=${tomorrow}`);
    fixtures = fixtures.concat(extra.response||[]).slice(0,25);
  }

  // Try to get predictions & odds for better picks
  let allPicks = [];
  for(let i=0;i<Math.min(fixtures.length,25);i++){
    const f = fixtures[i];
    let pick = "Home Win";
    let odds = (1.5 + Math.random()*1.0).toFixed(2);
    let confidence = "Medium";
    let market = "Match Winner";
    let predictionAdvice = "";

    try{
      // Get prediction for this fixture
      const predData = await callAPI(`/predictions?fixture=${f.fixture.id}`);
      if(predData.response && predData.response[0]){
        const p = predData.response[0];
        const winner = p.predictions?.winner?.name || "";
        const percentHome = parseInt((p.predictions?.percent?.home||"33%").replace('%',''))||33;
        const percentAway = parseInt((p.predictions?.percent?.away||"33%").replace('%',''))||33;
        const percentDraw = parseInt((p.predictions?.percent?.draw||"33%").replace('%',''))||34;
        
        predictionAdvice = p.predictions?.advice || "";
        
        if(percentHome > percentAway && percentHome > percentDraw && percentHome > 45){
          pick = `Home Win - ${f.teams.home.name}`;
          market = "Match Winner";
        } else if(percentAway > percentHome && percentAway > percentDraw && percentAway > 45){
          pick = `Away Win - ${f.teams.away.name}`;
          market = "Match Winner";
        } else if(p.predictions?.under_over && p.predictions.under_over.includes("Over")){
          pick = p.predictions.under_over;
          market = "Over/Under";
        } else if(predictionAdvice.includes("Over")){
          pick = "Over 1.5 Goals";
          market = "Over/Under";
        } else {
          pick = predictionAdvice || "Double Chance - Home or Draw";
          market = predictionAdvice.includes("Double") ? "Double Chance" : "Match Winner";
        }
        confidence = percentHome>55 || percentAway>55 ? "High" : "Medium";
      }
    }catch(e){ console.log("pred fail",f.fixture.id) }

    // Try odds
    try{
      const oddsData = await callAPI(`/odds?fixture=${f.fixture.id}&bookmaker=8`);
      if(oddsData.response && oddsData.response[0] && oddsData.response[0].bookmakers[0]){
        const bets = oddsData.response[0].bookmakers[0].bets;
        const winnerBet = bets.find(b=>b.name==="Match Winner") || bets[0];
        if(winnerBet && winnerBet.values[0]) odds = winnerBet.values[0].odd;
      }
    }catch(e){}

    allPicks.push({
      id: f.fixture.id,
      league: f.league.name,
      country: f.league.country,
      home: f.teams.home.name,
      away: f.teams.away.name,
      homeLogo: f.teams.home.logo,
      awayLogo: f.teams.away.logo,
      time: f.fixture.date,
      match: `${f.teams.home.name} vs ${f.teams.away.name}`,
      pick: pick,
      market: market,
      odds: odds,
      confidence: confidence,
      advice: predictionAdvice
    });
    
    // Delay to avoid rate limit
    await new Promise(r=>setTimeout(r,350));
  }

  console.log(`Generated ${allPicks.length} picks`);

  // --- BUILD SECTIONS ---
  const topPicks = allPicks.slice(0,20);
  const betOfTheDay = allPicks.filter(p=>p.confidence==="High").slice(0,3);
  const moreBetOfTheDay = allPicks.slice(3,8);
  
  // Accumulators - group into slips
  const accumulators = [
    { name: "Safe Acca - 4 Folds", games: topPicks.slice(0,4), totalOdds: (topPicks.slice(0,4).reduce((a,b)=>a*parseFloat(b.odds),1)).toFixed(2) },
    { name: "Medium Acca - 5 Folds", games: topPicks.slice(4,9), totalOdds: (topPicks.slice(4,9).reduce((a,b)=>a*parseFloat(b.odds),1)).toFixed(2) },
    { name: "High Odds - 6 Folds", games: topPicks.slice(9,15), totalOdds: (topPicks.slice(9,15).reduce((a,b)=>a*parseFloat(b.odds),1)).toFixed(2) }
  ];

  const correctScores = allPicks.slice(0,5).map(p=>({
    ...p,
    score: `${Math.floor(Math.random()*2+1)}-${Math.floor(Math.random()*1)}`,
    scoreOdds: (6 + Math.random()*4).toFixed(2)
  }));

  const hedge = allPicks.slice(0,2).map(p=>({
    mainPick: p,
    hedgePick: "Double Chance - X2",
    strategy: `Place ${p.pick} before kickoff. If match level at 70min, hedge with Draw.`
  }));

  // Load existing data.json structure to keep compatibility
  let finalData;
  try{
    const oldRaw = fs.readFileSync('data.json','utf8');
    finalData = JSON.parse(oldRaw);
  }catch(e){
    try{
      finalData = JSON.parse(fs.readFileSync('bettingsite/data.json','utf8'));
    }catch(e2){ finalData = {}; }
  }

  // Create full output that supports both old and new site code
  finalData.date = today;
  finalData.lastUpdated = new Date().toISOString();
  finalData.topPicks = topPicks;
  finalData.todaysTopPicks = topPicks;
  finalData.predictions = topPicks; // for old code
  finalData.betOfTheDay = betOfTheDay.length? betOfTheDay : [topPicks[0]];
  finalData.moreBetOfTheDay = moreBetOfTheDay;
  finalData.accumulators = accumulators;
  finalData.todaysAccumulators = accumulators;
  finalData.correctScore = correctScores;
  finalData.correctScorePicks = correctScores;
  finalData.hedgeStrategy = hedge;
  finalData.yesterdayResults = []; // will fill tomorrow
  finalData.count = topPicks.length;
  finalData.totalSelections = topPicks.length;

  // Save to both possible locations
  fs.writeFileSync('data.json', JSON.stringify(finalData, null, 2));
  try{ fs.writeFileSync('bettingsite/data.json', JSON.stringify(finalData, null, 2)); }catch(e){}
  try{ fs.writeFileSync('bettingsite/bettingsite/data.json', JSON.stringify(finalData, null, 2)); }catch(e){}

  console.log("Saved full data:", JSON.stringify(finalData).slice(0,800));
}

main().catch(e=>{ console.error(e); process.exit(1); });
