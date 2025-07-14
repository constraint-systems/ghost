import { atom } from "jotai";
import { ModeType, StateRefType } from "./types";

export const devicesAtom = atom<MediaDeviceInfo[]>([]);
export const selectedDeviceAtom = atom<string | null>(null);
export const videoSizeAtom = atom<{ width: number; height: number } | null>(
  null,
);
export const modeAtom = atom<ModeType>("difference");
export const startTimeAtom = atom<Date | null>(null);
export const currentTimeAtom = atom<Date | null>(null);
export const flippedHorizontallyAtom = atom(true);
export const flippedVerticallyAtom = atom(false);
export const showInfoModalAtom = atom(false);

const downloadCanvas = document.createElement("canvas");
const downloadCtx = downloadCanvas.getContext("2d")!;
document.body.appendChild(downloadCanvas);

const baseCanvas = document.createElement("canvas");
const baseCtx = baseCanvas.getContext("2d")!;
document.body.appendChild(baseCanvas);

const nowCanvas = document.createElement("canvas");
const nowCtx = nowCanvas.getContext("2d")!;
document.body.appendChild(nowCanvas);

export const stateRef: StateRefType = {
  devices: [],
  selectedDevice: null,
  videoSize: null,
  mode: "difference" as ModeType,
  startTime: null,
  currentTime: null,
  flippedHorizontally: true,
  flippedVertically: false,
  showInfoModal: false,
  isCapturing: false,
  baseCanvas,
  baseCtx,
  nowCanvas,
  nowCtx,
  downloadCanvas,
  downloadCtx,
};
