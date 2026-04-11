import { createRemoteAvatar } from "../remoteAvatars";

export const subscribeToRoom = (stompClient)=>{
    const roomId = sessionStorage.getItem("sessionId")
    if(!stompClient){
        return;
    }
    try{
        stompClient.subscribe(
            `/topic/${roomId}/event`,
            (message)=>{
                const event = JSON.parse(message.body);
                console.log("user avatar movement: ", event)
                createRemoteAvatar(event)
            }
        )
    }
    catch(e){
        console.log("error in web socket subscription")
    }
}