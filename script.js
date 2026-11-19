
// ENGAZ SOUND SYSTEM

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
console.log("Audio unavailable");
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
