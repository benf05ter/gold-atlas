const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(6000);
const r=await p.evaluate(()=>PTS.filter(p=>['treasure','dig','wreck'].includes(p.L)||p.bur===1).map(p=>({id:p.id,L:p.L,n:p.n,co:p.co||'',stt:p.stt||'',g:TIER.t(p),lead:p.lead||'',c:p.c||'',s:p.s||'',src:(p.src||'').slice(0,300)})));
fs.writeFileSync(process.argv[2]||'pins.json',JSON.stringify(r));console.log(r.length);await b.close();})();
