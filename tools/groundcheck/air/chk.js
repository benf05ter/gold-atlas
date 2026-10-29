const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2],'utf8');
const ctx={console};vm.createContext(ctx);
vm.runInContext(src+';this.__G=GC_CHECK;this.__D=DATA;',ctx);
const G=ctx.__G, D=ctx.__D;
const a=fs.readFileSync('gc-air.js','utf8'); const A=JSON.parse(a.slice(a.indexOf('{"'),a.lastIndexOf('});')+1));
const ids=new Set(D.points.map(p=>p.id));
let same=0,diff=[],newp=0,missing=0;
for(const id in A){ const e=A[id]; if(!ids.has(id)) missing++;
 const g=G[id]; const k=e[0].indexOf(' Air photo check');
 if(!g){newp++; if(k!==0&&e[0].slice(0,k).trim()) diff.push([id,'notInG',e[0].slice(0,k)]); continue;}
 const t=e[0].slice(0,k); const ok=t===g[0] && JSON.stringify(e[2])===JSON.stringify(g[2]) && (JSON.stringify(e[1])===JSON.stringify(g[1])||id.startsWith('pc88-catholic-church-and-cemetery-sec-36'));
 if(ok) same++; else diff.push([id, t===g[0]?'':'TEXT', JSON.stringify(e[2])===JSON.stringify(g[2])?'':'GRADE '+JSON.stringify(g[2]).slice(0,80)+' vs '+JSON.stringify(e[2]).slice(0,80), JSON.stringify(e[1])===JSON.stringify(g[1])?'':'MOVE']);}
console.log({n:Object.keys(A).length,same,newp,missing,diff:diff.length});console.log(JSON.stringify(diff.slice(0,30),null,0));
