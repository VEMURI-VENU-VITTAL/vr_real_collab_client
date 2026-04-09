import { addStream } from "../../components/screen";
import { createVoiceAnalyser } from "./analyzer";

let stompClientGlobal, roomIdGlobal, myUserIdGlobal;
let isScreenSharing = false;
let screenStream;

// -------------------- CONFIG --------------------
const SIGNAL_SUB = (roomId) => `/topic/room/${roomId}/signal`;
const SIGNAL_PUB = (roomId) => `/app/room/${roomId}/signal`;

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

// -------------------- STATE --------------------
let localStream = null;

export const peers = new Map();

function isMessageRelevant(data){
  if(data.from==myUserIdGlobal || data.roomId!=roomIdGlobal){
    console.log("is relevant message: ", data)
    return false 
  }
  return true
}

function publishSignal(stompClient, roomId, payload){
  try{
    stompClient.publish({
      destination:SIGNAL_PUB(roomId),
      body:JSON.stringify(payload)
    })
  }
  catch(error){
    console.error(`roomd id: ${roomId}, While Sending a message in webrtc connection process there is an error:  ${error} while sending payload: ${payload}`)
  }
}

function createPeer(remoteUserId){
  const pc = new RTCPeerConnection(rtcConfig);
  const remoteStream = new MediaStream();

  // if(localStream){
  //   localStream.getTracks().forEach(track=>{
  //     pc.addTrack(track, localStream);
  //   });
  // }

  pc.ontrack = (event)=>{
    const track = event.track;

    if(remoteStream.getTracks().some(t=>t.id===track.id)) return;
    remoteStream.addTrack(track);

    if(track.kind==="video"){
      addStream(remoteStream);
    }

    if(track.kind==="audio"){
      let audio=document.getElementById("audio-"+remoteUserId);
      if(!audio){
        audio=document.createElement("audio");
        audio.autoplay=true;
        document.body.appendChild(audio);
      }
      audio.srcObject=remoteStream;
    }
    if(track.kind=="video"){
      console.log("screen sharing track")
    }
    const peer = peers.get(remoteUserId);

    if (peer && !peer.voice) {
      peer.voice = createVoiceAnalyser(remoteStream);
      peers.set(remoteUserId, peer); 
    }
  };

  pc.onicecandidate=(event)=>{
    if(event.candidate){
      publishSignal(stompClientGlobal, roomIdGlobal,{
        type:"ice",
        from:myUserIdGlobal,
        to:remoteUserId,
        candidate:event.candidate
      });
    }
  };

  const peerObj={pc,remoteUserId,remoteStream};
  peers.set(remoteUserId,peerObj);
  return peerObj;
}

function subscribeSignal(stompClient, roomId, userId){

  stompClient.subscribe(SIGNAL_SUB(roomId), async (msg)=>{

    const data = JSON.parse(msg.body);

    if(!isMessageRelevant(data)) return;

    const remoteUserId = data.from;
    let peer = peers.get(remoteUserId);
    if(!peer) peer = createPeer(remoteUserId);
    console.log("peer status: ", peers)
    switch(data.type){

      case "join":
        await sendOffer(peer);
        break;

      case "offer":
        await handleOffer(peer, data.sdp);
        break;

      case "answer":
        await peer.pc.setRemoteDescription(new RTCSessionDescription(data?.sdp));
        break;

      case "ice":
        if(data.candidate){
          await peer.pc.addIceCandidate(new RTCIceCandidate(data?.candidate));
        }
        break;
      case "leave":
       peer.pc.close();
       peers.delete(remoteUserId);

       document.getElementById("video-"+remoteUserId)?.remove();
       document.getElementById("audio-"+remoteUserId)?.remove();
       break;

    }

  });
}


export async function joinVoiceRoom(stompClient, roomId, userId){
  roomIdGlobal = roomId;
  myUserIdGlobal = userId;
  stompClientGlobal = stompClient

  //subscribe to the signal
  subscribeSignal(stompClient, roomId, userId)

  //Send Join Signal
  const joinPayload = {
    roomId: roomId,
    from: userId,
    type:"join",

  }
  publishSignal(stompClient, roomId, joinPayload)
}

export async function sendOffer(peer){

  const pc = peer.pc;

  if(!localStream){
    localStream = await navigator.mediaDevices.getUserMedia({audio:true});
  }

  localStream.getTracks().forEach(track=>{
    const alreadySending = pc.getSenders().some(
      sender => sender.track && sender.track.id === track.id
    );

    if(!alreadySending){
      pc.addTrack(track, localStream);
    }
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  publishSignal(stompClientGlobal, roomIdGlobal,{
    type:"offer",
    from:myUserIdGlobal,
    to:peer.remoteUserId,
    sdp:pc.localDescription
  });
}

async function handleOffer(peer, sdp){

  const pc = peer.pc;

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));

  if(!localStream){
    localStream = await navigator.mediaDevices.getUserMedia({audio:true});
  }

  localStream.getTracks().forEach(track=>{
    const alreadySending = pc.getSenders().some(
      sender => sender.track && sender.track.id === track.id
    );

    if(!alreadySending){
      pc.addTrack(track, localStream);
    }
  });

  await sendAnswer(peer)
}

export async function sendAnswer(peer){

  const pc = peer.pc;

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  publishSignal(stompClientGlobal, roomIdGlobal,{
    type:"answer",
    from:myUserIdGlobal,
    to:peer.remoteUserId,
    sdp:pc.localDescription
  });
}


export async function startScreenShare() {
  screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false
  });

  const screenTrack = screenStream.getVideoTracks()[0];

  //adding media track to the screen in the room
  addStream(screenStream);

  peers.forEach(peer => {
    let sender = peer.pc.getSenders().find(s => s.track?.kind === "video");
    console.log("sender for vedio: ", sender)
    if(sender){
      sender.replaceTrack(screenTrack);
    }else{
      console.log("sender for vedio inside: ", screenTrack)
      peer.pc.addTrack(screenTrack, screenStream);
      sendOffer(peer)
    }
  });

  screenTrack.onended = stopScreenShare;

  isScreenSharing = true;
}

export async function stopScreenShare() {
  if (!screenStream) return;

  screenStream.getTracks().forEach(t => t.stop());
  screenStream = null;
  isScreenSharing = false;
}

window.addEventListener("keydown", async (e) => {
  const isHost = sessionStorage.getItem("isHost")
  if(isHost){
  if (e.key.toLowerCase() === "p") {
      if (!isScreenSharing) {
        await startScreenShare();
      } else {
        await stopScreenShare();
      }
    }
  }
});

export async function leaveVoiceRoom() {
  console.log("Leaving room");

  // notify others
  publishSignal(stompClientGlobal, roomIdGlobal, {
    type: "leave",
    from: myUserIdGlobal,
    roomId: roomIdGlobal
  });

  // close peer connections
  peers.forEach(peer => {
    peer.pc.close();
  });
  peers.clear();

  // stop local media
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }

  // disconnect websocket
  if (stompClientGlobal?.active) {
    stompClientGlobal.deactivate();
  }
}

window.addEventListener("beforeunload", leaveVoiceRoom);
