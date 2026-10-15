(function(){var C=SK.core,$=function(s,r){return (r||document).querySelector(s)};
var DEF={sound:true,vol:0.7,units:'mmol',crea:'mgdl',fs:16,syr:50};
function load(k,d){try{return Object.assign({},d,JSON.parse(localStorage.getItem(k)||'{}'))}catch(e){return Object.assign({},d)}}
var S=load('sk_settings',DEF),PT=load('sk_patient',{w:'',age:'',sex:'',crea:'',co:{}}),cur=localStorage.getItem('sk_mod')||'pompy',muted=false,alarms={};
function saveS(){localStorage.setItem('sk_settings',JSON.stringify(S))}function saveP(){localStorage.setItem('sk_patient',JSON.stringify(PT))}
window.SKS={get S(){return S},P:function(){var p=C.patient({w:PT.w,age:PT.age,sex:PT.sex,crea:PT.crea,creaU:S.crea,co:PT.co});return p;},alarm:alarm,saveS:saveS,DEF:DEF,setS:function(k,v){S[k]=v;saveS();applyS();}};
// ---------- alarm: czerwona lampa + syrena ----------
var siren=$('#siren');
// syrena WebAudio (niezależna od pliku, odblokowana pierwszym kliknięciem/klawiszem)
var AC=null,osc=null,lfo=null,gn=null,stopT=null;
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();}catch(e){}return AC}
['pointerdown','keydown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(){ac()},{passive:true})});
function sirenStop(){try{if(osc){osc.stop();osc=null}if(lfo){lfo.stop();lfo=null}}catch(e){}clearTimeout(stopT);try{siren.pause()}catch(e){}}
function sirenPlay(){var c=ac();if(!c)return;sirenStop();try{
 gn=c.createGain();gn.gain.value=Math.max(0.05,S.vol);gn.connect(c.destination);
 osc=c.createOscillator();osc.type='sawtooth';osc.frequency.value=750;
 lfo=c.createOscillator();lfo.type='triangle';lfo.frequency.value=1.2;var lg=c.createGain();lg.gain.value=300;lfo.connect(lg);lg.connect(osc.frequency);
 osc.connect(gn);osc.start();lfo.start();stopT=setTimeout(sirenStop,4000);}catch(e){}}
function alarm(key,on){var isNew=on&&!alarms[key];if(on)alarms[key]=1;else delete alarms[key];var any=Object.keys(alarms).length>0;$('#lamp').classList.toggle('on',any);
 if(isNew&&S.sound&&!muted){sirenPlay()}
 if(!any){sirenStop()}}
$('#mute').onclick=function(){muted=!muted;this.textContent=muted?'🔇':'🔊';if(muted)sirenStop();else ac();};
$('#lamp').onclick=function(){sirenStop()};
// ---------- pasek pacjenta ----------
function applyS(){document.documentElement.style.setProperty('--fs',S.fs+'px');$('#pcu').textContent=S.crea==='umol'?'µmol/l':'mg/dl';}
function patBar(){var p=SKS.P();$('#pw').classList.toggle('bad',p.wFlag==='red');$('#pw').classList.toggle('warn',p.wFlag==='orange');
 $('#pcr').textContent='CrCl '+(isFinite(p.crcl)?C.fmt(p.crcl,0)+' ml/min':(PT.sex?'—':'— (płeć?)'));$('#pcr').style.background=isFinite(p.crcl)&&p.crcl<30?'#ffd9de':isFinite(p.crcl)&&p.crcl<60?'#ffeccc':'';
 document.querySelectorAll('#psex button').forEach(function(b){b.classList.toggle('on',b.dataset.s===PT.sex)});
 document.querySelectorAll('.tg').forEach(function(b){b.classList.toggle('on',!!PT.co[b.dataset.c])});}
$('#pw').value=PT.w;$('#pa').value=PT.age;$('#pc').value=PT.crea;
[['#pw','w'],['#pa','age'],['#pc','crea']].forEach(function(a){$(a[0]).oninput=function(){PT[a[1]]=this.value;saveP();patBar();refresh();}});
document.querySelectorAll('#psex button').forEach(function(b){b.onclick=function(){PT.sex=b.dataset.s;saveP();patBar();refresh();}});
document.querySelectorAll('.tg').forEach(function(b){b.onclick=function(){PT.co[b.dataset.c]=!PT.co[b.dataset.c];saveP();patBar();refresh();}});
// ---------- nawigacja ----------
var MODS=SKM.list,active=null;
function side(){$('#side').innerHTML=MODS.map(function(m){return m.sep?'<hr>':'<button data-id="'+m.id+'" class="'+(m.id===cur?'on ':'')+(m.soon?'soon':'')+'">'+m.icon+' '+m.name+'</button>'}).join('');}
$('#side').onclick=function(e){var b=e.target.closest('button');if(b){cur=b.dataset.id;localStorage.setItem('sk_mod',cur);show();}};
function show(){side();alarms={};alarm('_',false);var m=MODS.filter(function(x){return x.id===cur})[0]||MODS[0],el=$('#main');active=m;el.className='';el.innerHTML='';
 if(m.frame){el.className='fr';var f=document.createElement('iframe');f.src=m.frame;f.onload=function(){bridge(f,m)};el.appendChild(f);m.sync=function(){sync(f,m)};}
 else m.render(el,SKS);}
function refresh(){if(active&&active.sync)active.sync();else if(active&&active.update)active.update();}
// ---------- most do modułów v6/v4 (ten sam origin) ----------
function bridge(f,m){var w=f.contentWindow,d=w.document,st=d.createElement('style');
 st.textContent='#startDisc{display:none!important}'+(m.hide||'');d.head.appendChild(st);
 ['pointerdown','keydown','touchstart'].forEach(function(ev){d.addEventListener(ev,function(){ac()},{passive:true})});
 var P=w.HTMLMediaElement.prototype,op=P.play;P.play=function(){alarm(m.id+':int',true);return Promise.resolve();};
 P.pause=function(){alarm(m.id+':int',false);};
 if(window.SKG)SKG.obs(d.body);new w.MutationObserver(function(){sync(f,m)}).observe(d.body,{childList:true,subtree:true});sync(f,m);}
function setVal(el,v,m,k){v=String(v);if(!el||el.value===v)return;var L=m['_'+k];if(el.value!==''&&el.value!==L)return;el.value=v;m['_'+k]=v;el.dispatchEvent(new Event('input',{bubbles:true}));}
function sync(f,m){var d;try{d=f.contentWindow.document}catch(e){return}if(!d||!d.body)return;var p=SKS.P(),wv=String(PT.w||'');
 var wi=d.getElementById('w');if(wi&&wv)setVal(wi,wv,m,'w');
 if(m.id==='se'){var map={liver:'liver',renal:'renal',heart:'cardiac',preg:'preg'};Object.keys(map).forEach(function(k){var b=d.querySelector('.tg[data-c="'+map[k]+'"]');if(b&&b.classList.contains('on')!==!!PT.co[k])b.click();});
  var cr=d.getElementById('crcl');if(cr&&isFinite(p.crcl))setVal(cr,Math.round(p.crcl),m,'cr');}
 if(m.red)alarm(m.id+':dom',!!d.querySelector(m.red));}
// ---------- start ----------
applyS();patBar();show();
if(sessionStorage.getItem('sk_disc')==='1')$('#disc').remove();else $('#discOk').onclick=function(){sessionStorage.setItem('sk_disc','1');$('#disc').remove();};
window.SKS.show=function(id){cur=id;show();};
window.SKS.setP=function(o){var ch=false;if(o.age!=null&&String(PT.age)!==String(o.age)){PT.age=String(o.age);$('#pa').value=PT.age;ch=true}if(o.sex&&PT.sex!==o.sex){PT.sex=o.sex;ch=true}if(ch){saveP();patBar();setTimeout(refresh,0);}};
window.SKS.nextPatient=function(){if(!confirm('Następny pacjent: wyczyścić dane pacjenta i wszystkie moduły? (ustawienia zostają)'))return;
 Object.keys(localStorage).forEach(function(k){if(k==='sk_settings'||k==='omdl_settings'||k==='sk_mod')return;localStorage.removeItem(k)});location.reload();};
$('#nextPt').onclick=window.SKS.nextPatient;
if(window.SKG)SKG.obs($('#main'));})();
