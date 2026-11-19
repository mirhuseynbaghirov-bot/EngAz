// EngAZ: kosmonavt maskotu, Duolingo üslubunda tapşırıqlar, animasiyalar.
// nav.js-dən SONRA yüklə.
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sh=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
const AST='<svg viewBox="0 0 100 104" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="60" width="13" height="26" rx="6.5" fill="#d9d4e8"/><rect x="73" y="60" width="13" height="26" rx="6.5" fill="#d9d4e8"/><path d="M26 100c0-20 10-32 24-32s24 12 24 32z" fill="#fff"/><rect x="40" y="76" width="20" height="12" rx="4" fill="#8c70ff"/><circle cx="50" cy="82" r="3" fill="#baff91"/><circle cx="50" cy="38" r="29" fill="#fff"/><rect x="29" y="23" width="42" height="29" rx="14" fill="#2b2145"/><ellipse cx="41" cy="33" rx="7" ry="3.5" fill="#8c70ff" opacity=".8"/><circle cx="44" cy="40" r="2.4" fill="#baff91"/><circle cx="56" cy="40" r="2.4" fill="#baff91"/><path d="M46 46q4 3 8 0" stroke="#baff91" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="45" y="6" width="10" height="6" rx="3" fill="#baff91"/></svg>';
const FACES=[AST,"👽","🤖"];

const css=document.createElement("style");
css.textContent=`
#stars{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
#stars i{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;animation:twinkle 3s ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:.9;transform:scale(1.3)}}
.logo svg{width:30px;height:30px;vertical-align:-7px;margin-right:6px;-webkit-text-fill-color:initial;animation:bob 3s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-4px) rotate(5deg)}}
.hero{padding-right:130px}
.hero-astro{position:absolute;right:18px;bottom:14px;width:96px;animation:bob 4s ease-in-out infinite;filter:drop-shadow(0 10px 18px #8c70ff88)}
.rocket{position:absolute;font-size:28px;left:-40px;top:18%;animation:fly 9s linear infinite;opacity:.8}
@keyframes fly{to{transform:translate(120vw,-60px) rotate(8deg)}}
.tab{animation:tabIn .4s cubic-bezier(.2,.8,.2,1)}
@keyframes tabIn{from{opacity:0;transform:translateY(14px)}}
.chat{display:flex;align-items:flex-end;gap:12px;margin:14px 0}
.face{width:68px;height:68px;flex:none;display:grid;place-items:center;font-size:46px;animation:bob 3.5s ease-in-out infinite}
.face svg{width:100%;height:100%}
.bubble{flex:1;position:relative;background:#352853;border:2px solid #57436f;border-radius:18px;padding:14px 16px;font-size:18px;line-height:1.5;animation:pop .45s cubic-bezier(.3,1.5,.5,1)}
.bubble:before{content:"";position:absolute;left:-9px;bottom:18px;width:14px;height:14px;background:#352853;border-left:2px solid #57436f;border-bottom:2px solid #57436f;transform:rotate(45deg)}
@keyframes pop{from{opacity:0;transform:scale(.8) translateX(-10px)}}
mark{background:#8c70ff44;color:#e1d8ff;border-bottom:2px dotted var(--purple);border-radius:4px;padding:0 3px}
.blank{display:inline-block;min-width:80px;border-bottom:3px solid var(--muted);margin:0 4px}
.spk{background:#8c70ff;color:#fff;min-height:0;padding:6px 10px;margin-left:8px;border-radius:12px;font-size:16px}
.spk.big{font-size:30px;padding:12px 24px;margin:0;animation:ring 1.6s ease-in-out infinite}
@keyframes ring{50%{box-shadow:0 0 0 10px #8c70ff33}}
#answerList .answer{animation:cardEnter .4s both}
#answerList .answer:nth-child(2){animation-delay:.07s}#answerList .answer:nth-child(3){animation-delay:.14s}
.feedback:not(:empty){padding:12px 16px;border-radius:14px;background:#baff9120;border:1px solid #baff9166;animation:pop .35s}
.feedback.bad:not(:empty){background:#ff829720;border-color:#ff829788;color:#ff9aaa}
#continueButton.pulse{animation:nodePulse 1.4s infinite}
.xpfloat{position:fixed;z-index:40;font-weight:900;color:var(--green);font-size:22px;pointer-events:none;animation:floatUp 1.1s ease-out forwards;text-shadow:0 0 12px #baff91}
@keyframes floatUp{to{transform:translateY(-70px) scale(1.3);opacity:0}}
.sparkle{position:fixed;z-index:40;pointer-events:none;font-size:18px;animation:spark .9s ease-out forwards}
@keyframes spark{to{transform:translate(var(--dx),var(--dy)) scale(.4);opacity:0}}
.astro-big{width:120px;margin:0 auto 6px;animation:bob 2.4s ease-in-out infinite;filter:drop-shadow(0 10px 24px #baff9166)}
.pth-n{position:relative}
.astro-walk{position:absolute;right:calc(50% + 52px);top:0;width:56px;animation:bob 2.6s ease-in-out infinite}
.progress span,.bar span{background-size:200% 100%;animation:shimmer 3s linear infinite}
@keyframes shimmer{to{background-position:-200% 0}}
.card,.level,.lesson-card{animation:cardEnter .5s both}
@media(max-width:700px){.hero{padding-right:100px}.hero-astro{width:74px;right:10px}.face{width:56px;height:56px;font-size:38px}.bubble{font-size:16px}}
`;
document.head.appendChild(css);

