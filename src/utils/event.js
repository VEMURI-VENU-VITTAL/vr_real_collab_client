import { sendEvent } from "./webSocket/publisher";

export function createAvatarMovement(player, type){
    const event = {
      userId:sessionStorage.getItem("userId"),
      sessionId:sessionStorage.getItem("sessionId"),
      eventType:type,
      position:{
        x:player.position.x,
        y:player.position.y,
        z:player.position.z
      },
      quaternion:{
        x:player.quaternion.x,
        y:player.quaternion.y,
        z:player.quaternion.z,
        w:player.quaternion.w
      }
    }


    sendEvent(event)

    return event;
}