(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.core=m;}})(this,function(){
// Przeliczniki jednostek (stałe fizykochemiczne: masa molowa)
var CONV={glu:18.016,ca:4.008,mg:2.431,crea:88.42,urea:6.006};
function gluMmol(v,u){return u==='mgdl'?v/18.016:v;}
function gluMgdl(v,u){return u==='mgdl'?v:v*18.016;}
function creaMgdl(v,u){return u==='umol'?v/88.42:v;}
// Cockcroft-Gault (1976): CrCl = (140-wiek)*masa/(72*Kr[mg/dl]) ×0,85 u kobiet
function cockcroft(age,w,creaMg,sex){if(!(age>0&&w>0&&creaMg>0)||(sex!=='m'&&sex!=='f'))return NaN;var c=(140-age)*w/(72*creaMg);return sex==='f'?c*0.85:c;}
function num(v){if(typeof v==='number')return v;v=String(v==null?'':v).replace(',','.').trim();return v===''?NaN:parseFloat(v);}
function fmt(x,d){if(x==null||!isFinite(x))return'—';if(d!=null){return (+x.toFixed(d)).toString().replace('.',',');}var a=Math.abs(x),s=a>=100?x.toFixed(0):a>=10?x.toFixed(1):a>=1?x.toFixed(2):x.toFixed(3);s=s.indexOf('.')>=0?s.replace(/0+$/,'').replace(/\.$/,''):s;return s.replace('.',',');}
function checkWeight(w){if(!(w>0))return null;if(w<30||w>250)return'red';if(w<40||w>180)return'orange';return null;}
// Pacjent globalny
function patient(p){var w=num(p.w),age=num(p.age),cr=num(p.crea),cm=creaMgdl(cr,p.creaU||'mgdl');
 var crcl=cockcroft(age,w,cm,p.sex);return{w:w,age:age,sex:p.sex||'',crcl:isFinite(crcl)?crcl:num(p.crcl),co:p.co||{},wFlag:checkWeight(w)};}
return{CONV:CONV,gluMmol:gluMmol,gluMgdl:gluMgdl,creaMgdl:creaMgdl,cockcroft:cockcroft,num:num,fmt:fmt,checkWeight:checkWeight,patient:patient};});
