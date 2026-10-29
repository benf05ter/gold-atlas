const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(process.argv[2],{waitUntil:'load'});await pg.waitForTimeout(6000);
const r=await pg.evaluate(()=>{const f=id=>DATA.points.find(p=>p.id===id);const t=f('ppo87-holst-school'),g=f('t-tr-green-isle'),c=f('t-fort-crawford-payroll'),n=f('cr-lemuel-hill-hoard-1906');
return {n:DATA.points.filter(p=>(p.st||'').includes('Ground check:')).length,cr:DATA.points.filter(p=>p.id.startsWith('cr-')).length,t:[t.la,t.lo,t.ug,t.pinev[0]],g:[g.n,g.la,g.st.slice(0,120),g.src.map(s=>s[0])],c:c.st.slice(-200),cs:c.src.length,n:[n.n,n.pinconf,n.t]}});
console.log(JSON.stringify(r,null,1));console.log('errors',errs);await b.close();})();
