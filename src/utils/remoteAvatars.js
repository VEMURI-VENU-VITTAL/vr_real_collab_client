import { conferenceScene } from "../pages/conference";
import { createAvatar } from "./avatarLoader";

const avatarMap = {}

export function createRemoteAvatar(event){
    const activeUser = sessionStorage.getItem("userId")
    let remoteAvatar;
    if(activeUser==event.userId){
        return;
    }
    if(!avatarMap?.[event.userId]){
        createAvatar().then(({ newAvatar, newFaceMesh, newMixer, newWalkAction, newIdleAction }) => {
            avatarMap[event.userId] = {
                avatar:newAvatar,
                faceMesh:newFaceMesh,
                walkAction:newWalkAction,
                idleAction:newIdleAction
            };

            //add this new avatar into this scene
            conferenceScene.add(remoteAvatar)
        })
        
    }
    else{
        remoteUser = avatarMap?.[event.userId];
        remoteAvatar = remoteUser?.["avatar"]
        remoteUser?.["walkingAction"].play()
        remoteAvatar.position.set(
            event.position.x,
            event.position.y,
            event.position.z
        );

        remoteAvatar.quaternion.set(
            event.quaternion.x,
            event.quaternion.y,
            event.quaternion.z,
            event.quaternion.w
        );

        remoteUser?.["idleAction"].play()
    }


}