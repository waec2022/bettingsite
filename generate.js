// ... keep the top part same ...
  const betOfDay=preds.slice(0,1).map(p=>({id:`bod-${p.id}`,match:p.match,pick:p.pick,selection:p.pick,odds:p.odds,rating:10,description:`Best pick today: ${p.pick} - ${p.league}. High confidence!`,bookmaker:'bet9ja',photo:''}));
 
  // === 30 ACCUMULATORS ===
  const accumulators = [];
  for(let i=0; i<30; i++){
    const folds = 2 + (i % 9);
    let startIdx = (i * 3) % preds.length;
    let selections = []; let total = 1;
    for(let j=0; j<folds; j++){
      const p = preds[(startIdx + j) % preds.length];
      selections.push({match:p.match, pick:p.pick, selection:p.pick, odds:p.odds});
      total *= parseFloat(p.odds);
    }
    let tier = total < 5 ? `Safe Acca - ${folds} Folds` : total < 12 ? `Medium Acca - ${folds} Folds` : total < 30 ? `High Odds - ${folds} Folds` : total < 80 ? `Mega Acca - ${folds} Folds` : `Super Mega - ${folds} Folds`;
    accumulators.push({id:`acc-${i+1}`, tier:`${tier} #${i+1}`, title:`${tier} #${i+1}`, selections, totalOdds:total.toFixed(2), bookmakers:{bet9ja:{code:`ACC${i+1}`}}});
  }
  const correctScores=preds.slice(0,6).map(p=>({id:`cs-${p.id}`,match:p.match,league:p.league,score:`${1+Math.floor(Math.random()*2)}-${Math.floor(Math.random()*2)}`,odds:(6+Math.random()*4).toFixed(2),date:today,bookmakers:{bet9ja:{code:p.id}}}));
  // ... rest same ...
