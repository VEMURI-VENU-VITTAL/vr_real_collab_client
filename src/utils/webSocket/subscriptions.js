import { createRemoteAvatar } from "../remoteAvatars";
import { getStompClient, isSocketConnected } from "./socket";

export function subscribeToRoom(stompClient){
    const roomId = sessionStorage.getItem("sessionId")
    if(!stompClient){
        return;
    }

    stompClient.subscribe(
        `/topic/${roomId}/event`,
        (message)=>{
            const event = JSON.parse(message.body);
            createRemoteAvatar(event)
        }
    )
}