// EngAZ multiplayer modulu. index.html ilə eyni qovluğa qoy.
(function(){
const sb=()=>supabaseClient;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ERR={LOGIN:"Əvvəlcə hesaba daxil ol.",NOT_FOUND:"Belə otaq tapılmadı.",FULL:"Otaq doludur.",
STARTED:"Oyun artıq başlayıb.",NOT_OWNER:"Yalnız otaq sahibi başlada bilər.",
NEED_PLAYERS:"Ən azı 2 oyunçu lazımdır.",NOT_READY:"Bütün oyunçular hazır olmalıdır."};
function errMsg(e){const m=(e&&e.message)||"";for(const k in ERR)if(m.includes(k))return ERR[k];return "Xəta: "+m;}

let room=null,players=[],answers=[],chan=null,tick=null,advancing=-1,myAns={},starting=false,lastSig="",poll=null;

// ---------- CSS + HTML ----------
const st=document.createElement("style");
st.textContent=`
#mp{max-width:560px}
.mp-btn{width:100%;margin-top:10px}
.mp-p{display:flex;align-items:center;gap:10px;background:#302448;border:1px solid #57436f;border-radius:14px;padding:11px 14px;margin:8px 0}
.mp-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--green));display:grid;place-items:center;font-weight:900;color:#171126}
.mp-p b{flex:1}.mp-ok{color:var(--green);font-size:13px}.mp-wait{color:var(--muted);font-size:13px}
.mp-code{font-size:38px;letter-spacing:6px;color:var(--green);font-weight:900;text-align:center;margin:10px 0}
.mp-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:10px}
.mp-top div{flex:1;background:#302448;border-radius:12px;padding:9px;text-align:center;font-size:13px}
.mp-timer{font-size:30px;font-weight:900;color:var(--green);text-align:center}
select{width:100%;padding:12px;background:#110d20;border:1px solid var(--line);border-radius:10px;color:white;margin:8px 0}
.mp-win{font-size:26px;color:var(--green);text-align:center;font-weight:900;margin:10px 0}
#mpHeadBtn{background:var(--purple);color:#fff;padding:10px 14px;border-radius:30px}`;
document.head.appendChild(st);

const sec=document.createElement("section");
sec.className="screen";sec.id="mp";
sec.innerHTML='<div id="mpBody"></div>';
document.body.insertBefore(sec,$("profileModal"));

const hb=document.createElement("button");
hb.id="mpHeadBtn";hb.textContent="⚔️ Multiplayer";hb.onclick=openMp;
document.querySelector(".header-right").prepend(hb);

function body(h){$("mpBody").innerHTML=h;}
function openMp(){
  $("home").style.display="none";$("study").classList.remove("active");
  sec.classList.add("active");window.scrollTo(0,0);
  if(room)draw();else viewMenu();
}
function closeMp(){
  sec.classList.remove("active");clearInterval(tick);goHome();
}

// ---------- Menyu ----------
function viewMenu(){
  body(`<button class="secondary" id="mpBack">← Geri</button>
  <h2>⚔️ Multiplayer</h2>
  <p>Dostlarınla və ya təsadüfi rəqiblə real vaxtda yarış.</p>
  <h3>🏠 Özəl otaq yarat</h3>
  <input id="mpName" placeholder="Otağın adı" maxlength="30">
  <select id="mpLevel">${levelData.map(l=>`<option>${l.code}</option>`).join("")}</select>
  <select id="mpQ"><option value="5">5 sual</option><option value="8">8 sual</option><option value="10">10 sual</option></select>
  <select id="mpMax"><option value="2">2 oyunçu</option><option value="4">4 oyunçu</option><option value="8">8 oyunçu</option></select>
  <button class="mp-btn" id="mpCreate">Otaq yarat</button>
  <h3 style="margin-top:28px">🔑 Otağa qoşul</h3>
  <input id="mpCode" placeholder="Otaq kodu" maxlength="8" style="text-transform:uppercase">
  <button class="secondary mp-btn" id="mpJoin">Qoşul</button>
  <h3 style="margin-top:28px">🎲 Təsadüfi rəqib</h3>
  <select id="mpQL">${levelData.map(l=>`<option>${l.code}</option>`).join("")}</select>
  <button class="secondary mp-btn" id="mpQuick">Rəqib tap</button>`);
  $("mpBack").onclick=closeMp;
  $("mpCreate").onclick=()=>act(()=>sb().rpc("create_room",{p_name:$("mpName").value.trim(),p_level:$("mpLevel").value,p_q:+$("mpQ").value,p_max:+$("mpMax").value}));
  $("mpJoin").onclick=()=>{const c=$("mpCode").value.trim();if(!c)return showToast("Kodu daxil et.");act(()=>sb().rpc("join_room",{p_code:c}));};
  $("mpQuick").onclick=()=>{$("mpQuick").textContent="🔍 Rəqib axtarılır...";act(()=>sb().rpc("quick_match",{p_level:$("mpQL").value}));};
}

async function act(fn){
  if(!sb()||!currentUser){showToast("Əvvəlcə hesaba daxil ol.");return;}
  const {data,error}=await fn();
  if(error){showToast(errMsg(error));console.error(error);if($("mpQuick"))$("mpQuick").textContent="Rəqib tap";return;}
  enter(data);
}

// ---------- Otağa giriş + realtime ----------
function enter(r){
  room=r;myAns={};advancing=-1;starting=false;lastSig="";
  if(chan)sb().removeChannel(chan);
  const f=(t,k)=>({event:"*",schema:"public",table:t,filter:k+"=eq."+r.id});
  chan=sb().channel("room-"+r.id)
    .on("postgres_changes",f("rooms","id"),()=>refresh())
    .on("postgres_changes",f("room_players","room_id"),()=>refresh())
    .on("postgres_changes",f("room_answers","room_id"),()=>refresh())
    .subscribe();
  clearInterval(poll);poll=setInterval(()=>refresh(),2500);
  refresh(true);
}

async function refresh(force){
  if(!room)return;
  const rid=room.id;
  const [a,b,c]=await Promise.all([
    sb().from("rooms").select("*").eq("id",rid).maybeSingle(),
    sb().from("room_players").select("*").eq("room_id",rid).order("joined_at"),
    sb().from("room_answers").select("*").eq("room_id",rid)]);
  if(!room||room.id!==rid)return;
  if(!a.data){dropLocal();showToast("Otaq bağlandı.");return;}
  room=a.data;players=b.data||[];answers=c.data||[];
  const sig=JSON.stringify([room.status,room.q_index,room.owner,players,answers]);
  if(sig===lastSig&&!force)return;
  lastSig=sig;draw();
}

function dropLocal(){
  if(chan)sb().removeChannel(chan);
  chan=null;room=null;players=[];answers=[];clearInterval(tick);clearInterval(poll);viewMenu();
}
async function leave(){
  const id=room&&room.id;
  if(id)await sb().rpc("leave_room",{p_room:id});
  dropLocal();
}

function draw(){
  if(!room||!sec.classList.contains("active"))return;
  if(room.status==="waiting")viewLobby();
  else if(room.status==="playing")viewGame();
  else viewResult();
}

// ---------- Gözləmə zalı ----------
function viewLobby(){
  clearInterval(tick);
  const me=players.find(p=>p.user_id===currentUser.id)||{};
  const owner=room.owner===currentUser.id;
  const link=location.origin+location.pathname+"?room="+room.code;
  body(`<h2>${esc(room.name)}</h2>
  <p>${esc(room.level)} · ${room.q_count} sual · ${players.length}/${room.max_players} oyunçu</p>
  <div class="mp-code">${esc(room.code)}</div>
  <div class="actions" style="justify-content:center">
   <button class="secondary" id="mpCopy">📋 Kodu kopyala</button>
   <button class="secondary" id="mpLink">🔗 Dəvət linki</button></div>
  ${players.map(p=>`<div class="mp-p"><div class="mp-av">${esc((p.username||"?")[0].toUpperCase())}</div>
   <b>${esc(p.username)} ${p.user_id===room.owner?"👑":""}</b>
   <span class="${p.ready?"mp-ok":"mp-wait"}">${p.ready?"✓ Hazırdır":"⏳ Gözləyir"}</span></div>`).join("")}
  ${owner?`<button class="mp-btn" id="mpStart">▶ Oyuna başla</button>`
         :`<button class="mp-btn" id="mpReady">${me.ready?"Hazır deyiləm":"Hazıram ✓"}</button>`}
  <button class="secondary mp-btn" id="mpLeave">Otaqdan çıx</button>`);
  const copy=(t,m)=>{(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>showToast(m)).catch(()=>prompt("Kopyala:",t));};
  $("mpCopy").onclick=()=>copy(room.code,"Kod kopyalandı");
  $("mpLink").onclick=()=>copy(link,"Link kopyalandı");
  $("mpLeave").onclick=leave;
  if($("mpReady"))$("mpReady").onclick=async()=>{const r=await sb().rpc("set_ready",{p_room:room.id,p_ready:!me.ready});if(r.error){showToast(errMsg(r.error));console.error(r.error);}refresh(true);};
  if($("mpStart"))$("mpStart").onclick=startGame;
  if(owner&&room.quick&&players.length>=2&&players.every(p=>p.ready)&&!starting)startGame();
}

function makeQs(level,n){
  const L=levelData.find(l=>l.code===level)||levelData[0],ws=[];
  L.lessons.forEach(x=>x.words.forEach(w=>{if(!ws.some(v=>v[0]===w[0]))ws.push(w);}));
  const sh=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
  return sh(ws).slice(0,n).map(w=>{
    const o=sh([w[1],...sh(ws.filter(x=>x[1]!==w[1])).slice(0,3).map(x=>x[1])]);
    return{w:w[0],o,a:o.indexOf(w[1])};
  });
}
async function startGame(){
  if(starting)return;starting=true;
  const q=makeQs(room.level,room.q_count);
  const {error}=await sb().rpc("start_room",{p_room:room.id,
    p_questions:q.map(x=>({w:x.w,o:x.o})),p_answers:q.map(x=>x.a)});
  if(error){showToast(errMsg(error));starting=false;}
}

// ---------- Oyun ----------
function viewGame(){
  const qi=room.q_index,q=room.questions&&room.questions[qi];
  if(!q)return;
  const mine=myAns[qi];
  const ans=answers.filter(a=>a.q_index===qi);
  body(`<div class="mp-top">${players.map(p=>{
    const d=ans.some(a=>a.user_id===p.user_id);
    return `<div><b>${esc(p.username)}${p.user_id===currentUser.id?" (sən)":""}</b><br>${p.score} xal<br>
    <span class="${d?"mp-ok":"mp-wait"}">${d?"✓ cavab verdi":"⏳ düşünür"}</span></div>`;}).join("")}</div>
  <div class="tag">SUAL ${qi+1} / ${room.q_count}</div>
  <div class="mp-timer" id="mpTimer">15</div>
  <div class="word-box"><h2>${esc(q.w)}</h2><div class="example">Azərbaycan dilində mənası?</div></div>
  <div id="mpAns"></div>
  <div class="feedback">${mine?(mine.ok?"✓ Düzgün! 🎉":"✗ Yanlış"):""}</div>`);
  q.o.forEach((o,i)=>{
    const b=document.createElement("button");b.className="answer";b.textContent=o;
    if(mine){b.disabled=true;if(mine.c===i)b.classList.add(mine.ok?"correct":"wrong");}
    b.onclick=()=>pick(qi,i);
    $("mpAns").appendChild(b);
  });
  clearInterval(tick);
  const t0=Date.parse(room.q_started_at);
  tick=setInterval(()=>{
    const left=Math.max(0,15-(Date.now()-t0)/1000);
    const el=$("mpTimer");if(el)el.textContent=Math.ceil(left);
    const all=answers.filter(a=>a.q_index===qi).length>=players.length;
    if((left<=0||all)&&advancing!==qi){
      advancing=qi;
      setTimeout(()=>sb().rpc("advance_room",{p_room:room.id,p_q:qi}).then(()=>refresh()),all?900:300);
    }
  },400);
}
async function pick(qi,i){
  if(myAns[qi])return;
  myAns[qi]={c:i,ok:false};
  playSound("complete");
  const {data,error}=await sb().rpc("submit_answer",{p_room:room.id,p_q:qi,p_choice:i});
  if(error||data===null){delete myAns[qi];showToast(error?errMsg(error):"Cavab qəbul edilmədi.");return;}
  myAns[qi]={c:i,ok:data};
  playSound(data?"correct":"wrong");
  if(data)launchConfetti();
  refresh();
}

// ---------- Nəticə ----------
function viewResult(){
  clearInterval(tick);
  const s=[...players].sort((a,b)=>b.score-a.score);
  const tie=s.length>1&&s[0].score===s[1].score;
  const win=s[0];
  body(`<h2>🏁 Nəticə</h2>
  <div class="mp-win">${tie?"🤝 Bərabərlik":"🏆 "+esc(win.username)}</div>
  ${s.map((p,i)=>`<div class="mp-p"><div class="mp-av">${i+1}</div><b>${esc(p.username)}</b>
   <span>${p.score} xal · ✓${p.correct} ✗${p.wrong} · +${p.correct*5} XP</span></div>`).join("")}
  <button class="mp-btn" id="mpAgain">🔁 Yenidən yarış</button>
  <button class="secondary mp-btn" id="mpHome">Əsas səhifə</button>`);
  const me=players.find(p=>p.user_id===currentUser.id);
  if(me&&!room._xp){room._xp=1;saved.xp+=me.correct*5;persist();updateStats();}
  $("mpAgain").onclick=async()=>{await leave();};
  $("mpHome").onclick=async()=>{await leave();closeMp();};
}

// ---------- Dəvət linki ----------
function checkInvite(){
  const c=new URLSearchParams(location.search).get("room");
  if(!c)return;
  history.replaceState(null,"",location.pathname);
  let n=0;
  const t=setInterval(()=>{
    n++;
    if(currentUser){clearInterval(t);openMp();act(()=>sb().rpc("join_room",{p_code:c}));}
    else if(n>12){clearInterval(t);showToast("Dəvət üçün hesaba daxil ol, sonra kodu yaz: "+c);}
  },500);
}
checkInvite();
})();
