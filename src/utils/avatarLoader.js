import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { createAvatarMovement } from "./event";
import { getRmsLoudness, mapMouthOpen } from "./audioSetup/analyzer";
import { peers } from "./audioSetup/setup";
import { avatarMap } from "./remoteAvatars";

let avatar;
let mixer;
const keys = {};
let player;
let faceMesh;
let gltf;
let walkAction, idleAction;
let isWalking=false;
export function createAvatar() {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      "/boy_mouthMovement.glb",
      (newGltf) => {
        const newAvatar = newGltf.scene;
        let newFaceMesh = null;

        newAvatar.rotation.y = Math.PI;

        console.log("morph: ", newAvatar)
        newAvatar.traverse((obj) => {
          if (obj.isMesh && obj.morphTargetDictionary) {
            newFaceMesh = obj;
          }
        });

        //set MouthOpen to 0
        setMorph(newFaceMesh, "MouthOpen", 0)

        const newMixer = new THREE.AnimationMixer(newAvatar);

        console.log("animations: ", newGltf.animations)
        const newWalkAction = newMixer.clipAction(
          newGltf.animations.find((animation)=>animation.name=="Walk")
        )

        const newIdleAction = newMixer.clipAction(
          newGltf.animations.find((animation)=>animation.name=="Idle")
        )

        // if (newGltf?.animations?.length) {
        //   const action = newMixer.clipAction(newGltf?.animations[0]);
        //   action.timeScale = 0.2;
        //   action.play();
        // }
        newWalkAction.enabled = true;
        newIdleAction.enabled = true;

        newWalkAction.setLoop(THREE.LoopRepeat);
        newIdleAction.setLoop(THREE.LoopRepeat);

        newIdleAction.play()

        console.log("facemesh; ", newFaceMesh)

        // resolve ONLY when ready
        resolve({ newAvatar, newFaceMesh, newMixer, newWalkAction, newIdleAction });
      },
      undefined,
      (err) => reject(err)
    );
  });
}


export function avatarLoader(scene) {
  createAvatar().then(({ newAvatar, newFaceMesh, newMixer, newWalkAction, newIdleAction }) => {
    scene.add(newAvatar);
    avatar = newAvatar
    faceMesh = newFaceMesh;
    mixer = newMixer
    walkAction = newWalkAction
    idleAction = newIdleAction
  
    player = new THREE.Group();
    player.add(avatar)

    avatar.scale.set(0.8,0.8,0.8)
    player.position.set(0,0,0)
    scene.add(player);

    //send event through web socket to register this avatar for all the users
    const event = createAvatarMovement(avatar, "APPEARS");

    window.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
    });
  });
}

export function getMixer() {
  return mixer;
}

export function avatarKeyMovements(camera) {
  const isPlayerMoved = keys["w"] || keys["s"] || keys["a"] || keys["d"];
  if (!player) return;
  
  const moveSpeed = 0.005;
  const rotateSpeed = 0.006;
  if(isPlayerMoved){

    // ▶ START WALK
    if (!isWalking) {
      idleAction.fadeOut(0.3);
      walkAction
        .reset()
        .fadeIn(0.3)
        .play();
      isWalking = true;

      createAvatarMovement(player, "MOVEMENT")
    }

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
    
    //publish avatar position
    createAvatarMovement(player, "MOVING")
  }

  if (!isPlayerMoved && isWalking) {
    walkAction.fadeOut(0.3);
    idleAction
      .reset()
      .fadeIn(0.3)
      .play();
    isWalking = false;
    createAvatarMovement(player, "IDLE")
  }

}


function setMorph(mesh, name, value) {
  const dict = mesh.morphTargetDictionary;
  const inf = mesh.morphTargetInfluences;
  if (!dict || !inf) return;

  const idx = dict[name];
  if (idx === undefined) return;

  inf[idx] = value;
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

//update mouth for every frame 
export function animateLipSync() {

  for (const [remoteUserId, peer] of peers.entries()) {
    const remoteAtatarFaceMesh = avatarMap?.[remoteUserId]?.faceMesh
    console.log(peer, "rms peer")
    if (!peer.voice || !remoteAtatarFaceMesh) continue;

    const rms = getRmsLoudness(peer.voice.analyser, peer.voice.timeData);
    const mouthOpen = mapMouthOpen(rms);
    console.log("rms: ", rms)
    setMorph(remoteAtatarFaceMesh, "MouthOpen", mouthOpen); // change name to your morph target
  }

}
