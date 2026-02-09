const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});

// Add screen tracks
export const addScreenTracks=(screenStream)=>{
    screenStream.getTracks().forEach(track => {
    pc.addTrack(track, screenStream);
    });
}