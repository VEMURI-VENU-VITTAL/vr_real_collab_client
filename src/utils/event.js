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
        x:player.rotation.x,
        y:player.rotation.y,
        z:player.rotation.z,
        w:player.rotation.w
      }
    }

    sendEvent(event.sessionId, event)

    return event;
}