import { createEffect, onCleanup, onMount } from 'solid-js';
import { useTicker, generate } from '@diffusionstudio/jsx';
import type { SceneNode } from '@diffusionstudio/jsx';
import * as T from 'three';
import {buildCamera,buildLens,animateLens,updateEdges,edgeModels} from './model';

const soundtrack=generate.audio({
 model:'elevenlabs-music',duration:16,seed:6184,
 prompt:'Instrumental precision electronic / minimal electro music for a luxury camera technical motion design film. 113 BPM, D minor. Cool, sophisticated, tactile analog synths, syncopated plucked arpeggio, deep clean sub bass, crisp tight drums, tasteful stereo detail. Exactly four bars of tension-building intro (about 8.5 seconds): start with sparse muted analog sequencer and airy texture, gradually open the filter, introduce a rising synth and accelerating percussion; keep the full kick and bass OUT of the intro. Tiny breath immediately before a powerful unmistakable beat drop at 8.5 seconds: punchy kick, deep grooving bass, dry snare/clap and intricate hi hats all enter together on the downbeat. The drop should feel sleek and energetic, not bombastic. Continue the confident driving groove to the end, with a tight ending accent at 15 seconds and a short reverb tail. No vocals, no spoken words, no vocal samples, no orchestral trailer sounds. High quality polished stereo mix, clean transients.'
});

