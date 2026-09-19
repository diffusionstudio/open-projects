import * as T from 'three';

const white=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
const blue=new T.LineBasicMaterial({color:'#1F4FD8',depthTest:true});
export type EdgeModel={mesh:T.Mesh,line:T.LineSegments,edges:any[],buffer:Float32Array};
export const edgeModels:EdgeModel[]=[];
function add(parent:T.Object3D, geo:T.BufferGeometry,name:string,x=0,y=0,z=0){
 const mesh=new T.Mesh(geo,white);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);
 const p=geo.attributes.position,idx=geo.index;const verts:T.Vector3[]=[],map=new Map<string,number>(),ids:number[]=[];
 for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i);const key=[v.x,v.y,v.z].map(a=>Math.round(a*10000)).join(',');if(!map.has(key)){map.set(key,verts.length);verts.push(v);}ids[i]=map.get(key)!;}
 const edges=new Map<string,any>();
 for(let i=0;i<(idx?idx.count:p.count);i+=3){const tri=[0,1,2].map(j=>ids[idx?idx.getX(i+j):i+j]);const [a,b,c]=tri.map(j=>verts[j]);const n=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();if(n.lengthSq()<.5)continue;for(let j=0;j<3;j++){const u=tri[j],v=tri[(j+1)%3],key=Math.min(u,v)+':'+Math.max(u,v);if(edges.has(key))edges.get(key).normals.push(n);else edges.set(key,{a:verts[u],b:verts[v],normals:[n]});}}
 const es=[...edges.values()].filter(e=>e.normals.length===1||e.normals[0].dot(e.normals[1])<.999999);
 for(const e of es)e.crease=e.normals.length===1||e.normals[0].dot(e.normals[1])<Math.cos(.55);
 const buffer=new Float32Array(es.length*6);const eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(buffer,3).setUsage(T.DynamicDrawUsage));const line=new T.LineSegments(eg,blue);line.frustumCulled=false;line.renderOrder=2;mesh.add(line);edgeModels.push({mesh,line,edges:es,buffer});return mesh;
}
export function updateEdges(camera:T.Camera){
 camera.updateMatrixWorld();const cp=new T.Vector3().setFromMatrixPosition(camera.matrixWorld);const dir=new T.Vector3();camera.getWorldDirection(dir);
 for(const m of edgeModels){if(!m.mesh.visible)continue;const inv=new T.Matrix4().copy(m.mesh.matrixWorld).invert(),lc=cp.clone().applyMatrix4(inv),ld=dir.clone().transformDirection(inv).negate();let k=0;for(const e of m.edges){let show=e.crease;if(!show){const view=(camera as any).isOrthographicCamera?ld:lc.clone().sub(e.a);show=(e.normals[0].dot(view)>=0)!==(e.normals[1].dot(view)>=0);}if(show){m.buffer.set([e.a.x,e.a.y,e.a.z,e.b.x,e.b.y,e.b.z],k);k+=6;}}m.line.geometry.setDrawRange(0,k/3);m.line.geometry.attributes.position.needsUpdate=true;}
}
function box(g:T.Object3D,n:string,w:number,h:number,d:number,x=0,y=0,z=0){return add(g,new T.BoxGeometry(w,h,d),n,x,y,z);}
function disk(g:T.Object3D,n:string,r:number,h:number,x:number,y:number,z:number,axis='z'){const geo=new T.CylinderGeometry(r,r,h,96);if(axis==='z')geo.rotateX(Math.PI/2);return add(g,geo,n,x,y,z);}
function ring(g:T.Object3D,n:string,ro:number,ri:number,z0:number,z1:number){const path=[new T.Vector2(ri,z0),new T.Vector2(ro,z0),new T.Vector2(ro,z1),new T.Vector2(ri,z1),new T.Vector2(ri,z0)];const geo=new T.LatheGeometry(path,144);geo.rotateX(Math.PI/2);return add(g,geo,n);}
function roundedPlan(w:number,d:number,r:number){const s=new T.Shape();s.moveTo(-w/2+r,-d/2);s.lineTo(w/2-r,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);s.lineTo(w/2,d/2-r);s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);s.lineTo(-w/2+r,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);s.lineTo(-w/2,-d/2+r);s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);return s;}
function shell(g:T.Object3D,n:string,w:number,d:number,lo:number,hi:number){const geo=new T.ExtrudeGeometry(roundedPlan(w,d,13),{depth:hi-lo,bevelEnabled:false,curveSegments:24});geo.rotateX(Math.PI/2);return add(g,geo,n,0,hi,0);}
function lever(g:T.Object3D,n:string,points:number[][],depth:number,x:number,y:number,z:number,top=false){const s=new T.Shape();points.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false});if(top)geo.rotateX(-Math.PI/2);return add(g,geo,n,x,y,z);}
export function buildCamera(){
 const root=new T.Group();root.name='LEICA M6 / 138.6 × 78 × 40 mm';const body=new T.Group();body.name='M6 body';root.add(body);
 shell(body,'Vulcanite body shell',138.6,34.5,-35,16);
 shell(body,'Brass top plate',138.6,34.8,16,34);
 shell(body,'Bottom plate',138.6,35.5,-39,-35);
 shell(body,'Top deck rim',138.8,35.2,33.8,35.2);
 // Three front optical windows: rangefinder, illumination and viewfinder.
 for(const [name,x,w,h] of [['Rangefinder window',-48,15,10],['Frameline illumination window',-24,19,13],['Viewfinder window',47,22,14]] as [string,number,number,number][]){box(body,name+' bezel',w+2,h+2,1.2,x,24,17.7);box(body,name,w,h,.5,x,24,18.55);}
 disk(body,'Front round badge',5.8,.6,10,25,18.1);
 disk(body,'Lens release button',3.3,3,39,-7,20);
 disk(body,'Frameline lever pivot',3,2,-27,5,19);
 lever(body,'Frameline preview lever',[[-2,-2],[1,-3],[7,9],[5,11]],2,-27,5,19);
 // Shutter speed dial, central shutter release, advance lever and frame counter.
 disk(body,'Shutter speed dial pedestal',10,1.5,-12,36,0,'y');disk(body,'Shutter speed dial',9.2,4,-12,38.5,0,'y');disk(body,'Dial inset',6.5,.4,-12,40.6,0,'y');
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(body,'Shutter index '+i,.35,.3,2,-12+7.5*Math.sin(a),40.9,7.5*Math.cos(a));tick.rotation.y=a;}
 disk(body,'Advance hub',8,3.2,43,37,0,'y');disk(body,'Shutter release',4.2,3,43,39.6,0,'y');disk(body,'Cable release socket',1.5,.4,43,41.3,0,'y');
 lever(body,'Film advance lever',[[0,-3],[10,-4],[21,-15],[27,-14],[28,-10],[15,1],[0,3]],2,43,38,0,true);
 disk(body,'Frame counter bezel',6.5,1.5,58,36.4,6,'y');disk(body,'Frame counter glass',5.3,.3,58,37.3,6,'y');
 const rewind=new T.Group();rewind.name='Angled rewind crank';rewind.position.set(-52,37,0);rewind.rotation.z=.16;body.add(rewind);disk(rewind,'Rewind base',10,3,0,0,0,'y');disk(rewind,'Rewind knob',8,4,0,3.4,0,'y');box(rewind,'Folded rewind crank',14,1.5,3,1,6.2,0);disk(rewind,'Rewind crank handle',2,4,8,6.2,0,'y');
 box(body,'Accessory shoe plate',18,1,16,13,35.9,-1);box(body,'Shoe left rail',2,2.2,16,5,37,-1);box(body,'Shoe right rail',2,2.2,16,21,37,-1);box(body,'Shoe back stop',15,1.4,1,13,36.8,-8);
 for(const x of [-70,70]){const lug=disk(body,'Strap lug',3.3,3,x,7,0);lug.rotation.y=Math.PI/2;}
 // Sparse, actual shallow raised ridges suggesting vulcanite grain.
 for(let side=0;side<2;side++)for(let i=0;i<7;i++){const x=(side?-48:49)+(i%3)*2.8,y=-10-Math.floor(i/3)*6;const ridge=box(body,'Vulcanite relief',3,.22,.18,x,y,17.36);ridge.rotation.z=.35+(i%2)*.7;}
 const mount=new T.Group();mount.position.set(8,-7,0);body.add(mount);ring(mount,'M bayonet body flange',25,20,17.7,20.5);ring(mount,'Inner mount throat',21,18.8,20.5,22);
 for(let i=0;i<4;i++){const profile=[new T.Vector2(18.8,20.5),new T.Vector2(20.5,20.5),new T.Vector2(20.5,22.3),new T.Vector2(18.8,22.3),new T.Vector2(18.8,20.5)];const geo=new T.LatheGeometry(profile,24,i*Math.PI/2,.55);geo.rotateX(Math.PI/2);add(mount,geo,'Bayonet locking lug '+i);}
 const lens=buildLens();lens.root.position.set(8,-7,22);root.add(lens.root);
 return {root,body,lens};
}
export function buildLens(){const root=new T.Group();root.name='50mm f/1.4 nested optical assembly';const parts:T.Group[]=[];function part(name:string,z:number,spread:number){const g=new T.Group();g.name=name;g.position.z=z;g.userData={base:z,spread};root.add(g);parts.push(g);return g;}
 // Lathe profile is in mm, rotated so optical axis is +Z (lathe y becomes z).
 const bay=part('09 / bayonet mount ring',0,18);ring(bay,'M lens bayonet collar',23.5,18.8,0,4);ring(bay,'Bayonet retaining lip',24,20,4,5);
 const rear=part('08 / rear element group',5,58);glass(rear,16,0,4);glass(rear,15,5,2.8);
 const focus=part('07 / focusing helicoid',8,84);ring(focus,'Focus barrel sleeve',25.5,21,0,16);ring(focus,'Focus grip rim',26.75,23,2,11);
 for(let i=0;i<36;i++){const a=i*Math.PI/18;const rib=box(focus,'Focus knurl '+i,.6,1,7,26.6*Math.sin(a),26.6*Math.cos(a),6.5);rib.rotation.z=-a;}
 const helixPoints:T.Vector3[]=[];for(let i=0;i<=240;i++){const a=i/240*Math.PI*5;helixPoints.push(new T.Vector3(23*Math.cos(a),23*Math.sin(a),12+i/240*6));}add(focus,new T.TubeGeometry(new T.CatmullRomCurve3(helixPoints),240,.18,3,false),'Helicoid helical ridge');
 const iris=part('06 / individual iris blades',26,120);ring(iris,'Iris carrier',21.5,19.5,0,1.6);const blades:T.Group[]=[];
 for(let i=0;i<9;i++){const pivot=new T.Group();const a=i*Math.PI*2/9;pivot.position.set(18.1*Math.cos(a),18.1*Math.sin(a),.2+i*.035);pivot.rotation.z=a;iris.add(pivot);const leaf=new T.Shape();leaf.moveTo(1,-4);leaf.quadraticCurveTo(5,1,1,7);leaf.quadraticCurveTo(-5,11,-14,7);leaf.quadraticCurveTo(-16,5,-14,2);leaf.quadraticCurveTo(-6,-3,1,-4);add(pivot,new T.ExtrudeGeometry(leaf,{depth:.1,bevelEnabled:false,curveSegments:18}),'Iris blade '+(i+1));pivot.userData.base=a;blades.push(pivot);}
 const aperture=part('05 / aperture ring',25,150);ring(aperture,'Aperture setting ring',24,21.8,0,8);ring(aperture,'Aperture front lip',24.5,21.8,7,9);
 for(let i=0;i<16;i++){const a=i*Math.PI/8;const rib=box(aperture,'Aperture grip '+i,.5,.5,3,24*Math.sin(a),24*Math.cos(a),4);rib.rotation.z=-a;}
 const front=part('04 / front element group',35,194);ring(front,'Front optical cell',22,20.9,-1,13);glass(front,20.8,0,4.2);glass(front,20,5,3.1);glass(front,19.7,9,2);
 const retaining=part('03 / front retaining ring',46,237);ring(retaining,'Front optic retaining ring',23.3,20.7,0,2.2);
 const filter=part('02 / E46 filter ring',48,276);ring(filter,'E46 threaded filter ring',24.3,22.9,0,3.5);ring(filter,'Filter thread groove',23.8,23.1,1.5,2.2);
 const hood=part('01 / telescopic hood',40,325);ring(hood,'Lens hood sleeve',26.4,24.5,0,12.5);ring(hood,'Hood front rolled edge',26.75,24.5,11.5,12.5);
 return {root,parts,blades,focus};}
