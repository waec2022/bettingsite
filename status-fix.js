// status-fix.js - FIX UPCOMING(YELLOW), LIVE(RED), FINISHED(GREEN) - No need touch main script.js
(function(){
  function getBadgeStyle(status){
    if(status==='upcoming') return 'background:#fef08a; color:#854d0e; border:1px solid #facc15;'; // YELLOW
    if(status==='live') return 'background:#fee2e2; color:#b91c1c; border:1px solid #ef4444;'; // RED
    if(status==='finished') return 'background:#dcfce7; color:#166534; border:1px solid #22c55e;'; // GREEN
    return '';
  }

  // Real status from API - NS = upcoming, 1H/2H/HT = live, FT = finished
  function getRealStatus(item){
    const s = (item.short || '').toUpperCase();
    if(['FT','AET','PEN','FT_PEN'].includes(s)) return {status:'finished', label:`FINISHED · ${item.goals||item.score||''}`.trim()};
    if(['1H','2H','HT','ET','BT','P','SUSP','INT','LIVE'].includes(s) || item.minute>0) return {status:'live', label:`LIVE · ${item.minute||0}' · ${item.goals||item.currentScore||'0-0'}`};
    return {status:'upcoming', label:`UPCOMING · ${item.kickoffAt ? new Date(item.kickoffAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : 'Today'}`};
  }

  window.renderLivePredictions = function(){
    const grid = document.getElementById('liveGrid') || document.getElementById('livePredictionsGrid');
    const countEl = document.getElementById('liveCount') || document.querySelector('[data-live-count]');
    if(!grid || !window.DATA) return;
    const all = DATA.livePredictions || DATA.predictions || [];
    // Use real status
    all.forEach(r=>{ const real=getRealStatus(r); r.status=real.status; r.statusLabel=real.label; });
    const liveCount = all.filter(r=>r.status==='live').length;
    if(countEl) countEl.textContent = `${liveCount} Live`;
    
    if(all.length===0){ grid.innerHTML='<div style="padding:16px; color:#6b7280;">No matches yet.</div>'; return; }

    grid.innerHTML = all.map(r=>`
      <div style="background:#fff; border-radius:12px; padding:12px; border:1px solid #e5e7eb; margin-bottom:8px;">
        <div style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:800; ${getBadgeStyle(r.status)}">● ${r.statusLabel}</div>
        <div style="font-weight:700; margin:8px 0 4px; font-size:14px;">${r.home||r.match?.split(' vs ')[0]} <span style="font-weight:400; color:#6b7280;">vs</span> ${r.away||r.match?.split(' vs ')[1]||''}</div>
        <div style="color:#16a34a; font-size:13px; font-weight:600;">${r.pick||r.selection||'Over 0.5 Goals Live'} @ ${r.odds||'1.90'}</div>
      </div>
    `).join('');
  }

  window.renderHedgeStrategies = function(){
    const grid = document.getElementById('hedgeGrid') || document.getElementById('hedgeStrategyGrid');
    if(!grid || !window.DATA) return;
    const items = DATA.hedgeStrategies || [];
    items.forEach(r=>{ const real=getRealStatus(r); r.status=real.status; if(real.status!=='finished') r.statusLabel=real.label; if(real.status==='finished') r.statusLabel='FINISHED'; });

    grid.innerHTML = items.map(r=>`
      <div style="background:#0f172a; color:#fff; border-radius:16px; padding:14px; margin-bottom:12px; border:1px solid #1e293b;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div style="flex:1; min-width:0;"><b>${r.home}</b> <span style="color:#94a3b8;">vs</span> <b>${r.away}</b><br/><span style="font-size:12px; color:#94a3b8;">📅 ${r.kickoffAt ? new Date(r.kickoffAt).toLocaleString('en-NG',{hour:'2-digit',minute:'2-digit'}) : 'Today'}</span></div>
          <div style="padding:5px 12px; border-radius:20px; font-size:11px; font-weight:800; white-space:nowrap; ${getBadgeStyle(r.status)}">● ${r.statusLabel}</div>
        </div>
      </div>
    `).join('');
  }

  // Auto run after main script
  setTimeout(()=>{ try{ window.renderLivePredictions(); window.renderHedgeStrategies(); }catch(e){} }, 800);
  console.log('status-fix.js loaded - Yellow=UPCOMING, Red=LIVE, Green=FINISHED');
})();
