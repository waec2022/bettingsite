const fs=require('fs');const https=require('https');
const API_KEY=process.env.API_FOOTBALL_KEY;
function api(p){return new Promise((res,rej)=>{const o={hostname:'v3.football.api-sports.io',path:p,method:'GET',headers:{'x-apisports-key':API_KEY}};const r=https.request(o,rs=>{let d='';rs.on('data',c=>d+=c);rs.on('end',()=>{try{res(JSON.parse(d))}catch(e){rej(e)}});});r.on('error',rej);r.end();});}
async function main(){
 const today=new Date().toISOString().split('T')[0];
 let fx=await api(`/fixtures?date=${today}`);let fixtures=fx.response||[];
 let liveResp=await api(`/fixtures?live=all`);let liveFixtures=liveResp.response||[];
 console.log(`Today: ${fixtures.length}, Real Live Now: ${liveFixtures.length}`);

 let livePredictions=[];
 for(let f of fixtures.slice(0,20)){
   const short=f.fixture.status.short; // NS, 1H, FT etc
   const elapsed=f.fixture.status.elapsed||0;
   const goals=`${f.goals.home??0}-${f.goals.away??0}`;
   let status, label;
   if(['FT','AET','PEN'].includes(short)){status='finished';label=`FINISHED · ${goals}`;}
   else if(['1H','2H','HT','ET','BT','P','SUSP','INT'].includes(short)){status='live';label=`LIVE · ${elapsed}' · ${goals}`;}
   else {status='upcoming';label=`UPCOMING · ${new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;}
   
   // Override with real live data if available
   const realLive=liveFixtures.find(l=>l.fixture.id===f.fixture.id);
   if(realLive){status='live';label=`LIVE · ${realLive.fixture.status.elapsed||elapsed}' · ${realLive.goals.home}-${realLive.goals.away}`;}

   livePredictions.push({id:f.fixture.id,home:f.teams.home.name,away:f.teams.away.name,match:`${f.teams.home.name} vs ${f.teams.away.name}`,pick:"Over 0.5 Goals Live",odds:(1.8+Math.random()).toFixed(2),status:status,statusLabel:label,minute:elapsed,goals:goals,kickoffAt:f.fixture.date,short:short});
 }
 // Add any other real live not in today list
 for(let f of liveFixtures){if(!livePredictions.find(x=>x.id===f.fixture.id)){livePredictions.push({id:f.fixture.id,home:f.teams.home.name,away:f.teams.away.name,match:`${f.teams.home.name} vs ${f.teams.away.name}`,pick:"Over 0.5 Goals Live",odds:(1.9+Math.random()).toFixed(2),status:'live',statusLabel:`LIVE · ${f.fixture.status.elapsed||0}' · ${f.goals.home}-${f.goals.away}`,minute:f.fixture.status.elapsed||0,goals:`${f.goals.home}-${f.goals.away}`,kickoffAt:f.fixture.date,short:f.fixture.status.short});}}

 let hedgeStrategies=fixtures.slice(0,6).map(f=>{
   const short=f.fixture.status.short;const elapsed=f.fixture.status.elapsed||0;
   let status,label; 
   if(['FT','AET','PEN'].includes(short)){status='finished';label='FINISHED';}
   else if(['1H','2H','HT','ET'].includes(short)){status='live';label=`LIVE · ${elapsed}'`;}
   else {status='upcoming';label='UPCOMING';}
   return {id:f.fixture.id,home:f.teams.home.name,away:f.teams.away.name,match:`${f.teams.home.name} vs ${f.teams.away.name}`,league:f.league.name,preMatchSelection:"Home Win",liveSelection:"Highest Scoring Half - 2nd Half",odds:"1.95",status:status,statusLabel:label,minute:elapsed,kickoffAt:f.fixture.date,short:short};
 });

 let existing={};try{existing=JSON.parse(fs.readFileSync('data.json','utf8'));}catch(e){try{existing=JSON.parse(fs.readFileSync('bettingsite/data.json','utf8'));}catch(e2){}}
 const finalData={...existing,date:today,lastUpdated:new Date().toISOString(),livePredictions:livePredictions,hedgeStrategies:hedgeStrategies,predictions:existing.predictions||[],results:existing.results||[],accumulators:existing.accumulators||[],meta:existing.meta};
 fs.writeFileSync('data.json',JSON.stringify(finalData,null,2));fs.writeFileSync('bettingsite/data.json',JSON.stringify(finalData,null,2));
 console.log(`DONE: Live ${livePredictions.length} (Upcoming/Live/Finished) + Hedge ${hedgeStrategies.length}`);
}
main();
