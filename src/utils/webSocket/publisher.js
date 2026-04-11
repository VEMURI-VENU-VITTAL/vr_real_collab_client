import { connectWebSocket, getStompClient, isSocketConnected } from "./socket";

let stompClient = connectWebSocket();

export function sendEvent(event) {
    const roomId = event.sessionId
    const destination=`/app/room/${roomId}/event`
    stompClient.publish({
      destination: destination,
      body: JSON.stringify(event)
    });
  
}