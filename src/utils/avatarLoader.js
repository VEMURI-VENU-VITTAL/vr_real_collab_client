import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

let avatar;
let mixer;
const keys = {};
let player;
let faceMesh;

export function avatarLoader(scene, sound) {
  const loader = new GLTFLoader();

  loader.load("/boy_mouthMovement.glb", (gltf) => {
    avatar = gltf.scene;             
    avatar.scale.set(0.8, 0.8, 0.8);
    avatar.position.set(0, 0, 0);
    avatar.rotation.y = Math.PI;

    avatar.traverse((obj)=>{
        if (obj.isMesh && obj.morphTargetDictionary) {
            faceMesh = obj;
            console.log("Morph targets:", obj.morphTargetDictionary);
        }
    })

    player = new THREE.Group();
    player.add(avatar)

    player.position.set(0,0,0)
    scene.add(player);

    // Animation mixer must use the scene
    mixer = new THREE.AnimationMixer(avatar);

    // Play first animation if exists
    if (gltf.animations && gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.timeScale = 0.2;
      action.play();
    }
  });



  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });
}

export function getMixer() {
  return mixer;
}

export function avatarKeyMovements(camera) {
  if (!player) return;

  const moveSpeed = 0.005;
  const rotateSpeed = 0.006;

  if (keys["w"]) {
    player.translateZ(-moveSpeed);
  }

  if (keys["s"]) {
    player.translateZ(moveSpeed);
  }

  if (keys["a"]) {
    player.rotation.y += rotateSpeed;
  }

  if (keys["d"]) {
    player.rotation.y -= rotateSpeed;
  }

  updateThirdPersonCamera(player, camera);
}


export function avatarSoundMaker(analyser){
  if(faceMesh && analyser){
     const volume = analyser.getAverageFrequency(); // 0–255
  const mouthValue = Math.min(volume / 80, 1);   // normalize

  const dict = faceMesh.morphTargetDictionary;
  const influences = faceMesh.morphTargetInfluences;

  if (dict.MouthOpen !== undefined) {
    influences[dict.MouthOpen] = mouthValue;
  }
  console.log(faceMesh.morphTargetInfluences)
  }


}

const cameraOffset = new THREE.Vector3(0, 2, 5);
const tempVec = new THREE.Vector3();

function updateThirdPersonCamera(player, camera) {
  // Player world position
  player.getWorldPosition(tempVec);

  // Rotate offset with player
  const offset = cameraOffset.clone().applyQuaternion(player.quaternion);

  // Position camera
  camera.position.copy(tempVec).add(offset);

  // Look at player (upper body)
  camera.lookAt(
    tempVec.x,
    tempVec.y + 1.5,
    tempVec.z
  );
}
