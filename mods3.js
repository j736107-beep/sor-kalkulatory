(function(){var C=SK.core,F=C.fmt,U=SKM.util,inp=U.inp,bx=U.bx,src=U.src,chk=U.chk,tabbed=U.tabbed,B=SK.b3;
function dw(t){return ' <span class="dw">'+(t||'DO WERYFIKACJI')+'</span>';}
function nw(){return {H:bx('orange','','Podaj masę ciała w pasku pacjenta.'),lvl:'ok'};}
var info=function(k,extra){return '<h3>Źródła</h3>'+src(B.SRC[k])+(extra||'');};
// ANAFILAKSJA
var ANA=tabbed({id:'ana',icon:'🐝',name:'Anafilaksja'},'Anafilaksja',[['a','Leczenie']],
 function(){return chk('bb','beta-bloker')+chk('refr','oporna (2 dawki i.m. bez poprawy)');},
 function(t,g,P){var w=P.w,a=B.adrIM(w,P.age),f=B.anaFluid(w,P.age),H='';
  H+=bx('red','1. Adrenalina i.m. (1 mg/ml) – przednio-boczna część uda','<span class="big">'+F(a.mg,2)+' mg = '+F(a.ml,2)+' ml</span><div>Powtórz po 5 min, jeśli brak poprawy</div>'+(!(w>0)?'<div class="o">Brak masy – dawka dorosłego 0,5 mg</div>':''));
  H+=bx('ok','2. Płyny','<b>'+(Array.isArray(f.ml)?'500–1000 ml':F(f.ml,0)+' ml')+'</b> krystaloidu i.v. szybko');
  if(g('refr'))H+=bx('red','Oporna','Wlew adrenaliny i.v. → moduł <b>Pompy SOR</b>'+dw('dawka startowa')+'; anestezjolog');
  if(g('bb')){var gl=B.glucagon();H+=bx('orange','Beta-bloker','<b>'+gl.txt+'</b>');}
  H+=bx('','','Tlen, pozycja leżąca. Antyhistaminiki i GKS – nie w pierwszej linii.');
  return{H:H,lvl:'red'};},info('ana','<p>Adrenalina i.m.: 0,01 mg/kg, maks. 0,5 mg; dzieci 6–12 lat 0,3 mg, <6 lat 0,15 mg (ERC/RCUK). '+dw()+': wlew adrenaliny w anafilaksji opornej (RCUK: 1 mg/100 ml 0,5–1 ml/kg/h).</p>'));
// SEPSA
var SEP=tabbed({id:'sepsis',icon:'🦠',name:'Sepsa'},'Sepsa – pakiet 1 h',[['b','Pakiet 1 h'],['abx','Antybiotyki']],
 function(t){return t==='b'?inp('sbp','SBP','mmHg')+inp('dbp','DBP','mmHg')+inp('lac','Mleczany','mmol/l'):'';},
 function(t,g,P){var w=P.w,H='',lvl='ok';
  if(t==='b'){var o=B.sepsis({w:w,sbp:g('sbp'),dbp:g('dbp'),lac:g('lac'),heart:P.co.heart,renal:P.co.renal});lvl=o.lvl;
   H+=bx(o.lvl,'','MAP <span class="big">'+F(o.map,0)+'</span> mmHg · mleczany '+F(g('lac'),1)+(o.shock?'<div class="r">⚠ Wstrząs septyczny</div>':''));
   H+=bx('ok','Pakiet 1 h (SSC 2021)','1. Mleczany · 2. Posiewy krwi przed antybiotykiem · 3. Antybiotyk szerokie spektrum &lt;1 h · 4. Płyny · 5. Noradrenalina, cel MAP ≥65');
   if(o.fluid)H+=bx(o.fluidCaution?'orange':'red','Płyny krystaloidy',(w>0?'<span class="big">'+F(o.fluid,0)+' ml</span> (30 ml/kg) w 3 h':'30 ml/kg – podaj masę')+(o.fluidCaution?'<div class="o">Serce/nerki – ostrożnie, ocena odpowiedzi na płyny</div>':''));
   if(o.hypo)H+=bx('red','Wazopresor','Noradrenalina, cel MAP ≥65 → moduł <b>Pompy SOR</b>');}
  else{var c=P.crcl,a=B.abx(c),v=B.vancoLoad(w);
   H+=bx(isFinite(c)?'':'orange','CrCl '+(isFinite(c)?F(c,0)+' ml/min':'— (podaj wiek i kreatyninę; pokazano dawki bez korekty)'),'<div class="mut">Pierwsza dawka zawsze pełna; wybór wg lokalnej epidemiologii.</div>');
   H+=a.map(function(x){return bx(x.adj?'orange':'ok',x.n,'<span class="big">'+x.d+'</span>')}).join('');
   if(v)H+=bx('ok','Wankomycyna (MRSA)','<span class="big">'+F(v.lo,0)+'–'+F(v.hi,0)+' mg</span> · '+v.txt);}
  return{H:H,lvl:lvl};},info('sep','<p>Płyny 30 ml/kg przy hipotensji lub mleczanach ≥4 (SSC 2021: sugestia). Antybiotyki: wybór empiryczny '+dw('lokalna polityka antybiotykowa')+'.</p>'));
// ZATRUCIA
var TOX=tabbed({id:'tox',icon:'☠️',name:'Zatrucia'},'Zatrucia',[['p','Paracetamol'],['o','Opioidy'],['b','Benzodiazepiny']],
 function(t){return t==='p'?inp('mg','Dawka','mg')+inp('t','Czas od spożycia','h')+inp('lv','Stężenie','mg/l')+chk('stag','spożycie rozłożone / nieznany czas'):t==='o'?chk('dep','uzależnienie od opioidów')+inp('eff','Skuteczna dawka','mg'):chk('tca','TLPD / leki prodrgawkowe')+chk('chronic','przewlekłe BZD')+chk('seiz','padaczka')+chk('unk','nieznana mieszanina');},
 function(t,g,P){var w=P.w,H='',lvl='ok';
  if(t==='p'){var o=B.para({mg:g('mg'),w:w,t:g('t'),level:g('lv'),stag:g('stag')});lvl=o.lvl;
   var s='';if(isFinite(o.mgkg))s+='Dawka <b>'+F(o.mgkg,0)+' mg/kg</b>'+(o.mgkg>=150?' <span class="r">≥150</span>':'')+'<br>';
   if(isFinite(o.uk))s+='Linia leczenia w '+F(g('t'))+' h: UK <b>'+F(o.uk,0)+'</b> · US <b>'+F(o.us,0)+'</b> mg/l'+(o.aboveUK!=null?(o.aboveUK?' → <span class="r">POWYŻEJ – leczyć</span>':' → poniżej'):'');
   else if(isFinite(g('t')))s+='<span class="o">Nomogram tylko 4–24 h po jednorazowym spożyciu</span>';
   H+=bx(o.lvl,'',s||'Podaj dawkę, czas, stężenie.');
   if(o.lvl!=='red')return{H:H+bx('orange','NAC','Brak wskazań wg wprowadzonych danych (poniżej linii, <150 mg/kg, znany czas) – uzupełnij dane; decyzja wg protokołu.'),lvl:lvl};
   if(!(w>0))return{H:H+nw().H,lvl:lvl};var n=B.nac21(w);
   H+=bx(o.lvl==='red'?'red':'ok','NAC – schemat 21 h (200 mg/ml)'+dw('stężenie preparatu PL'),n.bags.map(function(b,k){return (k+1)+'. <b>'+F(b.mg,0)+' mg</b> ('+b.mgkg+' mg/kg) = '+F(b.ml,1)+' ml w '+b.vol+' ml G5% / '+b.h+' h → <b>'+F(b.mlh,0)+' ml/h</b>'}).join('<br>')+(n.capped?'<div class="o">Masa >110 kg – liczono dla 110 kg</div>':''));}
  if(t==='o'){var n=B.naloxone(g('dep'));H+=bx('ok','Nalokson','<span class="big">'+n.txt+'</span>');
   if(isFinite(g('eff')))H+=bx('ok','Wlew','<span class="big">'+F(B.naloxInf(g('eff')),2)+' mg/h</span> (2/3 skutecznej dawki na h)'+dw());}
  if(t==='b'){var f=B.flumazenil({tca:g('tca'),chronic:g('chronic'),seiz:g('seiz'),unk:g('unk')});lvl=f.lvl;
   H+=bx(f.lvl,'Flumazenil',f.bad?'<div class="r">⚠ Przeciwwskazany / niebezpieczny: '+f.bad.join(', ')+' – ryzyko drgawek</div><div class="mut">Wspomaganie oddechu zamiast flumazenilu</div>':'<span class="big">'+f.txt+'</span>');}
  return{H:H,lvl:lvl};},info('tox','<p>Paracetamol: linia UK 100 mg/l w 4 h (MHRA 2012), US 150 mg/l (Rumack–Matthew); T½ linii 4 h. NAC 21 h: 150 mg/kg/200 ml/1 h, 50 mg/kg/500 ml/4 h, 100 mg/kg/1000 ml/16 h; masa maks. 110 kg. '+dw()+': stężenie dostępnego preparatu NAC i.v. w PL; wlew naloksonu 2/3 dawki/h (Goldfrank).</p>'));
// AF
var AF=tabbed({id:'af',icon:'💓',name:'AF'},'Migotanie przedsionków',[['s','CHA₂DS₂-VA'],['r','Kontrola rytmu serca'],['k','Kardiowersja farmakol.']],
 function(t){return t==='s'?chk('chf','niewydolność serca')+chk('htn','nadciśnienie')+chk('dm','cukrzyca')+chk('stroke','udar/TIA/zator')+chk('vasc','choroba naczyń'):t==='r'?chk('hfd','niewydolność serca zdekompensowana'):chk('str','strukturalna choroba serca / CAD');},
 function(t,g,P){var w=P.w,H='',lvl='ok';
  if(t==='s'){var c=B.cha({chf:g('chf')||P.co.heart,htn:g('htn'),dm:g('dm'),stroke:g('stroke'),vasc:g('vasc'),age:P.age,sex:P.sex});
   H=bx(c.va>=2?'orange':'ok','CHA₂DS₂-VA (ESC 2024)','<span class="big">'+c.va+'</span> → antykoagulacja: <b>'+c.oacVA+'</b>')+bx('','CHA₂DS₂-VASc (ACC/AHA 2023)','<span class="big">'+c.vasc+'</span> → <b>'+c.oacVASc+'</b>')+(!isFinite(P.age)?bx('orange','','Podaj wiek w pasku pacjenta.'):'')+(!P.sex?bx('orange','','Płeć nieznana – CHA₂DS₂-VASc bez punktu za płeć żeńską.'):'');}
  if(t==='r'){var r=B.afRate(w,{hf:P.co.heart,hfDecomp:g('hfd'),crcl:P.crcl});H=r.map(function(x){return bx(x.lvl,x.n+(x.dw?dw('dostępność i.v. w PL'):''),'<b>'+x.d+'</b>'+(x.lvl==='red'?'<div class="r">⚠ Unikaj w niewydolności serca</div>':''))}).join('');}
  if(t==='k'){if(!(w>0))return nw();var r=B.afRhythm(w,{structural:g('str')||P.co.heart});H=r.map(function(x){return bx(x.lvl,x.n,'<b>'+x.d+'</b>'+(x.lvl==='red'?'<div class="r">⚠ Przeciwwskazany w strukturalnej chorobie serca</div>':''))}).join('')+bx('','','Niestabilny → kardiowersja elektryczna. AF ≥24 h bez antykoagulacji → TEE/antykoagulacja przed kardiowersją (ESC 2024).');lvl=r.some(function(x){return x.lvl==='red'})?'red':'ok';}
  return{H:H,lvl:lvl};},info('af','<p>Flekainid: maks. 150 mg '+dw('limit z ChPL')+'. Diltiazem i.v. '+dw('dostępność w PL')+'.</p>'));
// GI
var GI=tabbed({id:'gib',icon:'🩸',name:'Krwawienie z GI'},'Krwawienie z górnego odcinka PP',[['g','Glasgow-Blatchford'],['l','Leczenie']],
 function(t){return t==='g'?inp('urea','Mocznik','mmol/l')+inp('hb','Hb','g/dl')+inp('sbp','SBP','mmHg')+inp('hr','HR','/min')+chk('mel','smoliste stolce')+chk('syn','omdlenie')+chk('liv','choroba wątroby')+chk('hf','niewydolność serca'):chk('var','podejrzenie żylaków / marskość')+chk('card','choroba wieńcowa');},
 function(t,g,P,X){var w=P.w,H='',lvl='ok';
  if(t==='g'){var mg=X.S.units==='mgdl',u=g('urea');var s=B.gbs({urea:mg?u/6.006:u,hb:g('hb'),sbp:g('sbp'),hr:g('hr'),melena:g('mel'),syncope:g('syn'),liver:g('liv')||P.co.liver,hf:g('hf')||P.co.heart,sex:P.sex});lvl=s.lvl;
   H=bx(s.lvl,'Glasgow-Blatchford','<span class="big">'+s.score+'</span> '+(s.low?'→ niskie ryzyko (≤1): rozważ wypis i endoskopię ambulatoryjną':'→ hospitalizacja, endoskopia ≤24 h'));}
  if(t==='l'){var hb=B.hbThreshold(g('card')||P.co.heart),te=B.terli(w);
   H+=bx('ok','PPI','<span class="big">Pantoprazol 80 mg i.v.</span><div>potem 40 mg i.v. co 12 h (ESGE 2021)</div>');
   H+=bx('ok','Przetoczenie KKCz','Hb ≤'+hb.t+' g/dl → cel <b>'+hb.target+'</b>');
   if(g('var')){H+=bx(g('card')?'red':'orange','Terlipresyna (Glypressin)',(te?'<span class="big">'+te.txt+'</span>':'Podaj masę')+(g('card')?'<div class="r">⚠ Choroba wieńcowa – ostrożnie/przeciwwskazanie (ChPL)</div>':''));
    H+=bx('ok','Antybiotyk','Ceftriakson 1 g i.v. co 24 h (Baveno VII)');if(g('card'))lvl='red';}
   H+=bx('','','Kwas traneksamowy – niezalecany (HALT-IT). Endoskopia ≤24 h; ≤12 h przy żylakach.');}
  return{H:H,lvl:lvl};},info('gi','<p>Terlipresyna wg ChPL: <50 kg 1 mg, 50–70 kg 1,5 mg, >70 kg 2 mg co 4 h; Baveno VII: 2 mg co 4 h, po kontroli 1 mg co 4 h, 2–5 dni.</p>'));
var L=SKM.list;[ANA,SEP,TOX,AF,GI].forEach(function(m){for(var i=0;i<L.length;i++)if(L[i].id===m.id)L[i]=m;});})();
