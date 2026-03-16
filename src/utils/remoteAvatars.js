import { conferenceScene } from "../pages/conference";
import { createAvatar } from "./avatarLoader";
import * as THREE from "three"

export let avatarMap = {};

export function createRemoteAvatar(event) {

    const activeUser = sessionStorage.getItem("userId");
    const sessionId = sessionStorage.getItem("sessionId");
    let remoteUser;
    if (activeUser === event.userId) return;
    if (event?.sessionId !== sessionId) return;

    // CREATE NEW AVATAR
    if (!avatarMap[event.userId]) {

        avatarMap[event?.userId] = {}

        createAvatar().then(({ 
            newAvatar, 
            newFaceMesh, 
            newMixer, 
            newWalkAction, 
            newIdleAction 
        }) => {

            const avatarWrapper = new THREE.Group()
            avatarWrapper.add(newAvatar)

            avatarWrapper.scale.set(0.8, 0.8, 0.8)
            avatarWrapper.position.set(0,0,0)

            avatarMap[event.userId] = {
                avatar: avatarWrapper,
                faceMesh: newFaceMesh,
                mixer: newMixer,
                walkAction: newWalkAction,
                idleAction: newIdleAction,
            };

            newIdleAction.play()

            conferenceScene.add(avatarWrapper);

            remoteUser = avatarMap[event.userId]
        });

    }
    else{

        // UPDATE EXISTING AVATAR
        remoteUser = avatarMap[event.userId];
        const remoteAvatar = remoteUser.avatar;

        // Update position
        remoteAvatar.position.set(
            event.position.x,
            event.position.y,
            event.position.z
        );

        // Update rotation
        remoteAvatar.quaternion.set(
            event.quaternion.x,
            event.quaternion.y,
            event.quaternion.z,
            event.quaternion.w
        );
    }

    // Animation state handling

    if (event.eventType=="MOVEMENT") {
        console.log("REMOTE USER MOVEMENT: ", remoteUser)

        remoteUser.idleAction.fadeOut(0.2);
        remoteUser.walkAction.reset().fadeIn(0.2).play();
    }

    if (event.eventType=="IDLE") {
        console.log("REMOTE USER IDLE: ", remoteUser)
        remoteUser.walkAction.fadeOut(0.2);
        remoteUser.idleAction.reset().fadeIn(0.2).play();

    }
}
