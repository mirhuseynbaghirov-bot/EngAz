// EngAZ: sadələşdirilmiş giriş pəncərəsi. nav.js və fun.js-dən SONRA yüklə.
(function(){
const $=id=>document.getElementById(id);
const box=document.querySelector("#profileModal .modal-box");
const W='style="width:100%"',W2='class="secondary" style="width:100%;margin-top:10px"';

box.innerHTML=`
<h2>🧑‍🚀 EngAZ hesabı</h2>
<div class="auth-status" id="authStatus"></div>

<div id="vChoose">
  <p>Yeni hesab yarat və ya mövcud hesabına daxil ol.</p>
  <button ${W} data-v="vReg">Qeydiyyatdan keç</button>
  <button ${W2} data-v="vLog">Hesaba daxil ol</button>
  <button ${W2} data-x="1">Bağla</button>
</div>

<div id="vReg" style="display:none">
  <input id="regName" placeholder="İstifadəçi adı" maxlength="25" autocomplete="nickname">
  <input id="regEmail" type="email" placeholder="Email" autocomplete="email">
  <input id="regPass" type="password" placeholder="Parol (minimum 6 simvol)" autocomplete="new-password">
  <button id="regGo" ${W}>Qeydiyyatdan keç</button>
  <button ${W2} data-v="vChoose">← Geri</button>
</div>

<div id="vLog" style="display:none">
  <input id="logEmail" type="email" placeholder="Email" autocomplete="email">
  <input id="logPass" type="password" placeholder="Parol" autocomplete="current-password">
  <button id="logGo" ${W}>Daxil ol</button>
  <button ${W2} data-v="vChoose">← Geri</button>
</div>

<div id="vMe" style="display:none">
  <input id="nameInput" placeholder="İstifadəçi adı" maxlength="25">
  <button ${W} onclick="saveProfile()">Adı yadda saxla</button>
  <button ${W2} id="outGo">Hesabdan çıx</button>
  <button ${W2} data-x="1">Bağla</button>
</div>`;

function view(v){
  ["vChoose","vReg","vLog","vMe"].forEach(id=>$(id).style.display=id===v?"block":"none");
}
box.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.v){$("authStatus").textContent="";view(b.dataset.v);}
  if(b.dataset.x)closeProfile();
});

function fmt(x){
  const m=((x&&x.message)||"").toLowerCase();
  if(m.includes("already registered"))return "Bu email artıq qeydiyyatdan keçib. Hesaba daxil ol.";
  if(m.includes("invalid login"))return "Email və ya parol yanlışdır.";
  if(m.includes("not confirmed"))return "Əvvəlcə emailinə gələn təsdiq linkinə bas.";
  if(m.includes("password"))return "Parol minimum 6 simvol olmalıdır.";
  if(m.includes("rate limit")||m.includes("too many"))return "Çox cəhd oldu. Bir az gözləyib yenidən yoxla.";
  if(m.includes("fetch")||m.includes("network"))return "İnternet bağlantısını yoxla.";
  return "Xəta: "+(x&&x.message||x);
}

async function reg(){
  const u=$("regName").value.trim(),e=$("regEmail").value.trim(),p=$("regPass").value;
  if(!supabaseClient)return showToast("Supabase qoşulmayıb.");
  if(u.length<2)return showToast("İstifadəçi adı ən azı 2 simvol olsun.");
  if(!e)return showToast("Emaili yaz.");
  if(p.length<6)return showToast("Parol minimum 6 simvol olmalıdır.");
  const b=$("regGo");b.disabled=true;setAuthStatus("Qeydiyyat yaradılır...");
  try{
    const {data,error}=await supabaseClient.auth.signUp({email:e,password:p,options:{data:{username:u}}});
    if(error)throw error;
    if(data.session){
      currentUser=data.user;saved.name=u;persist();
      const r=await supabaseClient.from("profiles").upsert({id:data.user.id,username:u,updated_at:new Date().toISOString()});
      if(r.error)console.error(r.error);
      updateStats();closeProfile();showToast("Xoş gəldin, "+u+"! 🚀");
    }else{
      saved.name=u;persist();
      $("logEmail").value=e;view("vLog");
      setAuthStatus("Emailinə təsdiq məktubu göndərildi. Təsdiqlədikdən sonra daxil ol.");
    }
  }catch(x){console.error(x);setAuthStatus(fmt(x));}
  b.disabled=false;
}

async function log(){
  const e=$("logEmail").value.trim(),p=$("logPass").value;
  if(!supabaseClient)return showToast("Supabase qoşulmayıb.");
  if(!e||!p)return showToast("Email və parolu yaz.");
  const b=$("logGo");b.disabled=true;setAuthStatus("Daxil olunur...");
  try{
    const {data,error}=await supabaseClient.auth.signInWithPassword({email:e,password:p});
    if(error)throw error;
    currentUser=data.user;
    await loadCloudProfile();
    updateStats();closeProfile();showToast("Xoş gəldin! 💜");
  }catch(x){console.error(x);setAuthStatus(fmt(x));}
  b.disabled=false;
}

$("regGo").onclick=reg;
$("logGo").onclick=log;
$("regPass").addEventListener("keydown",e=>{if(e.key==="Enter")reg();});
$("logPass").addEventListener("keydown",e=>{if(e.key==="Enter")log();});
$("outGo").onclick=async()=>{await signOut();view("vChoose");updateStats();};

window.openProfile=function(){
  if(currentUser){$("nameInput").value=saved.name||"";view("vMe");}
  else{$("authStatus").textContent="";view("vChoose");}
  $("profileModal").classList.add("active");
};
})();
