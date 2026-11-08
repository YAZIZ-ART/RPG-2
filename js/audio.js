/* AETHERIA procedural audio — no external sound files required */
(()=>{'use strict';
let ac=null,master=null,musicGain=null,mode='',trackName='',timer=0,step=0,muted=false,trackIndex=0;
const NOTES={C:130.81,D:146.83,E:164.81,G:196,A:220,B:246.94,C5:261.63,D5:293.66,E5:329.63,G5:392,A5:440};
function init(){if(ac)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=new AC();master=ac.createGain();master.gain.value=.48;master.connect(ac.destination);musicGain=ac.createGain();musicGain.gain.value=.24;musicGain.connect(master)}
function resume(){init();if(ac&&ac.state==='suspended')ac.resume()}
function tone(freq,dur,wave='sine',vol=.1,when=0,slide=1){if(!ac||muted)return;const t=ac.currentTime+when,o=ac.createOscillator(),g=ac.createGain();o.type=wave;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(25,freq*slide),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03)}
function noise(dur,vol,filter=1200){if(!ac||muted)return;const n=Math.floor(ac.sampleRate*dur),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=filter;g.gain.value=vol;s.connect(f);f.connect(g);g.connect(master);s.start();g.gain.setTargetAtTime(.0001,ac.currentTime+dur*.5,.04)}
const melodies={
 lobby:{b:[130.81,164.81,196,246.94,196,164.81,146.83,196],lead:[392,329.63,293.66,261.63,329.63,392,440,392],tempo:430},
 select:{b:[146.83,174.61,220,261.63,220,174.61,164.81,220],lead:[440,392,349.23,329.63,392,440,523.25,440],tempo:360},
 game:{b:[110,130.81,146.83,164.81,146.83,130.81,98,130.81],lead:[261.63,293.66,329.63,392,329.63,293.66,246.94,293.66],tempo:310},
 game2:{b:[98,123.47,146.83,185,164.81,146.83,123.47,110],lead:[293.66,349.23,392,440,392,349.23,329.63,293.66],tempo:285},
 game3:{b:[123.47,146.83,164.81,196,174.61,146.83,110,123.47],lead:[329.63,392,440,523.25,440,392,349.23,329.63],tempo:340},
 boss:{b:[73.42,82.41,98,110,98,82.41,65.41,73.42],lead:[220,261.63,293.66,349.23,293.66,261.63,196,220],tempo:250}
};
function musicTick(){if(!ac||!mode||muted)return;const m=melodies[trackName||mode],i=step++%m.b.length,t=ac.currentTime;
 const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=m.b[i];g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g);g.connect(musicGain);o.start(t);o.stop(t+.3);
 if(i%2===0){const q=ac.createOscillator(),v=ac.createGain();q.type='sine';q.frequency.value=m.lead[i];v.gain.setValueAtTime(.0001,t);v.gain.linearRampToValueAtTime(.045,t+.02);v.gain.exponentialRampToValueAtTime(.0001,t+.2);q.connect(v);v.connect(musicGain);q.start(t);q.stop(t+.22)}
 if(i===m.b.length-1&&mode==='game'){trackIndex=(trackIndex+1)%3;trackName=['game','game2','game3'][trackIndex];step=0;if(timer){clearInterval(timer);timer=setInterval(musicTick,melodies[trackName].tempo)}}
}
function playMusic(next){resume();if(!ac)return;if(mode===next&&timer)return;mode=next;trackName=next;trackIndex=0;step=0;if(timer)clearInterval(timer);musicGain.gain.setTargetAtTime(.22,ac.currentTime,.4);musicTick();timer=setInterval(musicTick,melodies[trackName].tempo)}
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
function skill(name,el,combo=''){resume();if(/lava|magma|sembur|erupsi/i.test(name)){noise(.42,.16,420);tone(78,.48,'sawtooth',.12,0,.38);tone(190,.24,'triangle',.07,.12,2.2)}else if(/air|banjir|hujan|tsunami|gelombang/i.test(name)){noise(.38,.12,1100);tone(320,.3,'sine',.06,.04,.55)}else if(/petir|listrik|plasma|magnet/i.test(name)){noise(.16,.1,4200);tone(1450,.18,'sawtooth',.09,0,.12);tone(430,.24,'square',.06,.05,1.7)}else if(/tanah|batu|gempa|longsor/i.test(name)){tone(68,.4,'triangle',.15,0,.4);noise(.3,.13,320)}else if(/angin|udara|tornado|badai/i.test(name)){noise(.42,.1,1900);tone(520,.3,'sine',.06,0,1.8)}const map={'Api':'api','Air':'air','Tanah':'tanah','Petir':'listrik','Udara':'udara'};const parts=combo.split(' + ').map(v=>map[v]).filter(Boolean);(parts.length?parts:[el]).forEach((v,i)=>{setTimeout(()=>{(element[v]||element.api)()},i*65)});tone(/Ledakan|Tsunami|Badai|Tornado/i.test(name)?95:260,.42,'sine',.075,0,/Ledakan|Tsunami|Badai|Tornado/i.test(name)?.45:2.2);if(/Es|Kristal/i.test(name))tone(1250,.28,'triangle',.045,.08,.3);if(/Naga|Lava|Bara/i.test(name))noise(.24,.09,600);if(/Magnet|Plasma|Aurora/i.test(name))tone(900,.25,'square',.035,.05,.4)}
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
function dash(){resume();noise(.16,.065,2400);tone(310,.16,'sawtooth',.045,0,2.6);tone(680,.12,'sine',.025,.04,.5)}
function ui(){resume();tone(660,.07,'square',.035,0,1.15)}
function setMuted(v){muted=!!v;if(master&&ac)master.gain.setTargetAtTime(muted?0:.48,ac.currentTime,.05)}
addEventListener('pointerdown',resume,{once:true,passive:true});addEventListener('keydown',resume,{once:true});
window.AETH_AUDIO={resume,playMusic,stopMusic,attack,skill,enemy,hit,dash,ui,setMuted,get muted(){return muted}};
})();


