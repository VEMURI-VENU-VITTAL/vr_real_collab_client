import { getStompClient, isSocketConnected } from "./socket";

export function subscribeToRoom(stompClient){
    const roomId = sessionStorage.getItem("sessionId")
    if(!stompClient){
        return;
    }

    return stompClient.subscribe(
        `/topic/${roomId}/event`,
        (message)=>{
            const payload = JSON.parse(message.body);
            console.log("web socket message: ", payload)
        }
    )
}