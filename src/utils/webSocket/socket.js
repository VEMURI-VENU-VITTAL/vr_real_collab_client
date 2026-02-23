import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { subscribeToRoom } from "./subscriptions";
import { audioWindowListeners } from "../audioSetup/audioListener";

let stompClient = null;
let isConnected = false;

export function connectWebSocket() {
  if (stompClient && isConnected) return stompClient;

  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS(import.meta.env.VITE_WEBSOCKET_BASE),

    reconnectDelay: 5000,

    debug: (str) => console.log("[WS]", str),

    onConnect: () => {
      console.log("WebSocket connected");
      isConnected = true;
        //listen to web socket
        subscribeToRoom(stompClient)

        //make audio web rtc connections
        audioWindowListeners()
    },

    onDisconnect: () => {
      console.log("WebSocket disconnected");
      isConnected = false;
    },

    onStompError: (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    }
  });

  stompClient.activate();
  return stompClient;
}

export function isSocketConnected(){
  if(!stompClient || !stompClient.connected){
    console.log("web socket not got connected!")
    return false;
  }
  return true;
}

export function getStompClient(){
  return stompClient;
}


