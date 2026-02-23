import { disableMic, enableMicAndRenegotiate, joinVoiceRoom, micOff, micOn } from "./setup";
import { connectWebSocket } from "../webSocket/socket";

export async function audioWindowListeners(){
    let isAudioOn = false
    let stompClient = await connectWebSocket();
    let roomId = sessionStorage.getItem("sessionId")
    let myUserId = sessionStorage.getItem("userId")
    let voiceSession = await joinVoiceRoom({
                    stompClient,
                    roomId,
                    myUserId,
                });

    window.addEventListener("keydown", async (e)=>{
        if(e.key.toLowerCase()=="m"){
            if(!isAudioOn){
                
                await enableMicAndRenegotiate()
                
                isAudioOn=true
            }
            else{
                if(voiceSession){
                    disableMic()
                    isAudioOn = false
                }
            }
        }
    })
}
