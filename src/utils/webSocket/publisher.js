import { connectWebSocket, getStompClient, isSocketConnected } from "./socket";

let stompClient = connectWebSocket();

export function sendEvent(roomId, event) {
    stompClient.publish({
      destination: `/app/room/${roomId}/event`,
      body: JSON.stringify(event)
    });
  
}