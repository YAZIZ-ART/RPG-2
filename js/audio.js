/* AETHERIA procedural audio — no external sound files required */
(()=>{'use strict';
let ac=null,master=null,musicGain=null,mode='',timer=0,step=0,muted=false;
const NOTES={C:130.81,D:146.83,E:164.81,G:196,A:220,B:246.94,C5:261.63,D5:293.66,E5:329.63,G5:392,A5:440};
function init(){if(ac)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=new AC();master=ac.createGain();master.gain.value=.48;master.connect(ac.destination);musicGain=ac.createGain();musicGain.gain.value=.24;musicGain.connect(master)}
function resume(){init();if(ac&&ac.state==='suspended')ac.resume()}
function tone(freq,dur,wave='sine',vol=.1,when=0,slide=1){if(!ac||muted)return;const t=ac.currentTime+when,o=ac.createOscillator(),g=ac.createGain();o.type=wave;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,freq*slide),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03)}
function noise(dur,vol,filter=1200){if(!ac||muted)return;const n=Math.floor(ac.sampleRate*dur),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=filter;g.gain.value=vol;s.connect(f);f.connect(g);g.connect(master);s.start();g.gain.setTargetAtTime(.0001,ac.currentTime+dur*.5,.04)}
const melodies={
 lobby:{b:[130.81,164.81,196,246.94,196,164.81,146.83,196],lead:[392,329.63,293.66,261.63,329.63,392,440,392],tempo:430},
 select:{b:[146.83,174.61,220,261.63,220,174.61,164.81,220],lead:[440,392,349.23,329.63,392,440,523.25,440],tempo:360},
 game:{b:[110,130.81,146.83,164.81,146.83,130.81,98,130.81],lead:[261.63,293.66,329.63,392,329.63,293.66,246.94,293.66],tempo:310}
};
function musicTick(){if(!ac||!mode||muted)return;const m=melodies[mode],i=step++%m.b.length,t=ac.currentTime;
 const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=m.b[i];g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+.3);
 if(i%2===0){const q=ac.createOscillator(),v=ac.createGain();q.type='sine';q.frequency.value=m.lead[i];v.gain.setValueAtTime(.0001,t);v.gain.linearRampToValueAtTime(.045,t+.02);v.gain.exponentialRampToValueAtTime(.0001,t+.2);q.connect(v);v.connect(musicGain);q.start(t);q.stop(t+.22)}
}
function playMusic(next){resume();if(!ac)return;if(mode===next&&timer)return;mode=next;step=0;if(timer)clearInterval(timer);musicGain.gain.setTargetAtTime(.22,ac.currentTime,.4);musicTick();timer=setInterval(musicTick,melodies[next].tempo)}
function stopMusic(){mode='';if(timer)clearInterval(timer);timer=0;if(ac&&musicGain)musicGain.gain.setTargetAtTime(.0001,ac.currentTime,.2)}
const element={
 api(){tone(105,.28,'sawtooth',.13,0,2.7);noise(.18,.08,1700);tone(620,.12,'triangle',.06,.06,.35)},
 air(){noise(.28,.07,700);tone(360,.24,'sine',.07,0,1.8)},
 tanah(){tone(82,.24,'triangle',.16,0,.55);noise(.12,.09,350)},
 listrik(){tone(1100,.13,'sawtooth',.07,0,.18);tone(520,.2,'square',.045,.04,1.9)},
 udara(){noise(.22,.055,2400);tone(540,.18,'sine',.05,0,1.7)}
};
function attack(weapon='Katana',el='api'){resume();const group=({Katana:'blade',Rapier:'blade',Longsword:'heavy',Tanto:'blade',Spear:'thrust',Naginata:'blade',Halberd:'heavy','Battle Axe':'heavy','War Hammer':'heavy',Mace:'heavy',Scythe:'blade',Kusarigama:'chain',Nunchaku:'chain',Bow:'ranged',Crossbow:'ranged','Throwing Knives':'ranged',Chakram:'ranged',Trident:'thrust',Staff:'magic',Shield:'heavy'})[weapon]||'blade';
 if(group==='blade'){noise(.13,.07,3000);tone(360,.1,'triangle',.045,0,.65)}
 if(group==='heavy'){tone(115,.2,'triangle',.13,0,.5);noise(.16,.1,500)}
 if(group==='thrust'){tone(220,.12,'sawtooth',.05,0,2.5);noise(.1,.045,2400)}
 if(group==='chain'){tone(700,.1,'square',.04,0,.45);tone(300,.16,'triangle',.05,.07,1.8)}
 if(group==='ranged'){tone(780,.08,'triangle',.05,0,.35);noise(.09,.045,2800)}
 if(group==='magic'){tone(440,.2,'sine',.07,0,1.8);tone(880,.18,'sine',.045,.05,.6)}
 (element[el]||element.api)()
}
function skill(name,el,combo=''){resume();const map={'Api':'api','Air':'air','Tanah':'tanah','Petir':'listrik','Udara':'udara'};const parts=combo.split(' + ').map(v=>map[v]).filter(Boolean);(parts.length?parts:[el]).forEach((v,i)=>{setTimeout(()=>{(element[v]||element.api)()},i*65)});tone(/Ledakan|Tsunami|Badai|Tornado/i.test(name)?95:260,.42,'sine',.075,0,/Ledakan|Tsunami|Badai|Tornado/i.test(name)?.45:2.2);if(/Es|Kristal/i.test(name))tone(1250,.28,'triangle',.045,.08,.3);if(/Naga|Lava|Bara/i.test(name))noise(.24,.09,600);if(/Magnet|Plasma|Aurora/i.test(name))tone(900,.25,'square',.035,.05,.4)}
function enemy(kind='melee'){resume();
 if(['jump','dive'].includes(kind)){noise(.2,.07,1800);tone(260,.14,'sine',.04,0,1.8)}
 else if(['spore','poison'].includes(kind)){tone(170,.28,'sine',.07,0,.6);noise(.16,.045,420)}
 else if(['stab','slash','bone'].includes(kind)){noise(.12,.07,2600);tone(300,.12,'square',.035,0,.5)}
 else if(['slam','stomp','rock'].includes(kind)){tone(75,.3,'triangle',.14,0,.42);noise(.18,.1,420)}
 else if(['pillar','orbs'].includes(kind)){tone(520,.3,'sine',.06,0,1.8);tone(780,.22,'triangle',.035,.06,.55)}
 else if(['breath','fire'].includes(kind)){noise(.3,.11,700);tone(100,.22,'sawtooth',.06,0,1.5)}
 else if(kind==='ranged'||kind==='throw'){tone(180,.22,'sawtooth',.06,0,1.8);noise(.1,.05,1000)}
 else{tone(95,.22,'square',.08,0,.45);noise(.1,.08,500)}}
function hit(){resume();noise(.11,.11,900);tone(145,.12,'triangle',.07,0,.55)}
function ui(){resume();tone(660,.07,'square',.035,0,1.15)}
function setMuted(v){muted=!!v;if(master&&ac)master.gain.setTargetAtTime(muted?0:.48,ac.currentTime,.05)}
addEventListener('pointerdown',resume,{once:true,passive:true});addEventListener('keydown',resume,{once:true});
window.AETH_AUDIO={resume,playMusic,stopMusic,attack,skill,enemy,hit,ui,setMuted,get muted(){return muted}};
})();
