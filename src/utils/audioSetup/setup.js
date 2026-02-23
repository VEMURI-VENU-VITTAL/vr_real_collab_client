import { createVoiceAnalyser } from "./analyzer";

let stompClientGlobal, roomIdGlobal, myUserIdGlobal;

// -------------------- CONFIG --------------------
const SIGNAL_SUB = (roomId) => `/topic/room/${roomId}/signal`;
const SIGNAL_PUB = (roomId) => `/app/room/${roomId}/signal`;

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Recommended for production:
    // { urls: "turn:your.turn.server:3478", username: "user", credential: "pass" }
  ],
};

// -------------------- STATE --------------------
let localStream = null;

// remoteUserId -> { pc, remoteStream, audioEl, pendingIce: RTCIceCandidateInit[] }
export const peers = new Map();

// -------------------- MIC CONTROL --------------------
export async function micOn() {
  if (localStream) return localStream;

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });

  return localStream;
}

export function micOff() {
  if (!localStream) return;
  localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
}

// -------------------- SIGNAL SEND --------------------
function sendSignal(stompClient, roomId, payload) {
  stompClient.publish({
    destination: SIGNAL_PUB(roomId),
    body: JSON.stringify(payload),
  });
}

// -------------------- AUDIO PLAYBACK --------------------
function attachRemoteAudio(remoteUserId, stream) {
  const peer = peers.get(remoteUserId);
  if (!peer) return;

  if (peer.audioEl) return; // already attached

  const audio = document.createElement("audio");
  audio.autoplay = true;
  audio.playsInline = true;
  audio.srcObject = stream;

  // optionally: keep DOM clean (or attach to a UI container)
  audio.setAttribute("data-remote-user", remoteUserId);
  document.body.appendChild(audio);

  peer.audioEl = audio;
}

// -------------------- PEER CONNECTION --------------------
function createPeer(remoteUserId, stompClient, roomId, myUserId) {
  const pc = new RTCPeerConnection(rtcConfig);

  const remoteStream = new MediaStream();

  // Add local mic tracks (send audio)
  if (localStream) {
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
  }

  

  // When remote sends track, collect it
  pc.ontrack = (event) => {
  const [incomingStream] = event.streams;

  // Add tracks only once (avoid duplicates)
  for (const t of incomingStream.getTracks()) {
    const alreadyAdded = remoteStream.getTracks().some(rt => rt.id === t.id);
    if (!alreadyAdded) remoteStream.addTrack(t);
  }

  attachRemoteAudio(remoteUserId, remoteStream);

  // Store analyser on the peer object (Map usage)
  const peer = peers.get(remoteUserId);
  console.log("inside for loop: ", peer)
  if (peer && peer?.voice==null) {
    
    peer.voice = createVoiceAnalyser(remoteStream);
  }
};

  // ICE candidates -> send via STOMP
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    sendSignal(stompClient, roomId, {
      roomId,
      from: myUserId,
      to: remoteUserId,
      type: "ice",
      candidate: event.candidate,
    });
  };

  pc.onconnectionstatechange = () => {
    const st = pc.connectionState;
    if (st === "failed" || st === "disconnected" || st === "closed") {
      cleanupPeer(remoteUserId);
    }
  };

  peers.set(remoteUserId, { pc, remoteStream, audioEl: null, pendingIce: [], voice:null });
  return peers.get(remoteUserId);
}

function cleanupPeer(remoteUserId) {
  const peer = peers.get(remoteUserId);
  if (!peer) return;

  try {
    peer.pc.close();
  } catch {}

  if (peer.audioEl && peer.audioEl.parentNode) {
    peer.audioEl.parentNode.removeChild(peer.audioEl);
  }

  peers.delete(remoteUserId);
}

// If ICE arrives before SDP is set, queue it
async function addIceSafely(peer, candidateInit) {
  const pc = peer.pc;
  if (pc.remoteDescription && pc.remoteDescription.type) {
    await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
  } else {
    peer.pendingIce.push(candidateInit);
  }
}

async function flushPendingIce(peer) {
  const pc = peer.pc;
  if (!(pc.remoteDescription && pc.remoteDescription.type)) return;
  for (const c of peer.pendingIce) {
    await pc.addIceCandidate(new RTCIceCandidate(c));
  }
  peer.pendingIce.length = 0;
}

