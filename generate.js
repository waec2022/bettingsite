// TOP LEAGUES IDs - API-Football free plan includes them!
const TOP_LEAGUES = [39,140,135,78,61,140,2,3,5,848,45,11]; 
// 39=EPL, 140=LaLiga, 135=Serie A, 78=Bundesliga, 61=Ligue1, 2=Champions, 3=Europa, 5=Europa Conf, 848=Confederations etc

let fx=await api(`/fixtures?date=${today}`);
let fixtures=fx.response||[];

// SORT to bring top leagues first
fixtures = fixtures.sort((a,b)=>{
  const aIsTop = TOP_LEAGUES.includes(a.league.id) ? 0 : 1;
  const bIsTop = TOP_LEAGUES.includes(b.league.id) ? 0 : 1;
  return aIsTop - bIsTop;
});

console.log(`Total: ${fixtures.length}, Top leagues found: ${fixtures.filter(f=>TOP_LEAGUES.includes(f.league.id)).length}`);

if(fixtures.filter(f=>TOP_LEAGUES.includes(f.league.id)).length < 5){
  // If today no top league, also fetch next 2 days to get EPL, LaLiga
  const tom=new Date(Date.now()+86400000).toISOString().split('T')[0];
  const dat2=new Date(Date.now()+172800000).toISOString().split('T')[0];
  const ex1=await api(`/fixtures?date=${tom}`);
  const ex2=await api(`/fixtures?date=${dat2}`);
  const extra = [...(ex1.response||[]), ...(ex2.response||[])].filter(f=>TOP_LEAGUES.includes(f.league.id));
  fixtures = [...fixtures.filter(f=>TOP_LEAGUES.includes(f.league.id)), ...extra, ...fixtures].slice(0,45);
}
