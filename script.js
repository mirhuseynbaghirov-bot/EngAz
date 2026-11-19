
const levelData=[
{
code:"A1",name:"Beginner",desc:"Başlanğıc səviyyə",icon:"🌱",
lessons:[
{title:"Salamlaşma",words:[
["Hello","Salam","Hello, my friend."],
["Good morning","Sabahın xeyir","Good morning, everyone."],
["Goodbye","Hələlik","Goodbye, see you soon."],
["Please","Zəhmət olmasa","Please, help me."],
["Thank you","Təşəkkür edirəm","Thank you very much."]
]},
{title:"Özünü təqdim et",words:[
["Name","Ad","My name is Ali."],
["Student","Tələbə","I am a student."],
["Live","Yaşamaq","I live in Baku."],
["Friend","Dost","He is my friend."],
["Country","Ölkə","My country is Azerbaijan."]
]}
]
},
{
code:"A2",name:"Elementary",desc:"İlkin biliklər",icon:"🌿",
lessons:[
{title:"Gündəlik həyat",words:[
["Usually","Adətən","I usually wake up early."],
["Sometimes","Bəzən","I sometimes read books."],
["Always","Həmişə","She always studies."],
["Never","Heç vaxt","I never smoke."],
["Together","Birlikdə","We work together."]
]},
{title:"Səyahət",words:[
["Journey","Səyahət","The journey was long."],
["Airport","Hava limanı","We are at the airport."],
["Ticket","Bilet","I need a ticket."],
["Hotel","Otel","The hotel is beautiful."],
["Visit","Ziyarət etmək","I visit my family."]
]}
]
},
{
code:"B1",name:"Intermediate",desc:"Orta səviyyə",icon:"🌳",
lessons:[
{title:"Fikir və hisslər",words:[
["Believe","İnanmaq","I believe in you."],
["Imagine","Təsəvvür etmək","Imagine a better future."],
["Decide","Qərar vermək","I decided to study."],
["Improve","İnkişaf etdirmək","I want to improve."],
["Experience","Təcrübə","It was a great experience."]
]},
{title:"İş həyatı",words:[
["Opportunity","Fürsət","This is a good opportunity."],
["Skill","Bacarıq","Communication is an important skill."],
["Develop","İnkişaf etdirmək","We develop new ideas."],
["Career","Karyera","She has a successful career."],
["Challenge","Çətinlik","Every challenge teaches us."]
]}
]
},
{
code:"B2",name:"Upper Intermediate",desc:"Yuxarı orta",icon:"🚀",
lessons:[
{title:"Biznes və texnologiya",words:[
["Investment","İnvestisiya","Investment requires planning."],
["Revenue","Gəlir","The company increased its revenue."],
["Strategy","Strategiya","We need a new strategy."],
["Consumer","İstehlakçı","The consumer needs quality."],
["Innovation","Yenilik","Innovation changes the world."]
]},
{title:"Cəmiyyət",words:[
["Environment","Ətraf mühit","We should protect the environment."],
["Opportunity","İmkan","Education creates opportunity."],
["Influence","Təsir","Social media has influence."],
["Research","Araşdırma","Research takes time."],
["Development","İnkişaf","Development is important."]
]}
]
},
{
code:"C1",name:"Advanced",desc:"İrəli səviyyə",icon:"🏆",
lessons:[
{title:"Akademik sözlər",words:[
["Significant","Əhəmiyyətli","This is a significant result."],
["Nevertheless","Buna baxmayaraq","Nevertheless, we continued."],
["Consequently","Nəticədə","Consequently, prices increased."],
["Furthermore","Bundan əlavə","Furthermore, we need evidence."],
["Approach","Yanaşma","We need a different approach."]
]},
{title:"Peşəkar ünsiyyət",words:[
["Negotiate","Danışıqlar aparmaq","We need to negotiate."],
["Implement","Tətbiq etmək","They implemented the plan."],
["Efficient","Səmərəli","This is an efficient method."],
["Relevant","Aidiyyəti olan","The information is relevant."],
["Prioritize","Prioritet vermək","We must prioritize our goals."]
]}
]
},
{
code:"C2",name:"Proficiency",desc:"Ustalıq səviyyəsi",icon:"👑",
lessons:[
{title:"İrəli ifadələr",words:[
["Meticulous","Çox diqqətli","She is meticulous in her work."],
["Ambiguous","Qeyri-müəyyən","The statement was ambiguous."],
["Inevitable","Qaçılmaz","Change is inevitable."],
["Compelling","Cəlbedici / inandırıcı","He gave a compelling argument."],
["Resilient","Dözümlü","A resilient person keeps learning."]
]},
{title:"Mürəkkəb sözlər",words:[
["Nevertheless","Buna baxmayaraq","Nevertheless, it worked."],
["Substantial","Əhəmiyyətli / böyük","There was substantial progress."],
["Intricate","Mürəkkəb","It is an intricate system."],
["Reluctant","İstəksiz","He was reluctant to agree."],
["Sustainable","Davamlı","We need sustainable solutions."]
]}
]
}
];