/* AETHERIA — Studio SFX integration (20 character attacks + 40 element sounds).
   Kept separate from the music engine so the existing lobby/game music remains intact. */
(()=>{'use strict';
let A,M,S,NB,AN;const r=Math.random;
function init(){if(A)return;
A=new(window.AudioContext||window.webkitAudioContext)();
const c=A.createDynamicsCompressor();c.threshold.value=-16;c.ratio.value=6;c.attack.value=.003;c.release.value=.2;
const mk=A.createGain();mk.gain.value=1.5;
M=A.createGain();M.gain.value=.42;
const sh=A.createWaveShaper(),n=2048,cv=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;cv[i]=Math.tanh(x*2.2)/Math.tanh(2.2)}sh.curve=cv;sh.oversample='4x';
M.connect(sh);sh.connect(c);c.connect(mk);mk.connect(A.destination);
const L=A.sampleRate*2.6,b=A.createBuffer(2,L,A.sampleRate);
for(let k=0;k<2;k++){const d=b.getChannelData(k);let p=0;for(let i=0;i<L;i++){p+=((r()*2-1)-p)*.4;d[i]=p*Math.pow(1-i/L,2.4)*2}}
const rv=A.createConvolver();rv.buffer=b;const pd=A.createDelay();pd.delayTime.value=.03;S=A.createGain();S.gain.value=.4;S.connect(pd);pd.connect(rv);rv.connect(c);
NB=A.createBuffer(1,A.sampleRate*2,A.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=r()*2-1}
const O=g=>{let n=g;if(A.createStereoPanner){const s=A.createStereoPanner();s.pan.value=(r()-.5)*.8;g.connect(s);n=s}n.connect(M);n.connect(S)};
// T: nada (tipe,f awal,f akhir,durasi,volume,jeda,attack)
const T=(ty,f0,f1,du,v,d=0,a=.01)=>{const t=A.currentTime+d+.02,g=A.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*1.6,t+Math.min(a,du/4));g.gain.exponentialRampToValueAtTime(.0001,t+du);
const mk=(y,m,vv)=>{const o=A.createOscillator(),h=A.createGain();o.type=y;o.frequency.setValueAtTime(f0*m,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1*m),t+du);h.gain.value=vv;o.connect(h);h.connect(g);o.start(t);o.stop(t+du+.05)};
mk(ty,1,1);if(Math.min(f0,f1)<180){mk('triangle',2,.7);mk('sawtooth',3,.2)}else if(f0>700&&ty!=='square'&&ty!=='sawtooth')mk(ty,1.006,.55);O(g)};
// N: desis/noise berfilter (filter,f awal,f akhir,durasi,volume,jeda,Q,attack)
const N=(ft,f0,f1,du,v,d=0,q=1,a=.03)=>{const t=A.currentTime+d+.02,g=A.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*1.7,t+Math.min(a,du/4));g.gain.exponentialRampToValueAtTime(.0001,t+du);
const mk=(ty,a0,a1,qq,vv)=>{const s=A.createBufferSource(),f=A.createBiquadFilter(),h=A.createGain();s.buffer=NB;s.loop=true;f.type=ty;f.Q.value=qq;f.frequency.setValueAtTime(a0,t);f.frequency.exponentialRampToValueAtTime(a1,t+du);h.gain.value=vv;s.connect(f);f.connect(h);h.connect(g);s.start(t,r());s.stop(t+du+.05)};
mk(ft,f0,f1,q,1);if(ft==='lowpass'&&Math.min(f0,f1)<500)mk('bandpass',300,180,.8,.6);O(g)};
const R=(n,g,f)=>{for(let i=0;i<n;i++)f(i*g,i)};
const Z=(n,g,o=0)=>R(n,g,d=>T('sawtooth',1200+r()*2500,150,.05,.22,o+d));
const K=(n,du,v,o=0)=>{for(let i=0;i<n;i++)N('highpass',3000+r()*4000,6000,.03,v,o+r()*du,2)};

