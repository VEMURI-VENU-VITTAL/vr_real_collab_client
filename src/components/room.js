import { facingWallsMeasurements, floorMeasurements, sideWallsMeasurements } from "../utils/measurements";
import * as THREE from "three";

export function Room() {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Floor
  const floorTexture = textureLoader.load("/textures/floor1.png")
  //Wall Texture
  const wallTexture = textureLoader.load("/textures/floor.png")
  wallTexture.wrapS = THREE.RepeatWrapping
  wallTexture.wrapT = THREE.RepeatWrapping
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;

  floorTexture.repeat.set(
  floorMeasurements.width / 2,
  floorMeasurements.height / 2
    );
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(floorMeasurements.width, floorMeasurements.height),
    new THREE.MeshStandardMaterial({ color: 0xffffff,
         side: THREE.DoubleSide,
         map:floorTexture
     })
  );
  floor.rotation.x = floorMeasurements?.["rotation.x"] || -Math.PI / 2;
  floor.position.y = 0;
  

  // Front wall
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(
      facingWallsMeasurements.width,
      facingWallsMeasurements.height
    ),
    new THREE.MeshStandardMaterial({ color: 0xdcdcdc, 
        side: THREE.DoubleSide
     })
  );
  frontWall.position.z = -floorMeasurements.height / 2;
  frontWall.position.y = facingWallsMeasurements.height / 2;
  frontWall.rotation.y = 0;

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(
      facingWallsMeasurements.width,
      facingWallsMeasurements.height
    ),
    new THREE.MeshStandardMaterial({ color: 0xdcdcdc, side: THREE.DoubleSide })
  );
  backWall.position.z = floorMeasurements.height / 2;
  backWall.position.y = facingWallsMeasurements.height / 2;
  backWall.rotation.y = Math.PI;

  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(
      sideWallsMeasurements.width,
      sideWallsMeasurements.height
    ),
    new THREE.MeshStandardMaterial({ color: 0xdcdcdc, side: THREE.DoubleSide})
  );
  rightWall.position.x = floorMeasurements.width / 2;
  rightWall.position.y = sideWallsMeasurements.height / 2;
  rightWall.rotation.y = -sideWallsMeasurements?.["rotation.y"] || -Math.PI / 2;

  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(
      sideWallsMeasurements.width,
      sideWallsMeasurements.height
    ),
    new THREE.MeshStandardMaterial({ color: 0xdcdcdc, side: THREE.DoubleSide })
  );
  leftWall.position.x = -floorMeasurements.width / 2;
  leftWall.position.y = sideWallsMeasurements.height / 2;
  leftWall.rotation.y = sideWallsMeasurements?.["rotation.y"] || Math.PI / 2;

  group.add(floor, frontWall,backWall, rightWall, leftWall);

  return group;
}
