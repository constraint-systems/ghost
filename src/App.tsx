import { useAtom } from "jotai";
import {
  currentTimeAtom,
  devicesAtom,
  flippedHorizontallyAtom,
  flippedVerticallyAtom,
  modeAtom,
  selectedDeviceAtom,
  showDownloadModalAtom,
  showInfoModalAtom,
  startTimeAtom,
  videoSizeAtom,
  zoomAtom,
} from "./atoms";
import { useEffect, useRef } from "react";
import { useDevices } from "./useDevices";
import { ModeType } from "./types";
import { formatDate } from "./utils";
import { stateRef } from "./atoms";

export function App() {
  useDevices();
  useKeyboard();
  useRefUpdater();
  const [zoom] = useAtom(zoomAtom);
  const [showInfoModal] = useAtom(showInfoModalAtom);
  const [showDownloadModal] = useAtom(showDownloadModalAtom);

  return (
    <div className="w-full relative h-[100dvh] flex flex-col overflow-hidden">
      <TopBar />
      <div
        className="grow"
        style={{
          position: zoom ? undefined : "relative",
        }}
      >
        <Canvas />
      </div>
      <div>
        <Timestamps />
        <Toolbar />
      </div>
      {showInfoModal && <InfoModal />}
      {showDownloadModal && <DownloadModal />}
    </div>
  );
}

export default App;

function Timestamps() {
  const [startTime] = useAtom(startTimeAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex relative gap-[1ch] justify-center text-neutral-500 pt-[1ch] pb-[0.5ch] w-full px-[1ch]">
      {startTime && currentTime && (
        <>
          <div>{startTime ? formatDate(startTime) : null}</div>
          <div>&mdash;</div>
          <div>{currentTime ? formatDate(currentTime) : null}</div>
        </>
      )}
    </div>
  );
}

function TopBar() {
  const [devices] = useAtom(devicesAtom);
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [flippedHorizontally, setFlippedHorizontally] = useAtom(
    flippedHorizontallyAtom,
  );
  const [flippedVertically, setFlippedVertically] = useAtom(
    flippedVerticallyAtom,
  );
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);

  return (
    <div className="flex z-50 select-none relative select-none justify-center pt-[2ch] pb-[1ch] gap-[2ch]">
      <div className="w-[16ch] flex items-center">
        {devices.length === 1 ? (
          <div
            className="h-[4ch] px-[1ch] w-full flex items-center text-green-500"
            key={devices[0].deviceId}
          >
            <div>{devices[0].label.split("(")[0] || "Camera"}</div>
          </div>
        ) : (
          <DeviceSelector />
        )}
      </div>
      <div className="flex gap-px px-px py-px text-center bg-blue-600">
        <button
          className={`w-[4ch] h-[4ch] ${zoom ? "bg-blue-600 text-black hover:bg-blue-500" : "bg-black text-blue-500 hover:bg-blue-500 hover:text-black"}`}
          onPointerDown={() => {
            setZoom(!zoom);
          }}
        >
          ✧
        </button>

        <button
          className={`w-[4ch] h-[4ch] ${flippedHorizontally ? "bg-blue-600 text-black hover:bg-blue-500" : "bg-black text-blue-500 hover:bg-blue-500 hover:text-black"}`}
          onPointerDown={() => {
            setFlippedHorizontally(!flippedHorizontally);
          }}
        >
          ▷
        </button>
        <button
          className={`w-[4ch] h-[4ch] ${flippedVertically ? "bg-blue-600 text-black hover:bg-blue-500" : "bg-black text-blue-500 hover:bg-blue-500 hover:text-black"}`}
          onPointerDown={() => {
            setFlippedVertically(!flippedVertically);
          }}
        >
          ▽
        </button>
      </div>
      <button
        className="w-[4ch] h-[4ch] bg-neutral-950 text-yellow-500 border-yellow-600 hover border rounded-full hover:bg-yellow-500 hover:text-black"
        onPointerDown={() => {
          setShowInfoModal((prev) => !prev);
        }}
      >
        i
      </button>
    </div>
  );
}

function DeviceSelector() {
  const [devices] = useAtom(devicesAtom);
  const [selectedDevice, setSelectedDevice] = useAtom(selectedDeviceAtom);

  return (
    <select
      className="h-[4ch] px-[1ch] w-full bg-neutral-950 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black"
      value={selectedDevice || ""}
      onChange={(e) => {
        localStorage.setItem("selectedDevice", e.target.value);
        setSelectedDevice(e.target.value);
      }}
    >
      {devices.map((device) => (
        <option
          key={device.deviceId}
          value={device.deviceId}
          className="bg-neutral-950 text-green-500 hover:bg-green-500 hover:text-black"
        >
          {device.label.split("(")[0] || "Camera"}
        </option>
      ))}
    </select>
  );
}

