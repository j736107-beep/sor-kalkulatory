(function(){var C=SK.core,$=function(s,r){return (r||document).querySelector(s)};
var DEF={sound:true,vol:0.7,units:'mmol',crea:'mgdl',fs:16,syr:50};
function load(k,d){try{return Object.assign({},d,JSON.parse(localStorage.getItem(k)||'{}'))}catch(e){return Object.assign({},d)}}
var S=load('sk_settings',DEF),PT=load('sk_patient',{w:'',age:'',sex:'m',crea:'',co:{}}),cur=localStorage.getItem('sk_mod')||'pompy',muted=false,alarms={};
function saveS(){localStorage.setItem('sk_settings',JSON.stringify(S))}function saveP(){localStorage.setItem('sk_patient',JSON.stringify(PT))}
window.SKS={get S(){return S},P:function(){var p=C.patient({w:PT.w,age:PT.age,sex:PT.sex,crea:PT.crea,creaU:S.crea,co:PT.co});return p;},alarm:alarm,saveS:saveS,DEF:DEF,setS:function(k,v){S[k]=v;saveS();applyS();}};
// ---------- alarm: czerwona lampa + syrena ----------
var siren=$('#siren');
function alarm(key,on){if(on)alarms[key]=1;else delete alarms[key];var any=Object.keys(alarms).length>0;$('#lamp').classList.toggle('on',any);
 if(any&&on&&S.sound&&!muted){try{siren.volume=S.vol;siren.currentTime=0;var p=siren.play();if(p&&p.catch)p.catch(function(){})}catch(e){}}
 if(!any){try{siren.pause()}catch(e){}}}
$('#mute').onclick=function(){muted=!muted;this.textContent=muted?'🔇':'🔊';if(muted)try{siren.pause()}catch(e){}};
$('#lamp').onclick=function(){try{siren.pause()}catch(e){}};
// ---------- pasek pacjenta ----------
function applyS(){document.documentElement.style.setProperty('--fs',S.fs+'px');$('#pcu').textContent=S.crea==='umol'?'µmol/l':'mg/dl';}
function patBar(){var p=SKS.P();$('#pw').classList.toggle('bad',p.wFlag==='red');$('#pw').classList.toggle('warn',p.wFlag==='orange');
 $('#pcr').textContent='CrCl '+(isFinite(p.crcl)?C.fmt(p.crcl,0)+' ml/min':'—');$('#pcr').style.background=isFinite(p.crcl)&&p.crcl<30?'#ffd9de':isFinite(p.crcl)&&p.crcl<60?'#ffeccc':'';
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
 var P=w.HTMLMediaElement.prototype,op=P.play;P.play=function(){alarm(m.id+':int',true);return Promise.resolve();};
 P.pause=function(){alarm(m.id+':int',false);};
 new w.MutationObserver(function(){sync(f,m)}).observe(d.body,{childList:true,subtree:true});sync(f,m);}
function setVal(el,v,m,k){v=String(v);if(!el||el.value===v)return;var L=m['_'+k];if(el.value!==''&&el.value!==L)return;el.value=v;m['_'+k]=v;el.dispatchEvent(new Event('input',{bubbles:true}));}
function sync(f,m){var d;try{d=f.contentWindow.document}catch(e){return}if(!d||!d.body)return;var p=SKS.P(),wv=String(PT.w||'');
 var wi=d.getElementById('w');if(wi&&wv)setVal(wi,wv,m,'w');
 if(m.id==='se'){var map={liver:'liver',renal:'renal',heart:'cardiac',preg:'preg'};Object.keys(map).forEach(function(k){var b=d.querySelector('.tg[data-c="'+map[k]+'"]');if(b&&b.classList.contains('on')!==!!PT.co[k])b.click();});
  var cr=d.getElementById('crcl');if(cr&&isFinite(p.crcl))setVal(cr,Math.round(p.crcl),m,'cr');}}
// ---------- start ----------
applyS();patBar();show();
if(sessionStorage.getItem('sk_disc')==='1')$('#disc').remove();else $('#discOk').onclick=function(){sessionStorage.setItem('sk_disc','1');$('#disc').remove();};
window.SKS.show=function(id){cur=id;show();};})();