// [karakter, senjata, elemen, nama serangan, suara]
const W=[
['Akira','Katana','api','Tebasan Fajar Membara',()=>{N('highpass',500,7000,.28,.5);N('bandpass',6000,3500,.35,.25,.08,10);T('triangle',3200,3000,.6,.12,.08)}],
['Seraphina','Rapier','listrik','Tusukan Kilat Surgawi',()=>{T('sine',1800,5200,.12,.25);N('highpass',3000,9000,.12,.35);T('sine',4400,4300,.7,.1,.1);N('bandpass',7000,6500,.05,.3,.1,12)}],
['Varkas','Longsword','tanah','Pemecah Bumi',()=>{N('lowpass',3000,300,.4,.7);N('bandpass',400,150,.3,.5,.18,2);T('sine',110,40,.4,.8,.2);T('triangle',900,850,.5,.1,.2)}],
['Evelyne','Tanto','air','Gigitan Darah Senyap',()=>{R(3,.07,d=>N('highpass',2000,8000,.09,.4,d));T('sine',200,60,.12,.4,.22);N('bandpass',3000,2000,.2,.2,.2,6)}],
['Raiden','Spear','udara','Tombak Guntur Langit',()=>{N('bandpass',600,2800,.25,.5);T('sawtooth',300,1400,.15,.15);N('highpass',4000,9000,.12,.5,.25);T('square',90,30,.25,.5,.25);T('sawtooth',2000,100,.2,.3,.25)}],
['Amaya','Naginata','udara','Sapuan Badai Sabit',()=>{N('bandpass',300,2200,.6,.55,0,.8);N('bandpass',2200,400,.5,.4,.3,.8);T('triangle',1500,1100,.4,.08,.3)}],
['Chronos','Halberd','tanah','Kapak Penghancur Waktu',()=>{T('sine',160,35,.5,.9,.15);N('lowpass',2500,200,.35,.7);T('square',70,50,.3,.3,.15);R(2,.1,d=>T('sine',1800,1700,.05,.15,.5+d))}],
['Nyxara','Battle Axe','api','Amukan Kapak Neraka',()=>{N('lowpass',2800,250,.35,.7);T('sawtooth',90,45,.6,.4,.15);T('sine',100,30,.45,.9,.17);N('bandpass',1200,300,.3,.5,.17,1.5)}],
['Tharion','War Hammer','listrik','Palu Gemuruh Titan',()=>{N('bandpass',200,900,.2,.4,0,.8);T('sine',90,25,.9,1,.2);N('lowpass',800,60,.7,.9,.2);T('square',400,380,.4,.15,.22);T('triangle',2100,2000,1,.12,.22)}],
['Mirael','Mace','air','Hantaman Cahaya Suci',()=>{T('sine',130,45,.4,.8,.12);N('lowpass',1200,100,.3,.5,.12);[1,2.76,5.4].forEach(m=>T('sine',880*m,880*m,1.2,.1,.15))}],
['Kurozora','Scythe','air','Sabit Pencabut Jiwa',()=>{N('bandpass',2500,500,.7,.45,0,3);T('sine',1200,300,1,.18,.1);T('sine',1210,310,1,.18,.1);T('sawtooth',900,200,.9,.06,.1)}],
['Rindou','Kusarigama','tanah','Rantai Iblis Pencabik',()=>{R(8,.04,(d,i)=>N('bandpass',3000+i*200,3000+i*200,.04,.35,d,10));N('highpass',1500,7000,.2,.5,.35);T('triangle',2500,2300,.4,.1,.36)}],
['Renji','Nunchaku','listrik','Badai Pukulan Naga',()=>{R(5,.08,(d,i)=>{T('sine',220-i*10,70,.1,.6,d);N('bandpass',1800,900,.07,.4,d,1.5)});N('highpass',1000,5000,.1,.3)}],
['Elenara','Bow','udara','Panah Angin Pemburu',()=>{T('triangle',140,110,.25,.5);N('bandpass',900,400,.1,.4,0,3);N('bandpass',2400,5200,.5,.3,.05,6);T('sine',2000,3800,.4,.08,.05);T('sine',130,50,.15,.5,.5)}],
['Darius','Crossbow','api','Baut Penembus Baja',()=>{N('highpass',3000,3000,.03,.6);T('square',200,60,.12,.5);N('bandpass',2000,6000,.25,.4,.05,3);T('sine',120,35,.2,.8,.3);N('lowpass',1500,200,.15,.5,.3)}],
['Zephyra','Chakram','listrik','Cakram Siklon Berputar',()=>{R(6,.1,(d,i)=>N('bandpass',1200+i*200,2400,.12,.4,d,5));T('sine',1800,2600,.9,.12);T('triangle',3500,3400,.5,.08,.7)}],
['Kaelthas','Throwing Knives','udara','Hujan Belati Bayangan',()=>{R(4,.09,d=>{N('highpass',3000,9000,.08,.4,d);T('sine',300,90,.1,.5,d+.1)})}],
['Isolde','Trident','api','Trisula Pasang Samudra',()=>{N('lowpass',2000,500,.5,.5);N('bandpass',3000,800,.3,.5,.15,1);T('sine',400,120,.15,.6,.2);R(6,.04,d=>T('sine',900+r()*900,300,.08,.15,.2+d));N('highpass',5000,9000,.2,.3,.2)}],
['Sylvana','Staff','air','Tongkat Sihir Semesta',()=>{[523,659,784,1047,1319,1568].forEach((f,i)=>T('triangle',f,f*1.01,.5,.15,i*.06));T('sine',60,45,.5,.6,.3);N('highpass',6000,9000,.6,.15,.2)}],
['Valdrik','Shield','tanah','Benteng Penghancur',()=>{T('sine',140,40,.7,1);T('square',180,170,.3,.3);[1,2.4,3.9,5.3].forEach(m=>T('triangle',600*m,590*m,.9,.1));N('bandpass',1500,500,.3,.6,0,.6)}]];

