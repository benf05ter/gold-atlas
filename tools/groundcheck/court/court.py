import json,re
L={}
cur=None
for line in open('/tmp/claude-0/pv/leads.txt'):
    line=line.rstrip('\n')
    if line.startswith('== '):
        h=line[3:].split(); cur=h[0]; L[cur]={'h':h}
    elif cur and line[:3] in ('S: ','F: ','D: '): L[cur][line[0]]=line[3:]
    elif cur and line.startswith('SRC: '):
        s=line[5:]; m=re.search(r'\s(https?://\S+)$',s); L[cur]['src']=[s[:m.start()].strip(),m.group(1)]
def perm(d):
    k,_,w=d.partition(': '); return (' Permission: '+w+'.') if k in('warn','stop') else ''
APX=' Pin is approximate (town or township only), not the spot itself.'
new=[
 # id, L, name, y, pl, co, stt, v, c, s, p, pinconf, approx
 ('cr-homer-bandit-cave','treasure','Train robbers’ money in a Homer cave','1900-1903','Bluff caves near Homer, six miles below Winona','Winona','MN','Train-robbery money ("$?,000", amount unreadable)','newspaper','unknown','approx','C',True),
 ('cr-rice-bank-loot-1904','treasure','Rice bank robbers’ cache, woods back of Richmond','1904','Woods back of Richmond, Stearns County','Stearns','MN','Rest of the December 1904 Rice bank loot','newspaper','unknown','approx','C',True),
 ('cr-franconia-mill-1864','history','Ansell Smith’s steam sawmill, Franconia','1850s-1864','Mill Reserve on the St. Croix, Franconia','Chisago','MN','Coins, tokens, mill tools and boom hardware of the 1850s-60s','documented','unknown','town','B',False),
 ('cr-garrison-village-sauk','ghost','Garrison, deserted mill and ferry village','about 1848-1860s','Lower narrows of the Baraboo River','Sauk','WI','1850s coins, buttons, potsherds and kiln waste','newspaper','unknown','approx','C',True),
 ('cr-schultz-recluse-1914','treasure','Harris Schultz’s buried money','1914','Near his home in Spencer Brook township, near Cambridge','Isanti','MN','"Several thousand dollars"','newspaper','unknown','approx','C',True),
 ('cr-snyde-hermit-cf-1900','treasure','Cooper Snyde, hermit furrier’s money','1899-1900','His house or shop in Chippewa Falls (not yet placed)','Chippewa','WI','About $400 found in 1900; "a large amount still concealed"','newspaper','partly','town','C',True),
 ('cr-hudson-peterson-gold-1936','treasure','Hans Peterson’s plowed-up gold coins','1936','A field near Hudson (farm not yet placed)','St. Croix','WI','Six gold coins of 1834-1850s found; the rest of a broken container may remain','documented','partly','approx','C',True),
 ('cr-wabeno-bank-loot-1921','treasure','Wabeno State Bank loot, buried in the woods','1921','Woods near Wabeno; a 1922 search moved to a logging trail west of Athelstane','Forest','WI','$32,000 in cash and securities','newspaper','never','approx','C',True),
 ('cr-lemuel-hill-hoard-1906','treasure','Lemuel Hill’s miser hoard, Pleasant Hill township','1906','His farm in Pleasant Hill township (section not yet placed)','Winona','MN','About $50,000 found in 1906; "considerably still to be unearthed"','newspaper','partly','approx','C',True),
 ('cr-progress-ghost-town-wood','ghost','Progress, ghost town in the town of Rock','before 1937','Town of Rock, Wood County (not on the Rock page of the Wood plat book)','Wood','WI','Early settlement coins and buttons','newspaper','unknown','approx','C',True),
]
pts=[]
for (i,Lr,n,y,pl,co,stt,v,c,s,p,pc,apx) in new:
    r=L[i]; la,lo=float(r['h'][-2]),float(r['h'][-1])
    st=r['S']+(APX if apx else '')
    pts.append({'id':i,'L':Lr,'n':n,'la':la,'lo':lo,'y':y,'pl':pl,'co':co,'stt':stt,'v':v,'c':c,'s':s,'p':p,'st':st,'t':r['F']+perm(r['D']),'src':[r['src']],'pinconf':pc,'pinev':['Placed from the source text only: '+('the town or township named in the article' if apx else 'the Franconia mill reserve on the St. Croix')+'; not yet checked on a plat or aerial.']})
g=L['cr-curran-hoard-1946']; f=L['cr-fort-crawford-silver-1830s']
fix={
 't-tr-green-isle':{'n':'Curran brothers’ cellar hoard, Green Isle Township','la':44.67369,'lo':-94.07195,'pl':'Curran family farm, Green Isle Township (approximate)','y':'1946','v':'Over $200,000 in silver dollars, 1,162 gold coins and bonds (found)','c':'documented','s':'found','p':'approx','pinconf':'C',
   'st':g['S'].replace(' The atlas pin\'s "outlaw brothers with $40,000 of bank loot at Mud Lake" looks like a garbled retelling of this real estate case.','')+' A later retelling turned this into outlaw brothers burying $40,000 of bank loot at the north end of Mud Lake; no source for that version has turned up. Pin is approximate (the farm is placed only to the township).',
   't':'The cellar was searched thoroughly in 1946, so what is left is the farmstead ground: yard, outbuildings and lanes. The lesson for other sites: frugal bachelor farmers who distrusted banks hid money in the cellar floor and between the joists.'+perm(g['D']),
   'src0':g['src']},
 't-fort-crawford-payroll':{'st+':' A documented robbery here is better ground than the legend: in the 1830s two discharged soldiers dug under a corner picket and took three $5,000 kegs of silver. One keg burst by the picket, one on the Mississippi bank, where all but about $600 was recovered, and the third was found months later two miles below the fort by a man spearing fish by torchlight. The men were tried and let go. The lost $600 lay in the sand of the 1830s river bank, which has since moved: check old maps.','t+':' '+perm(f['D']).strip(),'src+':f['src']},
}
js="\n// Court and probate record finds (v169): 10 new cr- pins, Curran and Fort Crawford cards corrected from documented sources\nDATA.points.push(..."+json.dumps(pts,ensure_ascii=False,separators=(',',':'))+");\n(function(F){for(const p of DATA.points){const f=F[p.id];if(!f)continue;for(const k in f){if(k==='src0')p.src=[f.src0,...(p.src||[]).map(s=>[s[0]+' (later retelling)',s[1]])];else if(k.endsWith('+')){const b=k.slice(0,-1);if(b==='src')p.src=[...(p.src||[]),f[k]];else p[b]=(p[b]||'')+f[k];}else p[k]=f[k];}}})("+json.dumps(fix,ensure_ascii=False,separators=(',',':'))+");\n"
open('/tmp/claude-0/pv/court/court.js','w').write(js)
print(len(js)); print(json.dumps(pts[0],ensure_ascii=False)[:600])