// SAVED DATA

let saved={};

try{
saved=JSON.parse(localStorage.getItem("engazData")||"{}");
}catch(e){saved={};}

saved.xp=Number(saved.xp)||0;
saved.completed=Array.isArray(saved.completed)?saved.completed:[];
saved.words=Array.isArray(saved.words)?saved.words:[];
saved.name=saved.name||"";
saved.lastDay=saved.lastDay||"";
saved.streak=Number(saved.streak)||0;
saved.earned=saved.earned||{};

let selectedLevel=0;
let currentLesson=0;
let currentStep=0;
let quizIndex=0;
let quizScore=0;
let answered=false;
let mode="words";
let lessonFinished=false;

// SOUND SYSTEM

let audioContext;

function playSound(type){
try{
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if(!AudioCtx)return;

if(!audioContext)audioContext=new AudioCtx();

if(audioContext.state==="suspended"){
audioContext.resume();
}

const frequencies={
correct:[523.25,659.25,783.99],
wrong:[220,180],
complete:[523.25,659.25,783.99,1046.5]
};

const notes=frequencies[type]||frequencies.correct;

notes.forEach((frequency,index)=>{
const oscillator=audioContext.createOscillator();
const gain=audioContext.createGain();

oscillator.connect(gain);
gain.connect(audioContext.destination);

oscillator.frequency.value=frequency;
oscillator.type="sine";

const start=audioContext.currentTime+index*.11;

gain.gain.setValueAtTime(.0001,start);
gain.gain.exponentialRampToValueAtTime(.12,start+.02);
gain.gain.exponentialRampToValueAtTime(.0001,start+.2);

oscillator.start(start);
oscillator.stop(start+.22);
});

}catch(error){
console.log("Audio unavailable",error);
}
}

// CONFETTI SYSTEM

function launchConfetti(){
for(let i=0;i<55;i++){
const particle=document.createElement("div");

particle.className="confetti";
particle.style.left=Math.random()*100+"%";
particle.style.background=
["#baff91","#8c70ff","#ffffff","#ffcf70"][i%4];

particle.style.animationDelay=Math.random()*.8+"s";

document.body.appendChild(particle);

setTimeout(()=>particle.remove(),3500);
}
}

// GENERAL FUNCTIONS

function persist(){
try{
localStorage.setItem("engazData",JSON.stringify(saved));
}catch(e){
console.log("Yadda saxlama xətası",e);
}
}