function useDrawBase() {
  const [, setStartTime] = useAtom(startTimeAtom);

  return function drawBase() {
    const baseCtx = stateRef.baseCtx;
    const videoSize = stateRef.videoSize;
    const $video = document.getElementById("webcam-video") as HTMLVideoElement;
    if ($video && $video.srcObject && videoSize) {
      setStartTime(new Date());

      if (stateRef.flippedHorizontally || stateRef.flippedVertically) {
        baseCtx.save();
      }
      if (stateRef.flippedHorizontally && stateRef.flippedVertically) {
        baseCtx.setTransform(-1, 0, 0, -1, videoSize.width, videoSize.height);
      } else if (stateRef.flippedHorizontally) {
        baseCtx.setTransform(-1, 0, 0, 1, videoSize.width, 0);
      } else if (stateRef.flippedVertically) {
        baseCtx.setTransform(1, 0, 0, -1, 0, videoSize.height);
      }
      baseCtx.drawImage($video, 0, 0, videoSize.width, videoSize.height);
      if (stateRef.flippedHorizontally || stateRef.flippedVertically) {
        baseCtx.restore();
      }
    }
  };
}

function useCaptureDownload() {
  return function captureDownload() {
    // stateRef.isCapturing = true;
    // const link = document.createElement("a");
    const renderCanvas = document.getElementById(
      "render-canvas",
    ) as HTMLCanvasElement;
    if (!renderCanvas) return;
    stateRef.downloadCtx.drawImage(renderCanvas, 0, 0);
    // link.download = `ghost-${new Date().toISOString()}.png`;
    // link.href = stateRef.downloadCanvas.toDataURL("image/jpg");
    // link.click();
    // setTimeout(() => {
    //   stateRef.isCapturing = false;
    // }, 1000); // Allow some time for the download to complete
  };
}

function Toolbar() {
  const drawBase = useDrawBase();
  const captureDownload = useCaptureDownload();
  const [, setShowDownloadModal] = useAtom(showDownloadModalAtom);

  return (
    <div className="flex relative justify-center select-none items-center gap-[3ch] px-[1ch] pb-[3ch] pt-[1ch]">
      <button
        className="h-[6ch] w-[6ch] bg-green-600 text-black hover:bg-green-500 rounded-full"
        onClick={() => {
          drawBase();
        }}
      >
        =
      </button>
      <ModeChooser />
      <button
        className="h-[6ch] w-[6ch] bg-purple-600 text-black hover:bg-purple-500"
        onPointerDown={() => {
          captureDownload();
          setShowDownloadModal((prev) => !prev);
        }}
      >
        ↓
      </button>
    </div>
  );
}

function ModeChooser() {
  const [mode, setMode] = useAtom(modeAtom);

  return (
    <div className="flex gap-px px-px py-px bg-blue-600">
      {[
        ["multiply", "M"],
        ["difference", "D"],
        ["screen", "S"],
      ].map(([itemMode, itemLabel]) => (
        <button
          key={itemMode}
          className={`w-[5ch] h-[5ch] ${mode === itemMode ? "bg-blue-600 text-neutral-950" : "bg-neutral-950 text-blue-500 hover:bg-blue-500 hover:text-neutral-950"}`}
          onPointerDown={() => setMode(itemMode as ModeType)}
        >
          {itemLabel}
        </button>
      ))}
    </div>
  );
}

