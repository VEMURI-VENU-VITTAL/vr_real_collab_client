import * as THREE from "three"
import { getCamera, initThree, setScene } from "../utils/initThree";
import { avatarKeyMovements, avatarLoader, avatarSoundMaker, getMixer } from "../utils/avatarLoader";
import { Room } from "../components/room";
import { startScreenShare } from "../utils/screenShare";
import { addScreen, addStream } from "../components/screen";
export function DiscussionRoom(canvas){
   initThree(canvas)
   const camera = getCamera();
   const clock = new THREE.Clock();
   const scene = new THREE.Scene();
   const listener = new THREE.AudioListener();
   const sound = new THREE.Audio(listener);
   const audioLoader = new THREE.AudioLoader();
   const audioContext = THREE.AudioContext.getContext();
   let analyser;

   //add sound
   audioLoader.load("/testAudio.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(1.0);
});

  window.addEventListener("keydown", async (e) => {
  if (e.key.toLowerCase() === "p") {
    const stream = await startScreenShare();
    addStream(stream, scene);
  }
});


   camera.add(listener)
   scene.background = new THREE.Color(0xeeeeee)
   const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
   scene.add(ambientLight)

   const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);


  //  const controls = new OrbitControls(camera, canvas);
  //  controls.enableDamping = true
   
  const room = Room()
  scene.add(room)

  //add screen to room
  addScreen(scene)

    //add avatar to the room
    avatarLoader(scene, sound)

   camera.position.set(0,2,4.5);
   
   setScene(scene, ()=>{
    avatarSoundMaker(analyser)
    // controls.update()
    const delta = clock.getDelta();
    getMixer()?.update(delta)
    avatarKeyMovements(camera);
   })
}