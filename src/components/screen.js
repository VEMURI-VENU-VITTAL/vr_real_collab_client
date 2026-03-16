import { floorMeasurements } from "../utils/measurements";
import * as THREE from "three"

let video = document.createElement("video");
let screenMesh;
export function addStream(stream){
  video.srcObject = stream;
  video.muted = true;  
  video.playsInline = true;
  video.play();
}

export function addScreen(scene){
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(4, 2.25); // 16:9
    screenMesh = new THREE.Mesh(geometry, material);

    screenMesh.position.set(0, 2, -1*floorMeasurements.height/2+1);

    scene.add(screenMesh)
}

function stopScreenShare(screenStream) {
  if (!screenStream) return;

  screenStream.getTracks().forEach(track => track.stop());
  screenStream = null;
}
