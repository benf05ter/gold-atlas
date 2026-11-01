
// v285t: Niles Perkins hut (Granger, IN) and Washington Honey woods (Washington, IN) are out of region: pins dropped (treasure thread)
{ const X=new Set(["tw-mi-niles-perkins-hut-1904","tw-mn-washington-honey-woods-1902"]); DATA.points=DATA.points.filter(p=>!X.has(p.id)); addEventListener("DOMContentLoaded",()=>{ DATA.points=DATA.points.filter(p=>!X.has(p.id)); }); }
