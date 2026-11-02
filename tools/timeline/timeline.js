// ---------- Story timeline (v520): a dated list of what happened at each treasure pin, each line with its source ----------
// TLN (og-data.js) holds, per pin id, [date, what happened, source] and a 4th field 1 when the date is worked out from the story
// rather than printed in the source ("c." dates and "before/after" spans). Built by tools/timeline from the card text, the card's
// sources and the research/ notes. The box sits right under the story on the card; it adds nothing to the map or the start-up work.
{ const TD=typeof TLN==='object'&&TLN?TLN:{};
  function tlHTML(p){ const L=TD[p.id]; if(!L||!L.length) return '';
    const inf=L.some(x=>x[3]);
    return `<details class="tlcard"${L.length<=6?' open':''}><summary>Story timeline (${L.length})</summary><ol class="tl">${L.map(x=>`<li><b>${esc(x[0])}</b> ${esc(x[1])}${x[3]?' <i class="tli">inferred</i>':''}<span class="tls">${esc(x[2])}</span></li>`).join('')}</ol>${inf?'<p class="hint">"Inferred" dates are worked out from the story, not printed in the source.</p>':''}</details>`; }
  window.OGTL={html:tlHTML,n:()=>Object.keys(TD).length};
  if(typeof detailHTML==='function'){ const dh0=detailHTML;
    detailHTML=function(p){ let h=dh0(p); try{ const t=tlHTML(p); if(t){
        const i=h.indexOf('<p class="story">'), j=i>=0?h.indexOf('</p>',i):-1;
        if(j>=0) h=h.slice(0,j+4)+t+h.slice(j+4);
        else { const k=h.indexOf('<div class="row"><a class="btn"'); h=k>=0?h.slice(0,k)+t+h.slice(k):h+t; } }
      }catch(e){ OGE.err&&OGE.err('timeline card',e); } return h; }; }
  if(!document.getElementById('tlCss')) document.head.insertAdjacentHTML('beforeend','<style id="tlCss">.tlcard{margin:8px 0;font-size:13.5px}.tlcard summary{cursor:pointer;font-weight:700}.tl{list-style:none;margin:6px 0 2px;padding:0 0 0 12px;border-left:2px solid color-mix(in srgb,var(--ink) 25%,transparent)}.tl li{margin:0 0 7px;position:relative;line-height:1.35}.tl li::before{content:"";position:absolute;left:-17px;top:6px;width:8px;height:8px;border-radius:50%;background:var(--ink)}.tl li b{margin-right:4px}.tl .tls{display:block;font-size:12px;opacity:.7}.tl .tli{font-size:11.5px;opacity:.75}</style>');
}
