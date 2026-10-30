const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const root='/home/user/gold-atlas/a-f218a76394f8';
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.statusCode=404;r.end();return;}r.end(d);});}).listen(8765);
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({serviceWorkers:'block'});const pg=await ctx.newPage();pg.on('pageerror',e=>console.error('ERR',e.message));
await pg.goto('http://localhost:8765/index.html');await pg.waitForFunction(()=>typeof PTS!=='undefined'&&PTS.length>100,{timeout:90000});
const out=await pg.evaluate(()=>PTS.map(p=>({id:p.id,n:p.n,L:p.L,co:p.co,st:p.s||p.state,la:p.la,lo:p.lo,li:(typeof LIDIMG!=='undefined'&&LIDIMG[p.id])||''})));
fs.writeFileSync('pts.json',JSON.stringify(out));console.log(out.length, out.filter(p=>p.li).length);
const li=await pg.evaluate(()=>LIDIMG); fs.writeFileSync('lidimg.json',JSON.stringify(li)); console.log(Object.keys(li).length);
await b.close();srv.close();})();
