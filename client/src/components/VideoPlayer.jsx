import { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://YOUR_PC_IP:5000");

export default function VideoPlayer() {
  const videoRef = useRef();

  useEffect(() => {
    const peer = new RTCPeerConnection();

    peer.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    socket.on("offer", async (offer) => {
      await peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      peer.addIceCandidate(candidate);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    });
  }, []);

  return <video ref={videoRef} autoPlay playsInline />;
}
