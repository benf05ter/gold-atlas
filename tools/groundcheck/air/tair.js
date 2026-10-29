const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(process.argv[2],{waitUntil:'load'});await pg.waitForTimeout(6000);
const r=await pg.evaluate(()=>{const f=id=>DATA.points.find(p=>p.id===id);const c=DATA.points.find(p=>p.id.startsWith('pc88-catholic-church-and-cemetery-sec-36'));const t=f('ld-crimson-hue'),d=f('pd88-tainter-town-hall');
return {air:DATA.points.filter(p=>(p.st||'').includes('Air photo check')).length,c:[c.la,c.lo,c.pinconf,c.pinev[0]],t:[t.st.slice(-160),t.src.map(s=>s[0].slice(0,30))],d:[UG[d.id][0],d.src.map(s=>s[0].slice(0,30))],dup:DATA.points.filter(p=>(p.st||'').split('Air photo check').length>2).length}});
console.log(JSON.stringify(r,null,1));console.log('errors',errs);await b.close();})();