//Call this once when user clicks "Enable Voice"
export async function joinVoiceRoom({ stompClient, roomId, myUserId }) {
  // await micOn();

  stompClientGlobal = stompClient;
  roomIdGlobal = roomId;
  myUserIdGlobal = myUserId;

 // Subscribe to signaling
  const subscription = stompClient.subscribe(SIGNAL_SUB(roomId), async (msg) => {
    let data;
    try {
      data = JSON.parse(msg.body);
    } catch {
      return;
    }

    // Basic filters
    if (data.roomId !== roomId) return;
    if (data.from === myUserId) return;
    if (data.to && data.to !== myUserId) return;

    const remoteUserId = data.from;

    // Ensure peer exists
    const peer =
      peers.get(remoteUserId) || createPeer(remoteUserId, stompClient, roomId, myUserId);

    // ---- JOIN: existing users send offer to the new joiner ----
    if (data.type === "join") {
  // Tie-breaker: only ONE side should create offers
  const iShouldOffer = String(myUserId) < String(remoteUserId);
  if (!iShouldOffer) return;

  // Only create an offer if we're stable
  if (peer.pc.signalingState !== "stable") {
    console.warn("Skip JOIN-offer; not stable:", peer.pc.signalingState, "peer:", remoteUserId);
    return;
  }

  const offer = await peer.pc.createOffer({ offerToReceiveAudio: true });
  await peer.pc.setLocalDescription(offer);

  sendSignal(stompClient, roomId, {
    roomId,
    from: myUserId,
    to: remoteUserId,
    type: "offer",
    sdp: peer.pc.localDescription,
  });
  return;
}

    // ---- OFFER: set remote offer and respond with answer ----
    if (data.type === "offer") {
      // If we already negotiated or are negotiating, ignore or handle glare
      if (peer.pc.signalingState !== "stable") {
        console.warn("Ignoring OFFER in state:", peer.pc.signalingState, "from:", remoteUserId);
        return;
      }

      // Apply remote offer
      await peer.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      await flushPendingIce(peer);

      //Only now we should be in have-remote-offer
      if (peer.pc.signalingState !== "have-remote-offer") {
        console.warn("Not in have-remote-offer after setRemoteDescription, state:", peer.pc.signalingState);
        return;
      }

      const answer = await peer.pc.createAnswer();
      await peer.pc.setLocalDescription(answer);

      sendSignal(stompClient, roomId, {
        roomId,
        from: myUserId,
        to: remoteUserId,
        type: "answer",
        sdp: peer.pc.localDescription,
      });
        return;
    }

    // ---- ANSWER: finalize negotiation ----
    if (data.type === "answer") {

      if (peer.pc.signalingState !== "have-local-offer") {
        console.warn(
          "Ignoring ANSWER in state:",
          peer.pc.signalingState,
          "from:",
          remoteUserId
        );
        return;
      }

      await peer.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      await flushPendingIce(peer);
      return;
    }

    // ---- ICE: add network candidate ----
    if (data.type === "ice") {
      try {
        await addIceSafely(peer, data.candidate);
      } catch (e) {
        console.warn("ICE add failed:", e);
      }
      return;
    }
  });

  // Announce join to room so existing users will offer to you
  sendSignal(stompClient, roomId, {
    roomId,
    from: myUserId,
    to: null,
    type: "join",
  });

  return {
    leave: () => {
      subscription?.unsubscribe?.();
      // close all peer connections
      for (const remoteUserId of peers.keys()) cleanupPeer(remoteUserId);
      micOff();
    },
  };
}

/**
 * Optional: mute/unmute without stopping mic stream
 */
export function setMuted(isMuted) {
  if (!localStream) return;
  localStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
}










export async function enableMicAndRenegotiate() {
  await micOn(); // permission popup first time

  for (const [remoteUserId, peer] of peers.entries()) {
    const pc = peer.pc;

    // 1) Add track if not already sending audio
    const alreadySending = pc.getSenders().some(
      (s) => s.track && s.track.kind === "audio"
    );

    if (!alreadySending) {
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
    }

    // 2) Only renegotiate if signaling state is stable
    // If not stable, you're in the middle of another negotiation → skip (or queue)
    if (pc.signalingState !== "stable") {
      console.warn(
        "Skip renegotiate; PC not stable:",
        pc.signalingState,
        "peer:",
        remoteUserId
      );
      continue;
    }

    // 3) Optional tie-breaker to avoid offer-glare during renegotiation
    // Only one side should be the "offerer"
    const iShouldOffer = String(myUserIdGlobal) < String(remoteUserId);
    if (!iShouldOffer) {
      // Let the other side initiate offers; we only added the track.
      // If you NEED instant talk even when you lose tie-breaker, tell me (we'll implement polite negotiation).
      continue;
    }

    // 4) Create + send offer
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    await pc.setLocalDescription(offer);

    sendSignal(stompClientGlobal, roomIdGlobal, {
      roomId: roomIdGlobal,
      from: myUserIdGlobal,
      to: remoteUserId,
      type: "offer",
      sdp: pc.localDescription,
    });
  }

  // finally unmute local track
  setMuted(false);
}

export function disableMic() {
  setMuted(true); 
}