function today(){
const d=new Date();
return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function previousDay(){
const d=new Date();
d.setDate(d.getDate()-1);
return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function showToast(message){
const toast=document.getElementById("toast");
toast.textContent=message;
toast.classList.add("show");
setTimeout(()=>toast.classList.remove("show"),2200);
}

function updateStreak(){
const current=today();

if(saved.lastDay===current)return;

if(saved.lastDay===previousDay()){
saved.streak++;
}else{
saved.streak=1;
}

saved.lastDay=current;
persist();
}

function getRank(){
const level=Math.floor(saved.xp/100)+1;
const progress=saved.xp%100;

let name="🌱 Yeni başlayan";
let description="İlk addımlarını atırsan.";

if(level>=2)name="🌿 Söz ovçusu";
if(level>=4)name="⭐ İngilis dili həvəskarı";
if(level>=7)name="🚀 Sürətli öyrənən";
if(level>=10)name="🏆 Dil ustası";
if(level>=15)name="👑 EngAZ əfsanəsi";

return {level,progress,name,description};
}

function updateStats(){
document.getElementById("xp").textContent=saved.xp+" ⚡";
document.getElementById("completed").textContent=saved.completed.length;
document.getElementById("learned").textContent=saved.words.length;
document.getElementById("streak").textContent=saved.streak+" gün";
document.getElementById("userName").textContent=saved.name||"Profil";

const rank=getRank();

document.getElementById("rankName").textContent=rank.name;
document.getElementById("rankLevel").textContent="Level "+rank.level;
document.getElementById("xpProgressText").textContent=rank.progress+" / 100 XP";
document.getElementById("xpProgress").style.width=rank.progress+"%";

document.getElementById("rankDescription").textContent=
"Ümumi "+saved.xp+" XP toplamısan. Növbəti səviyyəyə "+(100-rank.progress)+" XP qalıb.";
}

// LEVELS

function renderLevels(){
const area=document.getElementById("levels");
area.innerHTML="";

levelData.forEach((level,index)=>{
const total=level.lessons.length;

const done=level.lessons.filter((lesson,i)=>
saved.completed.includes(index+"-"+i)
).length;

const div=document.createElement("div");
div.className="level"+(selectedLevel===index?" selected":"");

div.innerHTML=`
<div class="level-top">
<span class="tag">${level.code}</span>
<span class="level-icon">${level.icon}</span>
</div>
<h3>${level.name}</h3>
<p>${level.desc}</p>
<div class="progress">
<span style="width:${done/total*100}%"></span>
</div>
<div class="level-info">${done}/${total} dərs tamamlanıb</div>
`;

div.onclick=()=>selectLevel(index);
area.appendChild(div);
});
}

function selectLevel(index){
selectedLevel=index;
renderLevels();
renderLessons();
document.getElementById("lessonHeading").scrollIntoView({behavior:"smooth"});
}

function renderLessons(){
const level=levelData[selectedLevel];

document.getElementById("levelDescription").textContent=
level.code+" · "+level.name+" — dərsini seç.";

const area=document.getElementById("lessons");
area.innerHTML="";

level.lessons.forEach((lesson,index)=>{
const done=saved.completed.includes(selectedLevel+"-"+index);

const div=document.createElement("div");
div.className="lesson-card";

div.innerHTML=`
<div class="tag">${level.code} · DƏRS ${index+1}</div>
<h3>${lesson.title}</h3>
<p>5 yeni söz · Nümunə cümlələr · Test</p>
<p class="${done?'done':''}">
${done?'✓ Tamamlandı':'📖 Öyrənməyə hazırdır'}
</p>
<button>${done?'Yenidən öyrən':'Dərsə başla →'}</button>
`;

div.querySelector("button").onclick=()=>startLesson(index);
area.appendChild(div);
});

// LESSON

function startLesson(index){
currentLesson=index;
currentStep=0;
quizIndex=0;
quizScore=0;
mode="words";
lessonFinished=false;

updateStreak();

document.getElementById("home").style.display="none";
document.getElementById("study").classList.add("active");

document.getElementById("continueButton").onclick=continueStudy;
showStep();
window.scrollTo(0,0);
}

function showStep(){
const lesson=levelData[selectedLevel].lessons[currentLesson];

document.getElementById("studyTag").textContent=
levelData[selectedLevel].code+" · Dərs "+(currentLesson+1);

document.getElementById("studyTitle").textContent=lesson.title;

const progress=mode==="words"?
currentStep/5*50:
50+quizIndex/5*50;

document.getElementById("studyProgress").style.width=progress+"%";

if(mode==="words"){
document.getElementById("studyDescription").textContent=
"Yeni sözləri öyrən və nümunələrə diqqət et.";

const word=lesson.words[currentStep];

document.getElementById("studyContent").innerHTML=`
<div class="word-box">
<div class="tag">SÖZ ${currentStep+1} / 5</div>
<h2>${word[0]}</h2>
<div class="translation">${word[1]}</div>
<div class="example">${word[2]}</div>
</div>
<button class="secondary" onclick="speak()">🔊 Tələffüz et</button>
`;

document.getElementById("continueButton").textContent=
currentStep===4?"Testə keç →":"Növbəti söz →";

}else{
document.getElementById("studyDescription").textContent=
"Doğru cavabı seç. Hər yeni düzgün cavab 5 XP qazandırır.";

answered=false;

const word=lesson.words[quizIndex];
const distractors=lesson.words.filter((w,i)=>i!==quizIndex);

const options=[
word[1],
distractors[quizIndex%4][1],
distractors[(quizIndex+1)%4][1]
];

const shuffled=options.sort(()=>Math.random()-.5);

document.getElementById("studyContent").innerHTML=`
<div class="word-box">
<div class="tag">SUAL ${quizIndex+1} / 5</div>
<h2>${word[0]}</h2>
<div class="example">Bu sözün Azərbaycan dilində mənası hansıdır?</div>
</div>
<div id="answerList"></div>
`;

shuffled.forEach(option=>{
const btn=document.createElement("button");
btn.className="answer";
btn.textContent=option;
btn.onclick=()=>checkAnswer(btn,option,word[1]);
document.getElementById("answerList").appendChild(btn);
});

document.getElementById("continueButton").textContent=
quizIndex===4?"Nəticəni gör →":"Növbəti sual →";
}

document.getElementById("feedback").textContent="";
}

function speak(){
const word=levelData[selectedLevel].lessons[currentLesson].words[currentStep][0];

if(!("speechSynthesis" in window)){
showToast("Tələffüz dəstəklənmir.");
return;
}

speechSynthesis.cancel();

const utterance=new SpeechSynthesisUtterance(word);
utterance.lang="en-US";
utterance.rate=.85;

speechSynthesis.speak(utterance);
}

// ANSWERS

function checkAnswer(button,answer,correct){
if(answered)return;

answered=true;

const buttons=document.querySelectorAll(".answer");
buttons.forEach(b=>b.disabled=true);

if(answer===correct){
playSound("correct");

quizScore++;
button.classList.add("correct");

const key=selectedLevel+"-"+currentLesson;
const rewardKey=key+"-"+quizIndex;

if(!saved.earned[rewardKey]){
saved.xp+=5;
saved.earned[rewardKey]=true;
persist();
updateStats();
showToast("+5 XP ⚡");
}

document.getElementById("feedback").textContent=
"Əla! Düzgün cavabdır. +5 XP 🎉";

}else{
playSound("wrong");

button.classList.add("wrong");

buttons.forEach(b=>{
if(b.textContent===correct)b.classList.add("correct");
});

document.getElementById("feedback").textContent=
"Düzgün cavab: "+correct;
}
}

function continueStudy(){
if(lessonFinished){
goHome();
return;
}

if(mode==="words"){
if(currentStep<4){
currentStep++;
showStep();
}else{
mode="quiz";
quizIndex=0;
showStep();
}
return;
}

if(!answered){
document.getElementById("feedback").textContent="Əvvəlcə cavab seç.";
return;
}

if(quizIndex<4){
quizIndex++;
showStep();
}else{
finishLesson();
}
}

// FINISH LESSON

function finishLesson(){
lessonFinished=true;

const key=selectedLevel+"-"+currentLesson;
const firstCompletion=!saved.completed.includes(key);

if(firstCompletion){
saved.completed.push(key);
saved.xp+=15;

const words=levelData[selectedLevel].lessons[currentLesson].words;

words.forEach(w=>{
if(!saved.words.includes(w[0])){
saved.words.push(w[0]);
}
});

persist();

launchConfetti();
playSound("complete");
}

document.getElementById("studyTitle").textContent="Dərs tamamlandı! 🎉";

document.getElementById("studyDescription").textContent=
"Nəticən: "+quizScore+"/5 düzgün cavab.";

document.getElementById("studyContent").innerHTML=`
<div class="word-box">
<h2>${quizScore}/5 ⭐</h2>
<div class="translation">Dərs uğurla tamamlandı!</div>
<div class="example">
${firstCompletion?"+15 XP dərs mükafatı":"Bu dərsi artıq tamamlamısan."}
</div>
</div>
`;

document.getElementById("studyProgress").style.width="100%";
document.getElementById("feedback").textContent="İnkişaf etməyə davam et! 💚";

document.getElementById("continueButton").textContent="Dərslərə qayıt";
document.getElementById("continueButton").onclick=goHome;

updateStats();
renderLevels();
renderLessons();
renderAchievements();

if(firstCompletion)showToast("Dərs tamamlandı! +15 XP 🏆");
}

// ACHIEVEMENTS

function renderAchievements(){
const area=document.getElementById("achievements");

const achievements=[
{icon:"🌱",name:"İlk addım",desc:"İlk dərsini tamamla",done:saved.completed.length>=1},
{icon:"📚",name:"Kitab qurdu",desc:"5 dərs tamamla",done:saved.completed.length>=5},
{icon:"⚡",name:"XP ovçusu",desc:"100 XP qazan",done:saved.xp>=100},
{icon:"🔥",name:"3 günlük seriya",desc:"3 gün ardıcıl öyrən",done:saved.streak>=3},
{icon:"📖",name:"Söz ustası",desc:"25 söz öyrən",done:saved.words.length>=25},
{icon:"👑",name:"Level 5",desc:"5-ci səviyyəyə çat",done:Math.floor(saved.xp/100)+1>=5}
];

area.innerHTML="";

achievements.forEach(a=>{
const div=document.createElement("div");
div.className="achievement"+(a.done?" unlocked":"");

div.innerHTML=`
<div class="achievement-icon">${a.icon}</div>
<h4>${a.name}</h4>
<p>${a.done?"✓ Qazanıldı":a.desc}</p>
`;

area.appendChild(div);
});
}

// NAVIGATION

function goHome(){
if("speechSynthesis" in window)speechSynthesis.cancel();

document.getElementById("study").classList.remove("active");
document.getElementById("home").style.display="block";

document.getElementById("continueButton").onclick=continueStudy;

renderLevels();
renderLessons();
renderAchievements();
updateStats();

window.scrollTo({top:0,behavior:"smooth"});
}

// PROFILE

function openProfile(){
document.getElementById("nameInput").value=saved.name;
document.getElementById("profileModal").classList.add("active");
}

function closeProfile(){
document.getElementById("profileModal").classList.remove("active");
}

function saveProfile(){
const name=document.getElementById("nameInput").value.trim();

if(!name){
showToast("Adını daxil et!");
return;
}

saved.name=name;
persist();
updateStats();
closeProfile();
showToast("Profil yadda saxlanıldı! 💜");
}

document.getElementById("nameInput").addEventListener("keydown",e=>{
if(e.key==="Enter")saveProfile();
});

// INITIALIZE

renderLevels();
renderLessons();
renderAchievements();
updateStats();

if(!saved.name)openProfile();
