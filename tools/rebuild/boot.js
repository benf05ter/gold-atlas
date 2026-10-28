// ---------- boot (v120): one first paint, then the slow extras when the browser is idle ----------
try{ document.documentElement.dataset.og=String(OGE.ver); fit(); drawMarkers.now(); }catch(e){ OGE.err('boot',e); }
(window.requestIdleCallback||(f=>setTimeout(f,300)))(()=>{ try{ if(typeof streamsBuild==='function') streamsBuild(); }catch(e){ OGE.err('streams',e); } });
// a map that never got a size (hidden tab at start) paints as soon as it has one
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&RENDER.pending) drawMarkers(); });
