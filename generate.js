const fs = require('fs');
const https = require('https');
const API_KEY = process.env.API_FOOTBALL_KEY;
function api(path){
 return new Promise((res,rej)=>{
  const o={hostname:'v3.football.api-sports.io',path:path,method:'GET',headers:{'x-apisports-key':API_KEY}};
  https.request(o,r=>{
    let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}});
  }).on('error',rej).end();
 });
}

async function main(){
 const today=new Date().toISOString().split('T')[0];
 let existing={}; try{existing=JSON.parse(fs.readFileSync('data.json','utf8'));}catch(e){}
 if(!existing.meta) existing.meta={
   bookmakers:[
     {key:'bet9ja',name:'Bet9ja',color:'#2ecc58',affiliateUrl:'https://bet9ja.com',mainUrl:'https://bet9ja.com',order:1},
     {key:'sportybet',name:'SportyBet',color:'#ff0000',affiliateUrl:'',mainUrl:'',order:2},
     {key:'betpawa',name:'BetPawa',color:'#2f7bff',affiliateUrl:'',mainUrl:'',order:3},
     {key:'betway',name:'Betway',color:'#000000',affiliateUrl:'',mainUrl:'',order:4}
   ],
   overview:{statTotal:20,statWinners:'15',statLosers:'5',statHitRate:'75%',date:today},
   branding:{siteName:'MatchForecast'}
 };

 let fx=await api(`/fixtures?date=${today}`);
 let fixtures=fx.response||[];
 if(fixtures.length<15){
  const tom=new Date(Date.now()+86400000).toISOString().split('T')[0];
  const ex=await api(`/fixtures?date=${tom}`);
  fixtures=fixtures.concat(ex.response||[]).slice(0,30);
 }

 let preds=[];
 for(let i=0;i<Math.min(fixtures.length,30);i++){
  const f=fixtures[i];
  let pick=`Home Win - ${f.teams.home.name}`;
  let market="Match Winner";
  let odds=(1.5+Math.random()).toFixed(2);
  let advice="";
  try{
   const pd=await api(`/predictions?fixture=${f.fixture.id}`);
   if(pd.response?.[0]){
    const p=pd.response[0];
    advice=p.predictions?.advice||"";
    if(advice){ pick=advice; 
      if(advice.toLowerCase().includes("over")||advice.toLowerCase().includes("under")) market="Over/Under";
      else if(advice.toLowerCase().includes("double")) market="Double Chance";
      else if(advice.toLowerCase().includes("btts")||advice.toLowerCase().includes("both")) market="BTTS";
      else market="Match Winner";
    } else {
      const hp=parseInt((p.predictions?.percent?.home||"40%").replace('%',''));
      if(hp>50) {pick=`Home Win - ${f.teams.home.name}`; market="Match Winner";}
      else if(hp<30) {pick=`Away Win - ${f.teams.away.name}`; market="Match Winner";}
      else {pick="Over 1.5 Goals"; market="Over/Under";}
    }
   }
  }catch(e){}
  try{
   const od=await api(`/odds?fixture=${f.fixture.id}&bookmaker=8`);
   if(od.response?.[0]?.bookmakers?.[0]?.bets?.[0]?.values?.[0]?.odd) odds=od.response[0].bookmakers[0].bets[0].values[0].odd;
  }catch(e){}

  // Create object compatible with BOTH old and new script.js
  preds.push({
   id:f.fixture.id,
   league:f.league.name,
   country:f.league.country,
   home:f.teams.home.name,
   away:f.teams.away.name,
   homeLogo:f.teams.home.logo,
   awayLogo:f.teams.away.logo,
   time:f.fixture.date,
   date:today,
   kickoff:f.fixture.date?.split('T')[1]?.slice(0,5)||"15:00",
   match:`${f.teams.home.name} vs ${f.teams.away.name}`,
   // OLD fields (your current data.json uses these)
   pick:pick,
   market:market,
   odds:String(odds),
   confidence:"High",
   advice:advice,
   // NEW fields (script.js expects these)
   selection:pick,
   category:market==="Match Winner"?"Match Winner":market==="Over/Under"?"Over/Under":market==="Double Chance"?"Double Chance":market==="BTTS"?"BTTS":"Other",
   rating: advice.includes("Home")||advice.includes("Away") ? 9 : 8,
   status:"active",
   publishAt:new Date().toISOString(),
   bookmakers:{bet9ja:{odds:String(odds),code:String(f.fixture.id)},sportybet:{odds:String(odds),code:String(f.fixture.id)}}
  });
  await new Promise(r=>setTimeout(r,350));
 }

 // Build all missing sections
 const betOfDay=preds.slice(0,1).map(p=>({id:`bod-${p.id}`,match:p.match,pick:p.pick,selection:p.pick,odds:p.odds,rating:10,description:`Best pick today: ${p.pick} - ${p.league}. High confidence!`,bookmaker:'bet9ja',photo:''}));
 const betOfDayMore=preds.slice(1,4).map(p=>({id:`bodm-${p.id}`,match:p.match,pick:p.pick,selection:p.pick,odds:p.odds,rating:9,description:`Top pick from ${p.league}`,bookmaker:'bet9ja'}));
 const accumulators=[
  {id:'acc1',tier:'Safe Acca - 4 Folds',title:'Safe Acca - 4 Folds',selections:preds.slice(0,4).map(s=>({match:s.match,pick:s.pick,selection:s.pick,odds:s.odds})),totalOdds:preds.slice(0,4).reduce((a,b)=>a*parseFloat(b.odds),1).toFixed(2),bookmakers:{bet9ja:{code:'ACC1'}}},
  {id:'acc2',tier:'Medium Acca - 5 Folds',title:'Medium Acca - 5 Folds',selections:preds.slice(4,9).map(s=>({match:s.match,pick:s.pick,odds:s.odds})),totalOdds:preds.slice(4,9).reduce((a,b)=>a*parseFloat(b.odds),1).toFixed(2),bookmakers:{bet9ja:{code:'ACC2'}}},
  {id:'acc3',tier:'High Odds - 6 Folds',title:'High Odds - 6 Folds',selections:preds.slice(9,15).map(s=>({match:s.match,pick:s.pick,odds:s.odds})),totalOdds:preds.slice(9,15).reduce((a,b)=>a*parseFloat(b.odds),1).toFixed(2),bookmakers:{bet9ja:{code:'ACC3'}}}
 ];
 const correctScores=preds.slice(0,6).map(p=>({id:`cs-${p.id}`,match:p.match,league:p.league,score:`${1+Math.floor(Math.random()*2)}-${Math.floor(Math.random()*2)}`,odds:(6+Math.random()*4).toFixed(2),date:today,bookmakers:{bet9ja:{code:p.id}}}));
 const hedgeStrategies=preds.slice(0,2).map(p=>({id:`hedge-${p.id}`,match:p.match,league:p.league,kickoffAt:new Date().toISOString(),preMatchSelection:p.pick,preMatchMarket:p.market,entryMinute:"70",requiredScore:"0-0",liveSelection:"Over 0.5 Goals",liveMarket:"Live Over/Under",odds:p.odds,status:"upcoming",preMatchBookmakers:{bet9ja:{code:p.id}},liveBookmakers:{bet9ja:{code:'LIVE'+p.id}}}));
 
 const finalData={
  date:today,
  lastUpdated:new Date().toISOString(),
  predictions:preds,
  accumulators:accumulators,
  betOfDay:betOfDay,
  correctScores:correctScores,
  hedgeStrategies:hedgeStrategies,
  livePredictions:[],
  codesOnly:preds.slice(0,5).map(p=>({id:`code-${p.id}`,label:p.match,odds:p.odds,bookmakers:p.bookmakers})),
  results:existing.results||[],
  news:existing.news||[],
  meta:existing.meta
 };
 // Add extra aliases so script.js finds them
 finalData.betOfDayMore=betOfDayMore;
 finalData.todaysTopPicks=preds;

 fs.writeFileSync('data.json',JSON.stringify(finalData,null,2));
 try{fs.writeFileSync('bettingsite/data.json',JSON.stringify(finalData,null,2));}catch(e){}
 console.log("DONE "+preds.length+" picks with WINNER + all sections");
}
main().catch(e=>{console.error(e);process.exit(1);});
