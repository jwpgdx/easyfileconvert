// 파일 타입 자동 감지 유틸리티
export const detectFileType = (file) => {
  const mimeType = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();

  // 비디오 파일
  if (
    mimeType.startsWith("video/") ||
    ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "m4v", "3gp"].includes(
      extension
    )
  ) {
    return "video";
  }

  // 이미지 파일
  if (
    mimeType.startsWith("image/") ||
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "tiff",
      "svg",
      "ico",
      "avif",
    ].includes(extension)
  ) {
    return "image";
  }

  // 오디오 파일
  if (
    mimeType.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma", "opus"].includes(
      extension
    )
  ) {
    return "audio";
  }

  return "unknown";
};

// 파일 타입별 지원 형식
export const SUPPORTED_FORMATS = {
  video: {
    input: ["mp4", "avi", "mov", "mkv", "webm", "flv", "wmv", "m4v", "3gp"],
    output: ["webp", "gif", "mp4", "avi", "mov", "mkv"],
  },
  image: {
    input: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg", "avif"],
    output: ["webp", "png", "jpg", "avif", "bmp", "tiff"],
  },
  audio: {
    input: ["mp3", "wav", "ogg", "aac", "flac", "m4a", "wma", "opus"],
    output: ["mp3", "wav", "ogg", "aac", "flac", "m4a"],
  },
};

// 파일 타입별 아이콘
export const FILE_TYPE_ICONS = {
  video: "🎬",
  image: "🖼️",
  audio: "🎵",
  unknown: "📄",
};

// 파일 타입별 기본 출력 형식
export const DEFAULT_OUTPUT_FORMAT = {
  video: "webp",
  image: "webp",
  audio: "mp3",
};
