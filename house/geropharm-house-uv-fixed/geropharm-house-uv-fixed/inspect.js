import * as T from '/node_modules/three/build/three.module.js';
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
const s=new T.Scene();s.background=new T.Color('#e4ebe7');const c=new T.OrthographicCamera(-12,12,8,-8,.1,100);c.position.set(17,17,29);c.lookAt(0,4.7,0);
const r=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(2400,1600);document.body.append(r.domElement);s.add(new T.HemisphereLight(0xffffff,0xbbbbbb,2));let l=new T.DirectionalLight(0xffffff,3);l.position.set(-9,17,12);s.add(l);
let g=await new GLTFLoader().loadAsync('/public/geropharm-house.glb');s.add(g.scene);window.scene=s;window.camera=c;window.renderer=r;window.model=g.scene;window.T=T;window.draw=()=>r.render(s,c);window.draw();window.ready=true;