/** @inspect color */ const COBALT='#1F4FD8';
/** @inspect font */ const FONT='JetBrains Mono';
/** @inspect text */ const TITLE='> LEICA M6';
/** @inspect number */ const TITLE_SIZE=98;
/** @inspect number */ const CARD_SIZE=23;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const out=(x:number)=>{x=clamp(x);return 1+2.35*Math.pow(x-1,3)+1.35*Math.pow(x-1,2)};
const cards=[
 {id:'system',start:9.3,end:11.3,duration:1.72,x:1020,y:188,lines:['// m6.system','01 // Leica M6 is a 35mm rangefinder camera.','02 // Introduced in 1984, built by hand in Germany.','03 // Fully mechanical. The battery only powers','04 // the light meter.']},
 {id:'optics',start:11.8,end:13.5,duration:1.44,x:560,y:624,lines:['// m6.optics','01 // Leica M bayonet mount.','02 // This model: 50mm f/1.4 prime lens.','03 // 0.72x viewfinder, framelines from 28 to 135mm.','04 // Focus by aligning the rangefinder patch.']},
 {id:'shutter',start:14.5,end:15,duration:.33,x:1090,y:665,lines:['// m6.shutter','01 // Horizontal cloth focal-plane shutter.','02 // Speeds from 1s to 1/1000s, plus Bulb.','03 // TTL metering, two red LED arrows in the finder.','04 // Reissued in 2022, still in production.']},
];
function Card(props:{card:typeof cards[0]}){const {time}=useTicker();const c=props.card;const total=c.lines.reduce((a,s)=>a+s.length,0);const count=()=>Math.floor(clamp((time()-c.start)/c.duration)*total);const prior=(row:number)=>c.lines.slice(0,row).reduce((a,s)=>a+s.length,0);const active=()=>{let n=count();for(let i=0;i<c.lines.length;i++){if(n<c.lines[i].length)return i;n-=c.lines[i].length;}return 4};
 return <group id="comment-card" name={'// m6.'+c.id} start={c.start} end={c.end}>
 {c.lines.map((line,i)=><text id="comment-line" x={c.x} y={c.y+i*42} width={830} height={36} fontFamily={FONT} fontWeight={700} fontSize={CARD_SIZE} color={COBALT}>{line.slice(0,Math.max(0,count()-prior(i)))}{i>0&&<textRange id="line-number" start={0} end={2} color="#91A9EC"/>}</text>)}
 <rect id="cursor" x={c.x+Math.min(c.lines[active()].length,Math.max(0,count()-prior(active())))*CARD_SIZE*.6+2} y={c.y+active()*42+3} width={13} height={25} fill={COBALT} opacity={count()<total||Math.floor((time()-c.start-c.duration)*(c.id==='shutter'?16:2))%2===0?1:0}/>
 </group>;
}
export default function Project(){const {time}=useTicker();let surface:SceneNode|undefined;
 onMount(()=>{const el=surface!.element!;const ctx=el.getContext('2d')!;const canvas=document.createElement('canvas');const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(1920,1080,false);renderer.setClearColor(0xffffff,0);renderer.outputColorSpace=T.SRGBColorSpace;
 edgeModels.length=0;const scene=new T.Scene();const main=buildCamera(),second=buildCamera(),small=buildLens();scene.add(main.root,second.root,small.root);
 const perspective=new T.PerspectiveCamera(34,16/9,.2,4000);const ortho=new T.OrthographicCamera(-960,960,540,-540,.1,10000);ortho.position.set(0,0,2400);ortho.lookAt(0,0,0);
 function place(root:T.Group,x:number,y:number,s:number,rx=0,ry=0,rz=0){root.position.set(x-960,540-y,0);root.scale.setScalar(s);root.rotation.set(rx,ry,rz,'XYZ');root.visible=true;}
 function draw(t:number){main.root.visible=false;second.root.visible=false;small.root.visible=false;animateLens(main.lens,0);animateLens(second.lens,0);animateLens(small,0);let camera:T.Camera=ortho;
 if(t<8.5){
  const p=smooth(t/8.5),q=Math.pow(p,1.15);
  main.root.visible=true;main.root.position.set(0,0,0);main.root.rotation.set(0,0,0,'XYZ');main.root.scale.setScalar(1);
  animateLens(main.lens,q);camera=perspective;
  // A repeatable, deliberately oblique starting view. Finish the orbital arc
  // before the first ring reaches the viewpoint, then travel strictly coaxially.
  const u=clamp(t/4.15),orbit=1-u*u*u*(u*(u*6-15)+10);
  const azimuth=-1.08*orbit,elevation=.34*orbit;
  const radius=620-595*p;
  perspective.position.set(8+radius*Math.cos(elevation)*Math.sin(azimuth),-7+radius*Math.sin(elevation),22+radius*Math.cos(elevation)*Math.cos(azimuth));
  perspective.lookAt(8+28*orbit,-7+10*orbit,22);
 }

 else if(t<11.8){const entry=out((t-8.5)/.8),exit=Math.pow(clamp((t-11.3)/.5),3),drift=smooth((t-9.3)/2);place(main.root,494,663+(1-entry)*1000-exit*1450,5.93*(1+.012*drift),0,0,0);place(second.root,1440,735-(1-entry)*1100+exit*1300,4.22*(1+.01*drift),Math.PI/2,0,0);}
 else if(t<13.5){const p=smooth((t-11.8)/1.7);place(main.root,988,305,4.55,-.24,-.39+.175*p,-.045);place(small.root,1555,867,3.25,0,Math.PI/2,-.04);animateLens(small,0,Math.sin(p*Math.PI*2));}
 else if(t>=14){const entry=out((t-14)/.5),drift=smooth((t-14.5)/.5);place(main.root,1050-(1-entry)*1700,560+(1-entry)*1600,10.3,-.3,.55+drift*.04,.47);main.root.rotation.set(-.3,.55+drift*.04,.47,'ZYX');}
 scene.updateMatrixWorld(true);updateEdges(camera);renderer.render(scene,camera);}
 createEffect(()=>{const t=time();ctx.clearRect(0,0,1920,1080);const whipping=(t>=8.5&&t<9.12)||(t>=11.3&&t<11.8)||(t>=14&&t<14.45);const samples=whipping?24:1;ctx.filter=whipping?'blur(1.6px)':'none';for(let i=0;i<samples;i++){const st=whipping?Math.max(t-(i/(samples-1))*.05,t>=14?14:t>=11.3?11.3:8.5):t;draw(st);ctx.globalAlpha=1/samples;ctx.drawImage(canvas,0,0);}ctx.globalAlpha=1;ctx.filter='none';});
 onCleanup(()=>{renderer.dispose();scene.traverse(o=>{if((o as any).geometry)(o as any).geometry.dispose()});});
 });
 return <stage id="leica-stage" background="#131313" camera={[0.57, 0, 0, 0.57, 33.04, 74.92]}><scene id="leica-m6" name="LEICA M6 — mechanical gesture" width={1920} height={1080} fill="#FFFFFF" active timeline={[55.58, -0.14, 0]}>
 <sequence id="music-layer" name="Electronic score · drop at scene change"><audio id="music" name="Mechanical Pulse / 113 BPM" src={soundtrack} end={14.8} volume={-3} sourceIn={0.2}><animation id="music-in" type="gain" duration={0.12}/><animation id="music-out" type="gain" phase="out" duration={0.18}/></audio></sequence>
 <sequence id="type-layer" name="Flat typography"><group id="title-layer" start={8.5} end={15}><text id="title" x={112} y={888} width={950} height={140} fontFamily={FONT} fontSize={TITLE_SIZE} fontWeight={700} color={COBALT}>{TITLE}</text></group></sequence>
 <sequence id="cards-layer" name="Code comment cards">{cards.map(c=><Card card={c}/>)}</sequence>
 <sequence id="geometry-layer" name="3D model · hidden-line render"><surface id="geometry" name="Real mesh geometry / silhouette and crease edges" x={0} y={0} width={1920} height={1080} start={0} end={15} ref={surface}/></sequence>
 </scene></stage>;
}
