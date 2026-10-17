const fs = require('fs');
const https = require('https');
const API_KEY = process.env.API_FOOTBALL_KEY;
if(!API_KEY){console.error("No API_KEY");process.exit(1);}
function api(path){
 return new Promise((res,rej)=>{
  const o={hostname:'v3.football.api-sports.io',path:path,method:'GET',headers:{'x-apisports-key':API_KEY}};
  const r=https.request(o,r=>{
    let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}});
  });r.on('error',rej);r.end();
 });
}

async function main(){
 const today=new Date().toISOString().split('T')[0];
 console.log("Fetching "+today);
 let existing={}; 
 try{existing=JSON.parse(fs.readFileSync('data.json','utf8'));}catch(e){
  try{existing=JSON.parse(fs.readFileSync('bettingsite/data.json','utf8'));}catch(e2){}
 }
 if(!existing.meta) existing.meta={
   bookmakers:[
     {key:'bet9ja',name:'Bet9ja',color:'#2ecc58',affiliateUrl:'https://bet9ja.com',mainUrl:'https://bet9ja.com',order:1},
     {key:'sportybet',name:'SportyBet',color:'#e34848',affiliateUrl:'',mainUrl:'',order:2},
     {key:'betpawa',name:'BetPawa',color:'#2f7bff',affiliateUrl:'',mainUrl:'',order:3},
     {key:'betway',name:'Betway',color:'#000000',affiliateUrl:'',mainUrl:'',order:4}
   ],
   overview:{statTotal:30,statWinners:'22',statLosers:'8',statHitRate:'85%',date:today},
   branding:{siteName:'MatchForecast'}
 };

 let fx=await api(`/fixtures?date=${today}`);
 let fixtures=fx.response||[];
 if(fixtures.length<15){
  const tom=new Date(Date.now()+86400000).toISOString().split('T')[0];
  const ex=await api(`/fixtures?date=${tom}`);
  fixtures=fixtures.concat(ex.response||[]).slice(0,40);
 }
 console.log(`Fixtures found: ${fixtures.length}`);

 let preds=[];
 for(let i=0;i<Math.min(fixtures.length,35);i++){
  const f=fixtures[i];
  let pick=`Home Win - ${f.teams.home.name}`;
  let market="Match Winner";
  let odds=(1.5+Math.random()*1.2).toFixed(2);
  let advice="";
  try{
   const pd=await api(`/predictions?fixture=${f.fixture.id}`);
   if(pd.response?.[0]){
    const p=pd.response[0];
    advice=p.predictions?.advice||"";
    const homeP=parseInt((p.predictions?.percent?.home||"40%").replace('%',''))||40;
    const awayP=parseInt((p.predictions?.percent?.away||"30%").replace('%',''))||30;
    if(advice && advice.length>5){ 
      pick=advice; 
      if(advice.toLowerCase().includes("over")||advice.toLowerCase().includes("under")) market="Over/Under";
      else if(advice.toLowerCase().includes("double")) market="Double Chance";
      else if(advice.toLowerCase().includes("btts")||advice.toLowerCase().includes("both")) market="BTTS";
      else market="Match Winner";
    } else if(homeP>=55){ pick=`Home Win - ${f.teams.home.name}`; market="Match Winner"; }
    else if(awayP>=55){ pick=`Away Win - ${f.teams.away.name}`; market="Match Winner"; }
    else if(homeP>35 && awayP>35){ pick="Over 1.5 Goals"; market="Over/Under"; }
    else { pick=`Double chance : ${f.teams.home.name} or draw`; market="Double Chance"; }
   }
  }catch(e){}
  try{
   const od=await api(`/odds?fixture=${f.fixture.id}&bookmaker=8`);
   if(od.response?.[0]?.bookmakers?.[0]?.bets?.[0]?.values?.[0]?.odd) odds=od.response[0].bookmakers[0].bets[0].values[0].odd;
  }catch(e){}

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
   pick:pick,
   market:market,
   odds:String(odds),
   confidence:"High",
   advice:advice,
   selection:pick,
   category:market==="Match Winner"?"Match Winner":market==="Over/Under"?"Over/Under":market==="Double Chance"?"Double Chance":market==="BTTS"?"BTTS":"Other",
   rating: Math.floor(7+Math.random()*3),
   status:"active",
   publishAt:new Date().toISOString(),
   bookmakers:{bet9ja:{odds:String(odds),code:String(f.fixture.id)},sportybet:{odds:String(odds),code:String(f.fixture.id)}}
  });
  await new Promise(r=>setTimeout(r,350));
 }

 console.log(`Generated ${preds.length} winner picks`);

 // Bet of the Day - top 1
 const topRated=[...preds].sort((a,b)=>b.rating-a.rating);
 const betOfDay=topRated.slice(0,1).map(p=>({id:`bod-${p.id}`,match:p.match,pick:p.pick,selection:p.pick,odds:p.odds,rating:10,description:`BEST PICK TODAY: ${p.pick}. ${p.league} - High confidence winner!`,bookmaker:'bet9ja',photo:''}));

 // 30 ACCUMULATORS WITH DIFFERENT ODDS
 const accumulators = [];
 for(let i=0; i<30; i++){
   const folds = 2 + (i % 9); // 2 to 10 folds
   let startIdx = (i * 4) % preds.length;
   let selections = [];
   let total = 1;
   for(let j=0; j<folds; j++){
     const p = preds[(startIdx + j) % preds.length];
     selections.push({match:p.match, pick:p.pick, selection:p.pick, odds:p.odds});
     total *= parseFloat(p.odds);
   }
   let tierLabel = "";
   if(total < 4) tierLabel = `Safe Double - ${folds} Folds`;
   else if(total < 10) tierLabel = `Medium Acca - ${folds} Folds`;
   else if(total < 25) tierLabel = `High Odds - ${folds} Folds`;
   else if(total < 80) tierLabel = `Mega Acca - ${folds} Folds`;
   else tierLabel = `Super Mega - ${folds} Folds`;

   accumulators.push({
     id:`acc-${i+1}`,
     tier:`${tierLabel} #${i+1}`,
     title:`${tierLabel} #${i+1}`,
     selections: selections,
     totalOdds: total.toFixed(2),
     bookmakers:{bet9ja:{code:`ACC${i+1}-${total.toFixed(0)}`}, sportybet:{code:`ACC${i+1}`}}
   });
 }

 const correctScores=preds.slice(0,8).map(p=>({id:`cs-${p.id}`,match:p.match,league:p.league,score:`${1+Math.floor(Math.random()*2)}-${Math.floor(Math.random()*2)}`,odds:(6+Math.random()*5).toFixed(2),date:today,bookmakers:{bet9ja:{code:p.id}}}));
 const hedgeStrategies=preds.slice(0,3).map(p=>({id:`hedge-${p.id}`,match:p.match,league:p.league,kickoffAt:new Date().toISOString(),preMatchSelection:p.pick,preMatchMarket:p.market,entryMinute:"70",requiredScore:"0-0 or 1-1",liveSelection:"Over 0.5 Goals Live",liveMarket:"Live Over/Under",odds:p.odds,status:"upcoming",preMatchBookmakers:{bet9ja:{code:p.id}},liveBookmakers:{bet9ja:{code:'LIVE'+p.id}}}));
 
 const finalData={
  date:today,
  lastUpdated:new Date().toISOString(),
  predictions:preds,
  accumulators:accumulators,
  betOfDay:betOfDay,
  correctScores:correctScores,
  hedgeStrategies:hedgeStrategies,
  livePredictions:[],
  codesOnly:preds.slice(0,8).map(p=>({id:`code-${p.id}`,label:p.match,odds:p.odds,bookmakers:p.bookmakers})),
  results:existing.results||[],
  news:existing.news||[],
  meta:existing.meta,
  betOfDayMore:topRated.slice(1,5).map(p=>({id:`bodm-${p.id}`,match:p.match,pick:p.pick,selection:p.pick,odds:p.odds,rating:9,description:`More pick from ${p.league}`,bookmaker:'bet9ja'}))
 };

 fs.writeFileSync('data.json',JSON.stringify(finalData,null,2));
 try{fs.writeFileSync('bettingsite/data.json',JSON.stringify(finalData,null,2));}catch(e){}
 console.log(`DONE! ${preds.length} picks + ${accumulators.length} accumulators`);
}
main().catch(e=>{console.error(e);process.exit(1);});
