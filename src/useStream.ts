import { useEffect } from "react";
import { useAtom } from "jotai";
import { activeStreamsAtom, BlockIdsAtom, BlockMapAtom } from "./atoms";

export function useStream() {
  const [activeStreams, setActiveStreams] = useAtom(activeStreamsAtom);

  useEffect(() => {
    const streamKeys = Object.keys(activeStreams);
    for (const key of streamKeys) {
      const activeStream = activeStreams[key];
      if (!activeStream) continue;
      if (!activeStream.refs)
        activeStream.refs = {
          video: null,
        };
      if (activeStream.stream && !activeStream.refs?.video) {
        activeStream.refs.video = document.createElement("video");
        activeStream.refs.video.style.position = "absolute";
        activeStream.refs.video.style.left = "0";
        activeStream.refs.video.style.top = "0";
        activeStream.refs.video.style.opacity = "0";
        activeStream.refs.video.style.pointerEvents = "none";
        activeStream.refs.video.autoplay = true;
        activeStream.refs.video.playsInline = true;
        activeStream.refs.video.muted = true;
        document.body.appendChild(activeStream.refs.video);
        activeStream.refs.video.onloadedmetadata = () => {
          const videoWidth = activeStream.refs.video!.videoWidth;
          const videoHeight = activeStream.refs.video!.videoHeight;
          setActiveStreams((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              videoSize: { width: videoWidth, height: videoHeight },
            },
          }));
        };
        activeStream.refs.video.srcObject = activeStream.stream;
      }
    }
  }, [activeStreams]);
}