// ---------- Ulduzlu fon, logo, hero ----------
const st=document.createElement("div");st.id="stars";
for(let i=0;i<38;i++){const s=document.createElement("i");
  s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;transform-origin:center`;
  st.appendChild(s);}
document.body.appendChild(st);
document.querySelector(".logo").insertAdjacentHTML("afterbegin",AST);
document.querySelector(".hero").insertAdjacentHTML("beforeend",`<div class="hero-astro">${AST}</div><div class="rocket">🚀</div>`);

// ---------- Kademələrdə kosmonavt ----------
const path=$("tabPath");
if(path)new MutationObserver(()=>{
  const c=path.querySelector(".node.c");
  if(c&&!path.querySelector(".astro-walk"))c.parentElement.insertAdjacentHTML("beforeend",`<div class="astro-walk">${AST}</div>`);
}).observe(path,{childList:true});

// ---------- Effektlər ----------
function floatText(el,t){
  const r=el.getBoundingClientRect(),d=document.createElement("div");
  d.className="xpfloat";d.textContent=t;d.style.left=(r.left+r.width/2-30)+"px";d.style.top=r.top+"px";
  document.body.appendChild(d);setTimeout(()=>d.remove(),1200);
  for(let i=0;i<8;i++){const s=document.createElement("div"),a=i/8*6.28;
    s.className="sparkle";s.textContent=["⭐","✨","💜"][i%3];
    s.style.cssText=`left:${r.left+r.width/2}px;top:${r.top+r.height/2}px;--dx:${Math.cos(a)*70}px;--dy:${Math.sin(a)*70}px`;
    document.body.appendChild(s);setTimeout(()=>s.remove(),1000);}
}
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="en-US";u.rate=.85;speechSynthesis.speak(u);}catch(e){}}

// ---------- Tapşırıq növləri ----------
function enhanceWords(){
  const lines=["Yeni söz! Diqqətlə bax 👀","Bunu yadda saxla! 🚀","Sözü ucadan de! 🔊","Kosmosda İngilis dili! ✨","Az qaldı, davam et! 💪"];
  const box=document.querySelector("#studyContent .word-box");
  if(box)box.insertAdjacentHTML("beforebegin",`<div class="chat"><div class="face">${AST}</div><div class="bubble">${lines[currentStep%5]}</div></div>`);
}
function enhanceQuiz(){
  const L=levelData[selectedLevel].lessons[currentLesson],w=L.words[quizIndex];
  const opts=[...document.querySelectorAll("#answerList .answer")].map(b=>b.textContent);
  const re=new RegExp("\\b"+w[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\w*","i");
  let t=[0,1,2,0,1][quizIndex];
  if(t===1&&!re.test(w[2]))t=0;
  const eng=()=>sh([w[0],...sh(L.words.filter(x=>x[0]!==w[0])).slice(0,2).map(x=>x[0])]);
  let q,bub,o,c;
  if(t===0){
    q="Sözün mənası hansıdır?";
    bub=(re.test(w[2])?esc(w[2]).replace(re,m=>"<mark>"+m+"</mark>"):"<mark>"+esc(w[0])+"</mark>")+`<button class="spk" data-s="${esc(w[2])}">🔊</button>`;
    o=opts;c=w[1];
  }else if(t===1){
    q="Boşluğu doldur";bub=esc(w[2]).replace(re,'<span class="blank"></span>');o=eng();c=w[0];
  }else{
    q="Eşitdiyin sözü seç";bub=`<button class="spk big" data-s="${esc(w[0])}">🔊</button>`;o=eng();c=w[0];
    setTimeout(()=>say(w[0]),400);
  }
  $("studyContent").innerHTML=`<div class="tag">SUAL ${quizIndex+1} / 5 · ${q}</div>
  <div class="chat"><div class="face">${FACES[t]}</div><div class="bubble">${bub}</div></div><div id="answerList"></div>`;
  document.querySelectorAll("#studyContent .spk").forEach(b=>b.onclick=()=>say(b.dataset.s));
  o.forEach(x=>{const b=document.createElement("button");b.className="answer";b.textContent=x;
    b.onclick=()=>checkAnswer(b,x,c);$("answerList").appendChild(b);});
}

// ---------- Mövcud funksiyaları bağla (silmədən) ----------
const _ss=window.showStep;
window.showStep=function(){
  _ss();
  $("continueButton").classList.remove("pulse");$("feedback").classList.remove("bad");
  if(mode==="words")enhanceWords();else enhanceQuiz();
};
const _ca=window.checkAnswer;
window.checkAnswer=function(b,a,c){
  if(answered)return;
  const q0=quizScore,x0=saved.xp;
  _ca(b,a,c);
  const ok=quizScore>q0;
  $("feedback").classList.toggle("bad",!ok);
  if(ok&&saved.xp>x0)floatText(b,"+"+(saved.xp-x0)+" XP");
  else if(ok)floatText(b,"⭐");
  $("continueButton").classList.add("pulse");
};
const _fl=window.finishLesson;
window.finishLesson=function(){
  _fl();
  const wb=document.querySelector("#studyContent .word-box");
  if(wb)wb.insertAdjacentHTML("afterbegin",`<div class="astro-big">${AST}</div>`);
};
})();
