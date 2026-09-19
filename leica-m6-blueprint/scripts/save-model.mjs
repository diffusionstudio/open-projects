import fs from 'node:fs';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
const {buildCamera}=await import('./model.js');
const camera=buildCamera();
const edges=[];camera.root.traverse(o=>{if(o.isLineSegments)edges.push(o);});for(const o of edges)o.removeFromParent();
camera.root.scale.setScalar(.001);
class FileReaderPolyfill{readAsArrayBuffer(blob){blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});} readAsDataURL(blob){blob.arrayBuffer().then(buffer=>{this.result='data:'+blob.type+';base64,'+Buffer.from(buffer).toString('base64');this.onloadend?.();});}}
globalThis.FileReader=FileReaderPolyfill;
const glb=await new GLTFExporter().parseAsync(camera.root,{binary:true});
fs.writeFileSync('assets/models/leica-m6-50mm.glb',Buffer.from(glb));
let meshes=0,triangles=0;camera.root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
console.log(JSON.stringify({meshes,triangles,parts:camera.lens.parts.map(p=>p.name),blades:camera.lens.blades.length,bytes:glb.byteLength}));
