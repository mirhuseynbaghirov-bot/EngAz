// EngAZ alt naviqasiya (Duolingo məntiqi). multiplayer.js-dən SONRA yüklə.
(function(){
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const main=$("home");
let cur="home";

const css=document.createElement("style");
css.textContent=`
#home{padding-bottom:120px}
#mpHeadBtn{display:none!important}
#tabbar{position:fixed;left:0;right:0;bottom:0;z-index:8;display:flex;gap:2px;padding:8px 6px calc(8px + env(safe-area-inset-bottom));background:#150f27ee;backdrop-filter:blur(18px);border-top:1px solid var(--line)}
#tabbar button{background:none;box-shadow:none;color:var(--muted);flex:1;min-height:0;padding:6px 2px;border-radius:14px;font-size:10px;display:flex;flex-direction:column;align-items:center;gap:2px;font-weight:700}
#tabbar button b{font-size:22px;font-weight:400}
#tabbar button.on{color:var(--green);background:#8c70ff26}
.tab{display:none}
.xbox{background:linear-gradient(160deg,#271d40,#211936);border:1px solid #3a2d58;border-radius:20px;padding:18px;margin-top:16px}
.xbox h3{margin:0 0 10px}
.xbox button{margin-top:8px}
.tk{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}
.tk>div{flex:1}.tk small,.xok{color:var(--green)}.xw{color:var(--muted);font-size:13px}
.pth-h{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#3b2a6e,#2a1f4a);border-radius:20px;padding:16px;margin:26px 0 8px}
.pth-s{font-size:12px;color:var(--muted);margin-top:3px}
.pth-n{display:flex;flex-direction:column;align-items:center;margin:14px 0}
.pth-t{font-size:13px;margin-top:12px;color:var(--muted)}
.node{width:70px;height:70px;border-radius:50%;font-size:24px;padding:0;background:#352853;color:#fff;border:2px solid #57436f;box-shadow:0 6px 0 #1b1330}
.node.d{background:var(--green);color:#171126;border-color:var(--green);box-shadow:0 6px 0 #5f9a40}
.node.c{background:var(--purple);border-color:#b7a6ff;box-shadow:0 6px 0 #4b36a8,0 0 0 6px #8c70ff44;animation:nodePulse 1.6s infinite}
@keyframes nodePulse{50%{box-shadow:0 6px 0 #4b36a8,0 0 0 12px #8c70ff11}}
.pf{text-align:center;padding:10px 0}
.pf-av{width:84px;height:84px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;font-size:38px;font-weight:900;color:#171126;background:linear-gradient(135deg,var(--purple),var(--green));box-shadow:0 0 40px -8px #8c70ff}
.pf-g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}
.pf-g div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 6px;text-align:center}
.pf-g b{display:block;font-size:20px;color:var(--green)}.pf-g span{font-size:11px;color:var(--muted)}
.rk{display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px 16px;margin:8px 0}
.rk.me{border-color:var(--green)}.rk.t1{background:linear-gradient(135deg,#4a3a1a,#211936);border-color:#ffcf70}
.rk.t2{border-color:#cfd3dc}.rk.t3{border-color:#d9955a}.rk b{flex:1}.rk .n{font-size:22px;width:34px}`;
document.head.appendChild(css);

// ---------- Panellər ----------
const hero=main.querySelector(".hero"),stats=main.querySelector(".stats"),xpp=main.querySelector(".xp-panel");
const titles=main.querySelectorAll(".section-title");
const achH=titles[2],achP=achH.nextElementSibling,ach=$("achievements");
[$("levelHeading"),$("levelHeading").nextElementSibling,$("levels"),$("lessonHeading"),$("levelDescription"),$("lessons")].forEach(e=>e.style.display="none");
const notice=main.querySelector(".notice");
function pane(id){const d=document.createElement("div");d.className="tab";d.id=id;main.insertBefore(d,notice);return d;}
const pHome=pane("tabHome"),pPath=pane("tabPath"),pRank=pane("tabRank"),pProf=pane("tabProfile");
pHome.append(hero,stats,xpp);
const extra=document.createElement("div");pHome.appendChild(extra);
const info=document.createElement("div");pProf.appendChild(info);
pProf.append(achH,achP,ach);
hero.querySelector("button").onclick=()=>showTab("path");

// ---------- Alt panel ----------
const bar=document.createElement("nav");bar.id="tabbar";
[["home","🏠","Ana"],["path","🗺️","Kademələr"],["mp","⚔️","Multiplayer"],["rank","🏆","Reytinq"],["profile","👤","Profilim"]]
.forEach(t=>{const b=document.createElement("button");b.dataset.tab=t[0];b.innerHTML=`<b>${t[1]}</b>${t[2]}`;b.onclick=()=>showTab(t[0]);bar.appendChild(b);});
document.body.appendChild(bar);
new MutationObserver(()=>{bar.style.display=main.style.display==="none"?"none":"flex";})
  .observe(main,{attributes:true,attributeFilter:["style"]});

function showTab(n,keepScroll){
  if(n==="mp"){const b=$("mpHeadBtn");b?b.click():showToast("Multiplayer yüklənmədi.");return;}
  cur=n;
  [["home",pHome],["path",pPath],["rank",pRank],["profile",pProf]].forEach(p=>p[1].style.display=p[0]===n?"block":"none");
  bar.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.tab===n));
  renderAll();
  if(n==="rank")loadRank();
  if(!keepScroll)window.scrollTo(0,0);
}

