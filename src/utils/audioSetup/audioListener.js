import {joinVoiceRoom } from "./setup";

export async function audioWindowListeners(stompClient){
    let isAudioOn = false
    let roomId = sessionStorage.getItem("sessionId")
    let myUserId = sessionStorage.getItem("userId")
    let voiceSession = await joinVoiceRoom(
                    stompClient,
                    roomId,
                    myUserId,
                );

    // window.addEventListener("keydown", async (e)=>{
    //     if(e.key.toLowerCase()=="m"){
    //         if(!isAudioOn){
                
    //             await enableMicAndRenegotiate()
                
    //             isAudioOn=true
    //         }
    //         else{
    //             if(voiceSession){
    //                 disableMic()
    //                 isAudioOn = false
    //             }
    //         }
    //     }
    // })
}
