import { getStompClient, isSocketConnected } from "./socket";

let stompCLient = getStompClient();
export function subscribeToRoom(roomId, onMessage){
    if(!isSocketConnected()){
        return;
    }

    return stompCLient.subscibe(
        `topic/room/${roomId}`,
        (message)=>{
            const payload = JSON.parse(message.body);
            onMessage(payload)
        }
    )
}