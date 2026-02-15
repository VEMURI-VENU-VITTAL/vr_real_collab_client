import * as THREE from "three"
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

let renderer, camera;
let currentScene;


export function initThree(canvas){
    if (renderer) {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement = null;
  renderer = null;
}

        camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth/window.innerHeight,
        0.1,
        200
       )
    
       camera.position.z=5;
        renderer = new THREE.WebGLRenderer({
        canvas:canvas,
        antialias:true
       });
    
       renderer.setSize(window.innerWidth, window.innerHeight);
       renderer.xr.enabled = true;
       document.body.appendChild(VRButton.createButton(renderer));
    
       window.addEventListener('resize', ()=>{
        camera.aspect = window.innerWidth/window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)

       })
}

export function setScene(scene, updateFn){
    currentScene = scene;
   renderer.setAnimationLoop(() => {
        updateFn?.()
        renderer.render(scene,camera);
    });
}

export function getCamera(){
    return camera;
}