function Canvas() {
  const [videoSize] = useAtom(videoSizeAtom);
  const [mode] = useAtom(modeAtom);
  const [flippedHorizontally] = useAtom(flippedHorizontallyAtom);
  const [flippedVertically] = useAtom(flippedVerticallyAtom);
  const [zoom] = useAtom(zoomAtom);
  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawBase = useDrawBase();

  const modeRef = useRef<string | null>(mode);
  modeRef.current = mode;
  const flippedHorizontallyRef = useRef(flippedHorizontally);
  flippedHorizontallyRef.current = flippedHorizontally;
  const flippedVerticallyRef = useRef(flippedVertically);
  flippedVerticallyRef.current = flippedVertically;

  useEffect(() => {
    const renderCanvas = renderCanvasRef.current;
    if (!renderCanvas || !videoSize) return;

    const baseCanvas = stateRef.baseCanvas;
    const nowCanvas = stateRef.nowCanvas;
    const downloadCanvas = stateRef.downloadCanvas;
    const nowCtx = stateRef.nowCtx;

    baseCanvas.width = videoSize.width;
    baseCanvas.height = videoSize.height;
    nowCanvas.width = videoSize.width;
    nowCanvas.height = videoSize.height;
    downloadCanvas.width = videoSize.width;
    downloadCanvas.height = videoSize.height;
    renderCanvas.width = videoSize.width;
    renderCanvas.height = videoSize.height;

    const ctx = renderCanvas.getContext("2d");

    const $video = document.getElementById("webcam-video") as HTMLVideoElement;

    setTimeout(() => {
      drawBase();
    }, 0);

    function drawVideo() {
      if (stateRef.isCapturing) {
        requestAnimationFrame(drawVideo);
        return;
      }

      if (flippedHorizontallyRef.current || flippedVerticallyRef.current) {
        nowCtx.save();
      }
      if (flippedHorizontallyRef.current && flippedVerticallyRef.current) {
        nowCtx.setTransform(-1, 0, 0, -1, videoSize!.width, videoSize!.height);
      } else if (flippedHorizontallyRef.current) {
        nowCtx.setTransform(-1, 0, 0, 1, videoSize!.width, 0);
      } else if (flippedVerticallyRef.current) {
        nowCtx.setTransform(1, 0, 0, -1, 0, videoSize!.height);
      }
      nowCtx!.drawImage($video, 0, 0, videoSize!.width, videoSize!.height);
      if (flippedHorizontallyRef.current || flippedVerticallyRef.current) {
        nowCtx.restore();
      }

      ctx!.globalCompositeOperation = "source-over";
      ctx!.drawImage(baseCanvas, 0, 0, videoSize!.width, videoSize!.height);
      ctx!.globalCompositeOperation = modeRef.current as ModeType;
      ctx!.drawImage(nowCanvas, 0, 0, videoSize!.width, videoSize!.height);
      requestAnimationFrame(drawVideo);
    }
    drawVideo();
  }, [videoSize]);

  return videoSize ? (
    <canvas
      ref={renderCanvasRef}
      id="render-canvas"
      className="absolute top-0 left-0 w-full h-full"
      style={{
        objectFit: zoom ? "cover" : "contain",
      }}
      width={videoSize.width}
      height={videoSize.height}
    />
  ) : null;
}

function InfoModal() {
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex pointer-events-none items-center justify-center">
      <div className="bg-neutral-950 w-full max-w-[50ch] pointer-events-auto border border-yellow-500 px-[2ch] py-[0.5lh] bg-opacity-90">
        <div className="flex mb-[0.5ch] justify-between">
          <div className="text-yellow-500">ABOUT</div>
          <button
            className="text-yellow-500 px-[1ch] hover:bg-yellow-500 hover:text-black"
            onClick={() => {
              setShowInfoModal(false);
            }}
          >
            X
          </button>
        </div>
        <div className="mb-[0.5lh]">
          Ghost shows a live blend of{" "}
          <span className="bg-green-600 text-black">your current camera</span>{" "}
          and the <span className="bg-green-600 text-black">start frame</span>.
          Try the <span className="bg-blue-600 text-black">multiply</span>,{" "}
          <span className="bg-blue-600 text-black">difference</span>, and{" "}
          <span className="bg-blue-600 text-black">screen</span> blends.{" "}
          <span className="bg-purple-600 text-black">Download</span> the result.
        </div>
        <div className="mb-[0.5lh]">
          A{" "}
          <a
            href="https://constraint.systems"
            target="_blank"
            className="text-orange-500 underline"
          >
            Constraint Systems
          </a>{" "}
          project.
        </div>
        <div className="mb-0">
          Use of difference for motion extration inspired by{" "}
          <a
            href="https://www.youtube.com/watch?v=NSS6yAMZF78"
            target="_blank"
            className="text-yellow-500 underline"
          >
            Posy's video
          </a>
          .
        </div>
      </div>
    </div>
  );
}