// ---------- Gündəlik tapşırıqlar ----------
const TASKS=[
 {id:"w",t:"10 yeni söz öyrən",k:"words",n:10,xp:20},
 {id:"l",t:"2 dərs tamamla",k:"lessons",n:2,xp:25},
 {id:"c",t:"5 düzgün cavab ver",k:"correct",n:5,xp:15}];
function daily(){
  const t=today();
  if(!saved.daily||saved.daily.date!==t)saved.daily={date:t,words:0,lessons:0,correct:0,claimed:{}};
  return saved.daily;
}
function addLog(t){saved.log=(saved.log||[]);saved.log.unshift({d:today(),t});saved.log=saved.log.slice(0,5);}
function nextLesson(){
  for(let li=0;li<levelData.length;li++)for(let i=0;i<levelData[li].lessons.length;i++)
    if(!saved.completed.includes(li+"-"+i))return{li,i};
  return null;
}

// ---------- Render ----------
function renderHome(){
  const d=daily(),n=nextLesson();
  extra.innerHTML=`
  <div class="xbox"><h3>▶ Öyrənməyə davam et</h3>
   ${n?`<p>${levelData[n.li].code} · ${esc(levelData[n.li].lessons[n.i].title)}</p><button id="hxGo" style="width:100%">Davam et →</button>`
      :`<p>Bütün dərsləri tamamlamısan! 🎉 Multiplayer-də yarış.</p>`}</div>
  <div class="xbox"><h3>🎯 Gündəlik tapşırıqlar</h3>${TASKS.map(t=>{
    const v=Math.min(d[t.k],t.n),ok=v>=t.n,cl=d.claimed[t.id];
    return `<div class="tk"><div><b>${t.t}</b><div class="progress"><span style="width:${v/t.n*100}%"></span></div><small>${v}/${t.n}</small></div>
    ${cl?'<span class="xok">✓ Alındı</span>':ok?`<button data-c="${t.id}">+${t.xp} XP al</button>`:`<span class="xw">+${t.xp} XP</span>`}</div>`;}).join("")}</div>
  <div class="xbox"><h3>🕒 Son fəaliyyətlər</h3>${(saved.log&&saved.log.length)
    ?saved.log.map(l=>`<div class="tk"><div>${esc(l.t)}<br><small class="xw">${esc(l.d)}</small></div></div>`).join("")
    :'<p>Hələ fəaliyyət yoxdur. İlk dərsini tamamla!</p>'}</div>`;
  if($("hxGo"))$("hxGo").onclick=()=>{selectedLevel=n.li;startLesson(n.i);};
  extra.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{
    const t=TASKS.find(x=>x.id===b.dataset.c),dd=daily();
    if(!t||dd.claimed[t.id]||dd[t.k]<t.n)return;
    dd.claimed[t.id]=true;saved.xp+=t.xp;addLog("🎯 "+t.t+" (+"+t.xp+" XP)");
    persist();updateStats();launchConfetti();showToast("+"+t.xp+" XP 🎯");
  });
}

function renderPath(){
  const n=nextLesson(),curK=n?n.li+"-"+n.i:"";
  pPath.innerHTML=`<h2 class="section-title">🗺️ Kademələr</h2><p>Dərsləri ardıcıl tamamla və növbəti səviyyəyə keç.</p>`+
  levelData.map((l,li)=>{
    const done=l.lessons.filter((x,i)=>saved.completed.includes(li+"-"+i)).length;
    return `<div class="pth-h"><div><div class="tag">${l.code}</div><b>${l.name}</b>
    <div class="pth-s">${l.desc} · ${done}/${l.lessons.length} dərs</div></div><span style="font-size:32px">${l.icon}</span></div>`+
    l.lessons.map((x,i)=>{const k=li+"-"+i,dn=saved.completed.includes(k);
      return `<div class="pth-n" style="transform:translateX(${[0,42,0,-42][i%4]}px)">
      <button class="node ${dn?"d":k===curK?"c":""}" data-l="${li}" data-i="${i}">${dn?"✓":k===curK?"▶":i+1}</button>
      <div class="pth-t">${esc(x.title)}</div></div>`;}).join("");
  }).join("");
  pPath.querySelectorAll(".node").forEach(b=>b.onclick=()=>{selectedLevel=+b.dataset.l;startLesson(+b.dataset.i);});
}