function glass(g:T.Group,r:number,z:number,h:number){const points=[new T.Vector2(0,z-.9),new T.Vector2(r*.5,z-.6),new T.Vector2(r*.85,z),new T.Vector2(r,z+.7),new T.Vector2(r,z+h-.5),new T.Vector2(r*.85,z+h),new T.Vector2(r*.5,z+h+.4),new T.Vector2(0,z+h+.6)];const geo=new T.LatheGeometry(points,144);geo.rotateX(Math.PI/2);const mesh=add(g,geo,'Optical glass element'); // Glass carries only its boundary geometry; no painted glass surface.
 mesh.material=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false});}
export function animateLens(lens:ReturnType<typeof buildLens>,p:number,focus=0){lens.root.rotation.z=-.5*Math.min(1,p*4);for(const part of lens.parts){part.position.z=part.userData.base+part.userData.spread*p;part.rotation.z=p*(part.name.startsWith('01')?.35:part.name.startsWith('07')?-1.5:1.2);}lens.focus.rotation.z+=focus*.5;lens.focus.position.z+=focus*2.2;for(const part of lens.parts){if(part!==lens.focus&&!part.name.startsWith('09'))part.position.z+=focus*2.2;}for(const b of lens.blades)b.rotation.z=b.userData.base-.05-p*.92;}
