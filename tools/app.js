
// ---------- home-screen app: works offline and updates itself ----------
(function(){ if(window.claude||!('serviceWorker' in navigator)||(location.protocol!=='https:'&&!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))) return;
  document.body.classList.add('isapp');
  try{ navigator.storage&&navigator.storage.persist&&navigator.storage.persist(); }catch(_){}
  const t0=Date.now(), bar=document.createElement('div'); bar.className='appupd'; bar.hidden=true; document.body.appendChild(bar);
  const say=(h,btn)=>{ bar.innerHTML=`<span>${h}</span>${btn?'<button class="btn uxgo" data-upd>Update now</button>':''}<button class="btn" data-x aria-label="Close">×</button>`; bar.hidden=false; };
  let reloading=false; navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(reloading) return; reloading=true; location.reload(); });
  navigator.serviceWorker.register('sw.js').then(reg=>{
    const busy=()=>typeof HR!=='undefined'&&HR.rec&&!HR.rec.paused;
    const ready=()=>{ if(!reg.waiting||!navigator.serviceWorker.controller) return;
      if(Date.now()-t0<8000&&!busy()) reg.waiting.postMessage('skip'); else say('A new version of the atlas is ready.',true); };
    ready();
    reg.addEventListener('updatefound',()=>{ const w=reg.installing; if(!w) return; w.addEventListener('statechange',()=>{ if(w.state!=='installed') return;
      if(navigator.serviceWorker.controller) ready(); else { say('Saved on this phone. The atlas now works with no signal.'); setTimeout(()=>{ bar.hidden=true; },6000); } }); });
    bar.addEventListener('click',e=>{ if(e.target.closest('[data-x]')) bar.hidden=true;
      if(e.target.closest('[data-upd]')){ if(busy()) hrPause(true); reg.waiting&&reg.waiting.postMessage('skip'); } });
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') reg.update().catch(()=>{}); });
  }).catch(()=>{});
})();
