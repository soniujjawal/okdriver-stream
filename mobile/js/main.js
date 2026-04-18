const socket = io("http://YOUR_PC_IP:5000");

let peer;
let currentStream;
let facingMode = "environment";

const videoEl = document.getElementById("video");

function createPeer() {
  peer = new RTCPeerConnection();

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  socket.on("answer", async (answer) => {
    await peer.setRemoteDescription(answer);
  });

  socket.on("ice-candidate", (candidate) => {
    peer.addIceCandidate(candidate);
  });
}

async function startStream() {
  createPeer();

  currentStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
    audio: false,
  });

  videoEl.srcObject = currentStream;

  currentStream.getTracks().forEach((track) => {
    peer.addTrack(track, currentStream);
  });

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("offer", offer);
}

async function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";

  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
  });

  videoEl.srcObject = newStream;

  const videoTrack = newStream.getVideoTracks()[0];
  const sender = peer.getSenders().find(s => s.track.kind === "video");
  sender.replaceTrack(videoTrack);

  currentStream = newStream;
}

document.getElementById("start").onclick = startStream;
document.getElementById("toggleCamera").onclick = switchCamera;