// [nama asli, kombinasi, nama sangar, suara]
const E=[
['Uap','Api + Air','Desis Naga Kabut',()=>{N('bandpass',3500,1800,1.5,.4,0,.6,.15);N('highpass',6000,8000,1.3,.2);R(8,.12,d=>T('sine',300+r()*300,500,.08,.2,d))}],
['Lava','Api + Tanah','Murka Magma',()=>{N('lowpass',300,120,1.8,.8,0,1,.2);R(7,.22,d=>T('sine',120+r()*100,50,.12,.5,d+r()*.1));N('bandpass',900,300,1.4,.3,.2,.8)}],
['Plasma','Api + Petir','Bara Antariksa',()=>{T('sawtooth',100,900,.9,.25);T('square',2200,150,.6,.15,.3);N('bandpass',3000,7000,1,.35,0,4);Z(8,.1,.2)}],
['Pusaran Api','Api + Udara','Siklon Inferno',()=>{N('bandpass',200,1400,1.6,.6,0,1.2,.6);N('lowpass',700,250,1.6,.5);T('sawtooth',80,220,1.6,.15,0,.5);K(14,1.4,.3)}],
['Lumpur','Air + Tanah','Rawa Penelan',()=>{R(7,.15,d=>{T('sine',110+r()*80,45,.15,.5,d);N('lowpass',500,100,.15,.5,d)})}],
['Air Bermuatan','Air + Petir','Arus Sengat',()=>{N('bandpass',1500,800,1.2,.3,0,1,.1);Z(10,.1)}],
['Es','Air + Udara','Pecahan Kristal Beku',()=>{R(7,.07,(d,i)=>T('sine',2400+i*350,2400+i*350,.45,.14,d));N('highpass',6000,9000,.5,.25);N('bandpass',3500,500,.06,.6,.35,6)}],
['Gelombang Pasang','Air + Api','Amuk Samudra',()=>{N('lowpass',400,1800,1.2,.7,0,1,.9);N('lowpass',1800,200,1.2,.7,1.1);N('highpass',4000,5000,1.6,.18,.3)}],
['Batu Panas','Tanah + Api','Meteor Membara',()=>{R(4,.18,d=>{T('sine',100,40,.2,.8,d);N('bandpass',2000,500,.1,.5,d,2)});N('highpass',5000,7000,1.1,.18)}],
['Magnetisme','Tanah + Petir','Tarikan Kutub',()=>{T('sine',60,60,1.8,.5,0,.4);T('sine',200,900,1,.2);T('sine',900,200,1,.2,1);N('bandpass',400,1200,1.8,.25,0,3,.3)}],
['Debu Angin','Tanah + Udara','Badai Debu Maut',()=>{N('bandpass',800,2000,1.6,.5,0,.7,.5);N('highpass',3000,6000,1.5,.18,0,1,.5)}],
['Tembok Batu','Tanah + Air','Benteng Granit',()=>{R(4,.1,d=>{T('sine',70,30,.3,.9,d);N('lowpass',700,100,.25,.7,d)});N('lowpass',300,80,1,.5,.35)}],
['Ledakan Petir','Petir + Api','Dentum Kiamat',()=>{N('highpass',3000,9000,.12,.9);T('sine',90,25,1.3,1,.05);N('lowpass',1500,60,1.2,.9,.05);K(10,.6,.4,.15)}],
['Medan Listrik','Petir + Air','Sangkar Voltase',()=>{T('sine',60,60,1.6,.4,0,.3);T('sawtooth',120,120,1.6,.08,0,.3);R(10,.14,d=>N('bandpass',4000,5000,.04,.4,d,10))}],
['Badai Petir','Petir + Udara','Murka Langit',()=>{N('lowpass',800,200,2.2,.45,0,1,.6);N('highpass',2000,8000,.1,.8,.6);N('lowpass',500,40,1.6,.9,.65);K(8,1.6,.2)}],
['Getaran Seismik','Petir + Tanah','Guncang Bumi',()=>{T('sine',35,25,2,1,0,.2);T('sine',50,30,2,.6);N('lowpass',200,60,2,.8);R(6,.28,d=>T('sine',60,30,.2,.6,d))}],
['Angin Topan','Udara + Api','Topan Pembakar',()=>{N('bandpass',300,1800,1.9,.6,0,1.2,.7);N('bandpass',900,400,1.9,.35);K(16,1.8,.25)}],
['Kabut Ilusi','Udara + Air','Kabut Sesat',()=>{[440,554,659,880].forEach((f,i)=>T('sine',f,f*1.005,2.2,.1,i*.05,.7));N('highpass',6000,8000,2,.07,0,1,.8)}],
['Debu Silir','Udara + Tanah','Bisik Pasir Senyap',()=>{N('bandpass',1000,3000,1.3,.35,0,2,.4);N('highpass',5000,8000,1.1,.15,0,1,.4)}],
['Tornado Petir','Udara + Petir','Pusaran Guntur',()=>{N('bandpass',200,1500,1.9,.6,0,1.5,.6);R(6,.28,d=>{N('highpass',3000,9000,.08,.7,d+.2);T('sawtooth',1800,100,.15,.3,d+.2)})}],
['Naga Bara','Api + Tanah','Raung Naga Bara',()=>{T('sawtooth',90,40,1.5,.45,0,.15);T('sawtooth',95,45,1.5,.35,0,.15);N('bandpass',500,200,1.5,.6,0,1.5,.1);N('highpass',2000,6000,.9,.3,.3);K(10,1,.2,.3)}],
['Semburan Surya','Api + Udara','Semburan Matahari',()=>{T('sine',200,2000,1,.3,0,.2);N('highpass',2000,10000,1.3,.4,0,.5,.3);T('triangle',1046,1046,.8,.12,.5)}],
['Halilintar','Api + Listrik','Halilintar Murka',()=>{Z(6,.05);N('highpass',3000,10000,.1,1,.3);T('sine',70,25,1.6,1,.32);N('lowpass',2000,50,1.5,.9,.32)}],
['Rimba Purba','Air + Tanah','Rimba Purba Bangkit',()=>{R(3,.3,d=>T('sine',65,40,.3,.7,d));R(5,.18,(d,i)=>T('sawtooth',100+i*30,200+i*30,.3,.08,d));N('bandpass',2000,800,1.6,.15,0,1,.4)}],
['Fatamorgana','Air + Udara','Tipu Daya Gurun',()=>{R(8,.2,(d,i)=>T('sine',700+(i%2)*70,720+(i%2)*70,.5,.1,d,.15));N('highpass',7000,9000,1.8,.08,0,1,.5)}],
['Nadi Kehidupan','Air + Listrik','Denyut Kehidupan',()=>{R(4,.4,d=>{T('sine',70,40,.15,.9,d);T('sine',65,38,.15,.7,d+.15)});[262,330,392].forEach(f=>T('triangle',f,f,1.8,.07,0,.4))}],
['Banjir Bandang','Air + Tanah','Amuk Bandang',()=>{N('lowpass',600,300,2.2,.8,0,1,.4);N('bandpass',200,500,2.2,.5,0,.5,.4);R(6,.3,d=>T('sine',90,40,.2,.5,d+r()*.1))}],
['Langkah Gema','Tanah + Udara','Derap Gema Raksasa',()=>{R(4,.32,(d,i)=>{T('sine',80,35,.3,.9-i*.15,d);N('lowpass',500,80,.15,.5,d)})}],
['Titan Mekanik','Tanah + Listrik','Titan Baja',()=>{R(8,.09,d=>N('bandpass',2500,1500,.04,.4,d,6));T('sawtooth',50,35,1.2,.4,0,.1);T('square',100,60,.2,.5,.8);T('triangle',900,880,.8,.1,.8)}],
['Arus Listrik','Air + Listrik','Sengatan Arus Liar',()=>{T('sawtooth',100,100,1.6,.12,0,.3);Z(14,.1);N('bandpass',2500,2500,1.5,.15,0,2)}],
['Kilat Ruang','Listrik + Udara','Robekan Dimensi',()=>{T('sine',3000,100,.6,.35);T('sine',100,3000,.4,.3,.6);N('highpass',3000,9000,.1,.7,.55)}],
['Gelombang Sonik','Listrik + Udara','Jeritan Sonik',()=>{R(4,.22,(d,i)=>{T('sine',1200-i*200,100,.3,.5,d);T('square',220,55,.4,.2,d)})}],
['Hujan','Air + Udara','Rintik Hujan Deras',()=>{N('highpass',4000,6000,2.6,.3,0,.5,.4);R(45,.055,d=>T('sine',2500+r()*2500,2000,.02,.12,d+r()*.05))}],
['Pelangi','Air + Udara','Jembatan Pelangi',()=>{[523,587,659,784,880,1047,1175].forEach((f,i)=>T('triangle',f,f,.7,.18,i*.1));N('highpass',7000,9000,1,.1,.5)}],
['Tsunami','Air + Tanah','Tsunami Penghancur',()=>{N('lowpass',200,1000,1.8,.7,0,1,1.2);N('lowpass',1500,100,1.8,.9,1.7);T('sine',45,30,2,.8,1.7)}],
['Aurora','Listrik + Udara','Tirai Aurora Surgawi',()=>{[392,494,587,740].forEach(f=>{T('sine',f,f*1.01,2.6,.1,0,1);T('sine',f*2,f*2.02,2.6,.04,.3,1)});N('highpass',6000,9000,2.4,.06,0,1,1)}],
['Letusan Gunung','Api + Tanah','Letusan Gunung Kiamat',()=>{T('sine',40,25,2.2,1,0,.1);N('lowpass',500,50,2.2,.9,0,1,.1);K(14,1.5,.3,.3);R(5,.3,d=>T('sine',120,50,.15,.5,.3+d))}],
['Badai Pasir','Tanah + Udara','Badai Pasir Gurun Maut',()=>{N('bandpass',1500,900,2.3,.55,0,.5,.7);N('highpass',5000,7000,2.3,.25,0,1,.7)}],
['Hujan Meteor','Api + Udara','Hujan Meteor Neraka',()=>{R(4,.4,d=>{N('bandpass',3000,400,.5,.5,d,1.5);T('sine',90,25,.5,.9,d+.4)})}],
['Badai Salju','Air + Udara','Badai Salju Abadi',()=>{N('bandpass',800,2000,2.3,.35,0,.7,.7);R(6,.3,d=>T('sine',2000+r()*1500,2000,.35,.08,d))}]];

