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

        newAvatar.traverse((obj) => {
          if (obj.isMesh && obj.morphTargetDictionary) {
            newFaceMesh = obj;
          }
        });

        //set MouthOpen to 0
        setMorph(newFaceMesh, "MouthOpen", 0)

        const newMixer = new THREE.AnimationMixer(newAvatar);

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


        // resolve ONLY when ready
        resolve({ newAvatar, newFaceMesh, newMixer, newWalkAction, newIdleAction });
      },
      undefined,
      (err) => reject(err)
    );
  });
}

export function createNameLabel(text, position=[0,2,0]) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 64;

  context.fillStyle = "rgba(0,0,0,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = "28px Arial";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(0.7, 0.2, 1); // adjust size

  sprite.position.set(...position)

  return sprite;
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
    const nameTitle = createNameLabel("🔻", [0,1.6,0])
    player.add(nameTitle)
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

//gamepad helper function
function getGamepadInput() {
  const gamepad = navigator.getGamepads()[0];
  if (!gamepad) return null;

  return {
    forward: gamepad.axes[1] < -0.2,   // left stick up
    backward: gamepad.axes[1] > 0.2,   // left stick down
    left: gamepad.axes[0] < -0.2,      // left stick left
    right: gamepad.axes[0] > 0.2,      // left stick right
  };
}

export function avatarKeyMovements(camera) {
  if (!player) return;

  const moveSpeed = 0.005;
  const rotateSpeed = 0.006;

  // 🎮 Get controller input
  const gamepadInput = getGamepadInput();

  // ✅ Combine keyboard + controller
  const forward = keys["w"] || gamepadInput?.forward;
  const backward = keys["s"] || gamepadInput?.backward;
  const left = keys["a"] || gamepadInput?.left;
  const right = keys["d"] || gamepadInput?.right;

  const isPlayerMoved = forward || backward || left || right;

  if (isPlayerMoved) {

    // ▶ START WALK
    if (!isWalking) {
      idleAction.fadeOut(0.3);
      walkAction.reset().fadeIn(0.3).play();
      isWalking = true;

      createAvatarMovement(player, "MOVEMENT");
    }

    if (forward) {
      player.translateZ(-moveSpeed);
    }

    if (backward) {
      player.translateZ(moveSpeed);
    }

    if (left) {
      player.rotation.y += rotateSpeed;
    }

    if (right) {
      player.rotation.y -= rotateSpeed;
    }

    updateThirdPersonCamera(player, camera);

    // publish avatar position
    createAvatarMovement(player, "MOVING");
  }

  if (!isPlayerMoved && isWalking) {
    walkAction.fadeOut(0.3);
    idleAction.reset().fadeIn(0.3).play();
    isWalking = false;

    createAvatarMovement(player, "IDLE");
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
    if (!peer.voice || !remoteAtatarFaceMesh){
      continue
    }

    const rms = getRmsLoudness(peer.voice.analyser, peer.voice.timeData);
    const mouthOpen = mapMouthOpen(rms);
    setMorph(remoteAtatarFaceMesh, "MouthOpen", mouthOpen); // change name to your morph target
  }

}

export function avatarLeavingRoom(){
  console.log("")
  createAvatarMovement(player, "QUIT")
}
