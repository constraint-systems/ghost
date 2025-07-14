export type SizeType = {
  width: number;
  height: number;
};

export type ModeType = "multiply" | "difference" | "screen";

export type StateRefType = {
  devices: MediaDeviceInfo[];
  selectedDevice: string | null;
  videoSize: SizeType | null;
  mode: ModeType;
  startTime: Date | null;
  currentTime: Date | null;
  flippedHorizontally: boolean;
  flippedVertically: boolean;
  showInfoModal: boolean;
  isCapturing: boolean;
  baseCanvas: HTMLCanvasElement;
  baseCtx: CanvasRenderingContext2D;
  nowCanvas: HTMLCanvasElement;
  nowCtx: CanvasRenderingContext2D;
  downloadCanvas: HTMLCanvasElement;
  downloadCtx: CanvasRenderingContext2D;
  zoom: boolean;
  showDownloadModal: boolean;
}
