import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const container = $('viewport');
const scene = new THREE.Scene(); scene.background = new THREE.Color('#e4ebe7');
const camera = new THREE.OrthographicCamera(-12,12,9,-9,.1,120);
const VISUAL = { exposure: 1.05, sky: 2.0, key: 2.6, fill: 1.2,
  glassIdle: .22, glassActive: .4, glassDone: .85, stripIdle: .3, stripDone: 1.6 };
window.houseVisual = VISUAL;
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=VISUAL.exposure;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,4.7,0); camera.position.set(17,17,29);
controls.minZoom=.8;controls.maxZoom=2.8;
controls.enableDamping=true; controls.enablePan=false;
controls.minDistance=12; controls.maxDistance=52;
controls.minPolarAngle=.85; controls.maxPolarAngle=1.48;
controls.minAzimuthAngle=-.18; controls.maxAzimuthAngle=.85;
controls.update(); controls.saveState();
scene.add(new THREE.HemisphereLight('#fffaf0','#becbc3',VISUAL.sky));
const key=new THREE.DirectionalLight('#fff1df',VISUAL.key);key.position.set(-9,17,12);scene.add(key);
key.castShadow=true;key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:60});
key.shadow.bias=-.0002;key.shadow.normalBias=.025;key.shadow.radius=3;
const fill=new THREE.DirectionalLight('#e5f7ff',VISUAL.fill);fill.position.set(12,10,8);scene.add(fill);
let model,sections=[],selected=null,done=new Set(),needsRender=true;const meshes=[],lights=new Map();
try{const saved=JSON.parse(localStorage.getItem('geropharm-progress-v1')||'[]');if(Array.isArray(saved))done=new Set(saved);}catch{}
function save(){try{localStorage.setItem('geropharm-progress-v1',JSON.stringify([...done]));}catch{}}
function renderUI(){
 needsRender=true;
 $('progress').textContent=`Пройдено ${done.size} из 6`;
 for(const b of $('sections').children){b.classList.toggle('active',selected===b.dataset.id);b.classList.toggle('done',done.has(b.dataset.id));b.setAttribute('aria-pressed',String(selected===b.dataset.id));}
 if(selected){$('status').textContent=done.has(selected)?'РАЗДЕЛ ПРОЙДЕН':'ЗНАКОМСТВО С РАЗДЕЛОМ';$('complete').textContent=done.has(selected)?'Снять отметку о прохождении':'Отметить пройденным';}
}
function select(id){const section=sections.find(s=>s.id===id);if(!section)return;selected=id;$('title').textContent=section.title;$('text').replaceChildren(...section.items.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));$('card').hidden=false;renderUI();}
$('close').onclick=()=>{selected=null;$('card').hidden=true;renderUI();};
$('complete').onclick=()=>{if(!selected)return;if(done.has(selected))done.delete(selected);else done.add(selected);save();renderUI();};
$('reset').onclick=()=>{done.clear();save();renderUI();};
$('resetView').onclick=()=>controls.reset();
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;down=null;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(meshes,false)[0];if(hit)select(hit.object.userData.sectionId);});
renderer.domElement.addEventListener('pointercancel',()=>down=null);
function resize(){needsRender=true;const w=container.clientWidth,h=Math.max(1,container.clientHeight),aspect=w/h;renderer.setSize(w,h);const halfHeight=Math.max(8.25,12.4/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();controls.enableRotate=w>700;renderer.setPixelRatio(Math.min(devicePixelRatio,w<700?1.5:2));}
new ResizeObserver(resize).observe(container);resize();
async function init(){
 const response=await fetch('/sections.json');if(!response.ok)throw new Error('Не загружен sections.json');sections=await response.json();
 done=new Set([...done].filter(id=>sections.some(s=>s.id===id)));
 for(const s of sections){const b=document.createElement('button');b.textContent=s.title;b.dataset.id=s.id;b.onclick=()=>select(s.id);$('sections').append(b);}
 const gltf=await new GLTFLoader().loadAsync('/geropharm-house.glb');model=gltf.scene;scene.add(model);
 model.traverse(obj=>{if(!obj.isMesh)return;const id=obj.userData.sectionId;obj.receiveShadow=true;obj.castShadow=obj.userData.role!=='text';if(obj.material.map)obj.material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(!sections.some(s=>s.id===id))return;obj.material=obj.material.clone();obj.userData.baseColor=obj.material.color.clone();obj.userData.role=obj.material.userData.role||obj.userData.role||'';meshes.push(obj);});
 const heights=[.8,2,4.3,6.7,8.7,10];
 for(let i=0;i<sections.length;i++){const light=new THREE.PointLight('#ffe5bf',0,5,2);light.position.set(0,heights[i],i<3?3.8:2.8);scene.add(light);lights.set(sections[i].id,light);}
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 $('loading').hidden=true;renderUI();
}
init().catch(err=>{$('loading').textContent='Не удалось загрузить модель. Запустите проект через npm run dev. Подробности — в консоли.';console.error(err);});
const clock=new THREE.Clock();
function animate(){const dt=Math.min(clock.getDelta(),.05),t=1-Math.exp(-dt*6);if(controls.update())needsRender=true;
 for(const mesh of meshes){const id=mesh.userData.sectionId,complete=done.has(id),active=selected===id,role=mesh.userData.role;const m=mesh.material;
 // Keep the facade and typography light in all states. Only windows/accents emit.
 m.color.copy(mesh.userData.baseColor);
 let target=0;
 if(role==='glass'){m.emissive.copy(mesh.userData.baseColor);target=complete?VISUAL.glassDone:active?VISUAL.glassActive:VISUAL.glassIdle;}
 else if(role==='light'){m.emissive.set('#ffe4b4');target=complete?VISUAL.stripDone:VISUAL.stripIdle;}
 else if(role!=='text'&&role!=='white'){m.emissive.set('#ffe3b2');target=active?.045:complete?.018:0;}
 if(Math.abs(m.emissiveIntensity-target)>.001)needsRender=true;
 m.emissiveIntensity=THREE.MathUtils.lerp(m.emissiveIntensity,target,t);
 }
 for(const [id,light] of lights){const target=done.has(id)?3:selected===id?1:0;if(Math.abs(light.intensity-target)>.001)needsRender=true;light.intensity=THREE.MathUtils.lerp(light.intensity,target,t);}
 if(renderer.toneMappingExposure!==VISUAL.exposure)needsRender=true;
 renderer.toneMappingExposure=VISUAL.exposure;
 if(needsRender){renderer.render(scene,camera);needsRender=false;}
}
renderer.setAnimationLoop(animate);
document.addEventListener('visibilitychange',()=>renderer.setAnimationLoop(document.hidden?null:animate));

// Optional manual boot from a host application. The demo uses the same function.
window.houseApp={setRenderingEnabled(enabled){renderer.setAnimationLoop(enabled?animate:null);},getRenderStats(){return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},selectSection:select,setCompleted(ids){done=new Set(ids.filter(id=>sections.some(s=>s.id===id)));save();renderUI();},getCompleted(){return [...done];}};