function DownloadModal() {
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);
  const [, setShowDownloadModal] = useAtom(showDownloadModalAtom);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoSize] = useAtom(videoSizeAtom);

  useEffect(() => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas || !videoSize) return;

    const previewCtx = previewCanvas.getContext("2d");
    previewCanvas.width = videoSize.width;
    previewCanvas.height = videoSize.height;

    previewCtx!.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    const downloadCanvas = stateRef.downloadCanvas;
    if (downloadCanvas) {
      previewCtx!.drawImage(
        downloadCanvas,
        0,
        0,
        videoSize.width,
        videoSize.height,
      );
    }
  }, [videoSize]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          setShowInfoModal(false);
          setShowDownloadModal(false);
        }
      }}
    >
      <div
        className="bg-neutral-950 w-full pointer-events-auto border border-purple-500 px-[2ch] py-[0.5lh] bg-opacity-90"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex mb-[0.5ch] justify-between">
          <div className="text-purple-500">DOWNLOAD</div>
          <button
            className="text-purple-500 px-[1ch] hover:bg-purple-500 hover:text-black"
            onClick={() => {
              setShowDownloadModal(false);
            }}
          >
            X
          </button>
        </div>
        <canvas
          ref={previewCanvasRef}
          id="download-canvas"
          className="w-full mb-[0.5lh]"
          width={videoSize!.width}
          height={videoSize!.height}
        />
        <div className="flex mb-[0.5ch] justify-center gap-[1ch]">
          <button
            className="text-purple-500 h-[4ch] px-[1ch] hover:bg-purple-500 hover:text-black"
            onClick={() => {
              setShowDownloadModal(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-purple-600 h-[4ch] px-[1ch] hover:bg-purple-500 text-black"
            onClick={() => {
              const link = document.createElement("a");
              link.download = `ghost-${new Date().toISOString()}.png`;
              link.href = stateRef.downloadCanvas.toDataURL("image/png");
              link.click();
              setShowDownloadModal(false);
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function useKeyboard() {
  const [, setShowInfoModal] = useAtom(showInfoModalAtom);
  const [flippedHorizontally, setFlippedHorizontally] = useAtom(
    flippedHorizontallyAtom,
  );
  const [flippedVertically, setFlippedVertically] = useAtom(
    flippedVerticallyAtom,
  );
  const [devices] = useAtom(devicesAtom);
  const [selectedDevice, setSelectedDevice] = useAtom(selectedDeviceAtom);
  const [, setMode] = useAtom(modeAtom);
  const captureDownload = useCaptureDownload();
  const [showDownloadModal, setShowDownloadModal] = useAtom(
    showDownloadModalAtom,
  );
  const drawBase = useDrawBase();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "i") {
        setShowInfoModal((prev) => !prev);
      } else if (event.key === "Escape") {
        setShowInfoModal(false);
        setShowDownloadModal(false);
      } else if (event.key === "h") {
        setFlippedHorizontally(!flippedHorizontally);
      } else if (event.key === "v") {
        setFlippedVertically(!flippedVertically);
      } else if (event.key === " ") {
        drawBase();
      } else if (event.key === "Enter") {
        captureDownload();
        if (showDownloadModal) {
          const link = document.createElement("a");
          link.download = `ghost-${new Date().toISOString()}.png`;
          link.href = stateRef.downloadCanvas.toDataURL("image/png");
          link.click();
          setShowDownloadModal(false);
        } else {
          setShowDownloadModal((prev) => !prev);
        }
      } else if (event.key === "m") {
        setMode("multiply");
      } else if (event.key === "d") {
        setMode("difference");
      } else if (event.key === "s") {
        setMode("screen");
      } else if (event.key === "c") {
        if (devices.length > 1) {
          const currentIndex = devices.findIndex(
            (device) => device.deviceId === selectedDevice,
          );
          const nextIndex = (currentIndex + 1) % devices.length;
          const id = devices[nextIndex].deviceId;
          localStorage.setItem("selectedDevice", id);
          setSelectedDevice(id);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    setShowInfoModal,
    flippedHorizontally,
    flippedVertically,
    showDownloadModal,
    devices,
    selectedDevice,
    setSelectedDevice,
  ]);
}

function useRefUpdater() {
  const [devices] = useAtom(devicesAtom);
  const [selectedDevice] = useAtom(selectedDeviceAtom);
  const [videoSize] = useAtom(videoSizeAtom);
  const [mode] = useAtom(modeAtom);
  const [startTime] = useAtom(startTimeAtom);
  const [currentTime] = useAtom(currentTimeAtom);
  const [flippedHorizontally] = useAtom(flippedHorizontallyAtom);
  const [flippedVertically] = useAtom(flippedVerticallyAtom);
  const [showInfoModal] = useAtom(showInfoModalAtom);
  const [zoom] = useAtom(zoomAtom);
  const [showDownloadModal] = useAtom(showDownloadModalAtom);

  useEffect(() => {
    stateRef.devices = devices;
    stateRef.selectedDevice = selectedDevice;
    stateRef.videoSize = videoSize;
    stateRef.mode = mode;
    stateRef.startTime = startTime;
    stateRef.currentTime = currentTime;
    stateRef.flippedHorizontally = flippedHorizontally;
    stateRef.flippedVertically = flippedVertically;
    stateRef.showInfoModal = showInfoModal;
    stateRef.zoom = zoom;
    stateRef.showDownloadModal = showDownloadModal;
  }, [
    devices,
    selectedDevice,
    videoSize,
    mode,
    startTime,
    currentTime,
    flippedHorizontally,
    flippedVertically,
    showInfoModal,
    showDownloadModal,
    zoom,
  ]);
}
