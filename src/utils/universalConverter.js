// 통합 변환 유틸리티
import { convertToWebP } from "./ffmpeg.js";
import { convertImage, getFileExtension } from "./imageConverter.js";
import { detectFileType } from "./fileDetector.js";
import {
  VIDEO_OPTIONS,
  IMAGE_OPTIONS,
} from "../constants/conversionOptions.js";

export const convertFile = async (file, settings, onProgress) => {
  const fileType = detectFileType(file);

  switch (fileType) {
    case "video":
      return await convertVideo(file, settings, onProgress);
    case "image":
      return await convertImage(file, settings, onProgress);
    case "audio":
      // TODO: 오디오 변환 구현
      throw new Error("오디오 변환은 아직 지원되지 않습니다.");
    default:
      throw new Error("지원하지 않는 파일 형식입니다.");
  }
};

// 비디오 변환 (기존 로직 확장)
const convertVideo = async (file, settings, onProgress) => {
  const { outputFormat, quality, resolution } = settings;

  if (outputFormat === "webp") {
    // 기존 WebP 변환 로직 사용
    const videoOptions = VIDEO_OPTIONS.webp;
    const qualityArgs = videoOptions.qualities[quality]?.ffmpegArgs || [];
    const resolutionArgs = videoOptions.resolutions[resolution]?.args || [];

    const combinedArgs = [...qualityArgs, ...resolutionArgs];

    return await convertToWebP(file, combinedArgs, (progressData) => {
      onProgress?.({
        step: progressData?.step || "처리 중...",
        progress: progressData?.progress || 0,
        currentFrame: progressData?.currentFrame,
        totalFrames: progressData?.totalFrames,
        frameInfo: progressData?.frameInfo,
      });
    });
  } else {
    // 다른 비디오 형식 변환 (향후 FFmpeg.wasm 확장)
    throw new Error(`${outputFormat} 형식은 아직 지원되지 않습니다.`);
  }
};

// 출력 파일명 생성
export const generateOutputFilename = (originalFile, settings) => {
  const fileType = detectFileType(originalFile);
  const baseName = originalFile.name.split(".").slice(0, -1).join(".");

  let extension;

  if (fileType === "video") {
    extension =
      settings.outputFormat === "webp" ? "webp" : settings.outputFormat;
  } else if (fileType === "image") {
    extension = getFileExtension(settings.outputFormat);
  } else if (fileType === "audio") {
    extension = settings.outputFormat;
  }

  return `${baseName}.${extension}`;
};

// 변환 설정 검증
export const validateSettings = (fileType, settings) => {
  const options =
    fileType === "video"
      ? VIDEO_OPTIONS
      : fileType === "image"
      ? IMAGE_OPTIONS
      : {};

  const formatOptions = options[settings.outputFormat];
  if (!formatOptions) {
    return { valid: false, error: "지원하지 않는 출력 형식입니다." };
  }

  if (!formatOptions.qualities[settings.quality]) {
    return { valid: false, error: "지원하지 않는 품질 설정입니다." };
  }

  return { valid: true };
};
