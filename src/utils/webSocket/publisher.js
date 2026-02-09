import { getStompClient, isSocketConnected } from "./socket";

let stompClient = getStompClient();

export function sendEvent(roomId, event) {
  if (!isSocketConnected()) return;

  stompClient.publish({
    destination: `/app/room/${roomId}/event`,
    body: JSON.stringify(event)
  });
}