const SHM=()=>[2093,3136,4186].forEach((f,i)=>T('sine',f,f*1.002,1.1,.05,.12+i*.04,.05));
const BASE={
 api:()=>K(8,.5,.35,.1),
 air:()=>R(5,.05,d=>T('sine',900+r()*900,300,.08,.2,.1+d)),
 tanah:()=>{T('sine',90,35,.5,.6,.1);N('lowpass',500,90,.4,.5,.1)},
 listrik:()=>Z(5,.04,.1),
 udara:()=>N('bandpass',500,3000,.4,.35,0,1.2)
};
let lastCharAt=0;
function wake(){init();if(A&&A.state==='suspended')A.resume()}
function playCharacter(weapon){
 wake();if(!A)return;
 const now=performance.now();if(now-lastCharAt<260)return;lastCharAt=now;
 const w=W.find(v=>v[1]===weapon);if(!w)return;
 try{w[4]();(BASE[w[2]]||BASE.api)();SHM()}catch(e){/* keep combat running if an audio node fails */}
}
function playElement(name){
 wake();if(!A)return;
 const aliases={'Langkah Gemuruh':'Langkah Gema'};
 const key=aliases[name]||name,e=E.find(v=>v[0]===key);
 if(!e)return;
 try{e[3]();SHM()}catch(e){/* keep combat running if an audio node fails */}
}
function setVolume(v){wake();if(M&&A)M.gain.setTargetAtTime(Math.max(0,Math.min(1,+v||0))*.42,A.currentTime,.04)}
function setMuted(v){if(M&&A)M.gain.setTargetAtTime(v?0:.42,A.currentTime,.04)}
window.AETHERIA_STUDIO_SFX={init:wake,playCharacter,playElement,setVolume,setMuted,
 characterCount:W.length,elementCount:E.length};
const api=window.AETH_AUDIO;
if(api){
 const oldMute=api.setMuted.bind(api);
 api.attack=(weapon,el)=>{playCharacter(weapon)};
 api.skill=(name,el,combo)=>{playElement(name)};
 api.setMuted=v=>{oldMute(v);setMuted(v)};
}
})();
