import * as THREE from "three"
import { getCamera, initThree, setScene } from "../utils/initThree";
import { animateLipSync, avatarKeyMovements, avatarLoader, getMixer } from "../utils/avatarLoader";
import { Room } from "../components/room";
import { startScreenShare } from "../utils/screenShare";
import { addScreen, addStream } from "../components/screen";
import { connectWebSocket } from "../utils/webSocket/socket";
import { avatarMap } from "../utils/remoteAvatars";

export let conferenceScene;
export function DiscussionRoom(canvas){
  conferenceScene = new THREE.Scene();
  //connect to web socket
  connectWebSocket();

  //call audio setup code
  // audioWindowListeners()
  
   initThree(canvas)
   const camera = getCamera();
   const clock = new THREE.Clock();
   const listener = new THREE.AudioListener();
   const sound = new THREE.Audio(listener);
   const audioLoader = new THREE.AudioLoader();

   //add sound
   audioLoader.load("/testAudio.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(1.0);
});

  window.addEventListener("keydown", async (e) => {
  if (e.key.toLowerCase() === "p") {
    const stream = await startScreenShare();
    addStream(stream, conferenceScene);
  }
});


   camera.add(listener)
   conferenceScene.background = new THREE.Color(0xeeeeee)
   const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
   conferenceScene.add(ambientLight)

   const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 10, 5);
  conferenceScene.add(dirLight);


  //  const controls = new OrbitControls(camera, canvas);
  //  controls.enableDamping = true
   
  const room = Room()
  conferenceScene.add(room)

  //add screen to room
  addScreen(conferenceScene)

    //add avatar to the room
    avatarLoader(conferenceScene)

   camera.position.set(0,2,4.5);
   
   setScene(conferenceScene, ()=>{
    // controls.update()
    const delta = clock.getDelta();
    getMixer()?.update(delta)
    Object.values(avatarMap).forEach(user => {
      user.mixer?.update(delta);
    });
    avatarKeyMovements(camera);
    
    animateLipSync()
   })
}