function renderProfile(){
  const r=getRank(),u=currentUser;
  const nA=document.querySelectorAll("#achievements .achievement.unlocked").length;
  info.innerHTML=`<div class="pf"><div class="pf-av">${esc((saved.name||"?")[0].toUpperCase())}</div>
  <h2 style="margin:6px 0">${esc(saved.name||"Qonaq")}</h2><div class="tag">${r.name} · Level ${r.level}</div>
  <p>${u?esc(u.email)+" · Qeydiyyat: "+new Date(u.created_at).toLocaleDateString("az-AZ"):"Hesaba daxil olmamısan"}</p>
  <div class="progress"><span style="width:${r.progress}%"></span></div><small class="xw">Növbəti level: ${r.progress}/100 XP</small></div>
  <div class="pf-g"><div><b>${saved.xp}</b><span>Ümumi XP</span></div><div><b>${r.level}</b><span>Level</span></div>
  <div><b>${saved.completed.length}</b><span>Dərslər</span></div><div><b>${saved.words.length}</b><span>Sözlər</span></div>
  <div><b>${saved.streak}</b><span>Gün seriyası</span></div><div><b>${nA}</b><span>Nailiyyət</span></div></div>
  <button class="secondary" id="pfEdit" style="width:100%">✏️ Adı dəyiş / Hesab</button>`;
  $("pfEdit").onclick=openProfile;
}

function renderAll(){renderHome();renderPath();renderProfile();}

async function loadRank(){
  pRank.innerHTML='<h2 class="section-title">🏆 Reytinq</h2><p>Yüklənir...</p>';
  if(!supabaseClient){pRank.innerHTML+="<p>Supabase qoşulmayıb.</p>";return;}
  const {data,error}=await supabaseClient.from("profiles").select("id,username,xp").gt("xp",0).order("xp",{ascending:false}).limit(20);
  let h='<h2 class="section-title">🏆 Reytinq</h2><p>Ümumi XP üzrə ən yaxşı oyunçular.</p>';
  if(error){console.error(error);h+="<p>Reytinq yüklənmədi. SQL-i işlətdiyini yoxla.</p>";}
  else if(!data.length)h+="<p>Hələ reytinq boşdur. Hesaba daxil olub XP qazan.</p>";
  else h+=data.map((p,i)=>`<div class="rk ${i<3?"t"+(i+1):""} ${currentUser&&p.id===currentUser.id?"me":""}">
    <span class="n">${["🥇","🥈","🥉"][i]||i+1}</span><b>${esc(p.username||"Oyunçu")}</b><span class="xok">${p.xp} XP</span></div>`).join("");
  if(!currentUser)h+="<p>Reytinqdə görünmək üçün hesaba daxil ol.</p>";
  if(cur==="rank")pRank.innerHTML=h;
}

// ---------- Mövcud funksiyaları bağla (silmədən) ----------
let syncT=null;
function syncXp(){
  if(!supabaseClient||!currentUser)return;
  clearTimeout(syncT);
  syncT=setTimeout(()=>supabaseClient.from("profiles")
    .upsert({id:currentUser.id,username:saved.name||"Oyunçu",xp:saved.xp}).then(r=>{if(r.error)console.error(r.error);}),1500);
}
const _us=window.updateStats;window.updateStats=function(){_us();renderAll();syncXp();};
const _gh=window.goHome;window.goHome=function(){_gh();showTab(cur,true);};
const _ca=window.checkAnswer;
window.checkAnswer=function(b,a,c){const q0=quizScore;_ca(b,a,c);if(quizScore>q0){daily().correct++;persist();}};
const _fl=window.finishLesson;
window.finishLesson=function(){
  const first=!saved.completed.includes(selectedLevel+"-"+currentLesson),w0=saved.words.length;
  const lv=levelData[selectedLevel].code,tt=levelData[selectedLevel].lessons[currentLesson].title;
  _fl();
  const d=daily();d.lessons++;d.words+=saved.words.length-w0;
  if(first)addLog("✅ "+lv+" · "+tt+" tamamlandı (+15 XP)");
  persist();renderAll();
};

showTab("home",true);
})();
