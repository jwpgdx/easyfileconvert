// 통합 변환 옵션 설정

// 비디오 변환 옵션 (기존 확장)
export const VIDEO_OPTIONS = {
  webp: {
    label: "WebP 애니메이션",
    description: "고효율 애니메이션 이미지",
    formats: ["webp"],
    qualities: {
      maximum: {
        label: "최고품질",
        ffmpegArgs: ["-q:v", "1"],
        description: "큰 용량, 최고 화질",
      },
      high: {
        label: "고품질",
        ffmpegArgs: ["-q:v", "10"],
        description: "균형잡힌 품질",
      },
      standard: {
        label: "표준",
        ffmpegArgs: ["-q:v", "25"],
        description: "적당한 용량과 품질",
      },
      compressed: {
        label: "압축",
        ffmpegArgs: ["-q:v", "40"],
        description: "작은 용량",
      },
    },
    resolutions: {
      original: { label: "원본 크기", args: [] },
      "1080p": { label: "1080p", args: ["-vf", "scale=1920:1080"] },
      "720p": { label: "720p", args: ["-vf", "scale=1280:720"] },
      "480p": { label: "480p", args: ["-vf", "scale=854:480"] },
      "360p": { label: "360p", args: ["-vf", "scale=640:360"] },
    },
  },
  gif: {
    label: "GIF 애니메이션",
    description: "호환성 좋은 애니메이션",
    formats: ["gif"],
    qualities: {
      high: {
        label: "고품질",
        ffmpegArgs: ["-vf", "palettegen"],
        description: "256색 최적화",
      },
      standard: { label: "표준", ffmpegArgs: [], description: "기본 품질" },
      compressed: {
        label: "압축",
        ffmpegArgs: ["-vf", "scale=iw/2:ih/2"],
        description: "크기 50% 축소",
      },
    },
  },
  mp4: {
    label: "MP4 비디오",
    description: "범용 비디오 형식",
    formats: ["mp4"],
    qualities: {
      high: {
        label: "고품질",
        ffmpegArgs: ["-c:v", "libx264", "-crf", "18"],
        description: "H.264 고품질",
      },
      standard: {
        label: "표준",
        ffmpegArgs: ["-c:v", "libx264", "-crf", "23"],
        description: "H.264 표준",
      },
      compressed: {
        label: "압축",
        ffmpegArgs: ["-c:v", "libx264", "-crf", "28"],
        description: "H.264 압축",
      },
    },
  },
};

// 이미지 변환 옵션
export const IMAGE_OPTIONS = {
  webp: {
    label: "WebP",
    description: "고효율 이미지 형식",
    formats: ["webp"],
    qualities: {
      lossless: {
        label: "무손실",
        quality: 100,
        lossless: true,
        description: "원본과 동일한 품질",
      },
      maximum: {
        label: "최고품질",
        quality: 95,
        description: "거의 무손실 수준",
      },
      high: {
        label: "고품질",
        quality: 85,
        description: "높은 품질, 적당한 압축",
      },
      standard: {
        label: "표준",
        quality: 75,
        description: "균형잡힌 품질과 용량",
      },
      compressed: { label: "압축", quality: 60, description: "작은 용량" },
    },
    resolutions: {
      original: { label: "원본 크기", scale: 1 },
      "4k": { label: "4K (3840x2160)", width: 3840, height: 2160 },
      "2k": { label: "2K (2560x1440)", width: 2560, height: 1440 },
      "1080p": { label: "1080p (1920x1080)", width: 1920, height: 1080 },
      "720p": { label: "720p (1280x720)", width: 1280, height: 720 },
      "480p": { label: "480p (854x480)", width: 854, height: 480 },
    },
  },
  png: {
    label: "PNG",
    description: "무손실 이미지, 투명 지원",
    formats: ["png"],
    qualities: {
      maximum: { label: "최고품질", compression: 0, description: "무압축" },
      high: { label: "고품질", compression: 3, description: "약간 압축" },
      standard: { label: "표준", compression: 6, description: "기본 압축" },
      compressed: { label: "압축", compression: 9, description: "최대 압축" },
    },
  },
  jpg: {
    label: "JPG/JPEG",
    description: "범용 이미지 형식",
    formats: ["jpg", "jpeg"],
    qualities: {
      maximum: { label: "최고품질", quality: 95, description: "거의 무손실" },
      high: { label: "고품질", quality: 85, description: "높은 품질" },
      standard: { label: "표준", quality: 75, description: "웹 표준 품질" },
      compressed: { label: "압축", quality: 60, description: "작은 용량" },
    },
  },
  avif: {
    label: "AVIF",
    description: "차세대 이미지 형식",
    formats: ["avif"],
    qualities: {
      maximum: {
        label: "최고품질",
        quality: 95,
        description: "WebP보다 30% 작음",
      },
      high: { label: "고품질", quality: 85, description: "뛰어난 압축률" },
      standard: { label: "표준", quality: 75, description: "균형잡힌 품질" },
    },
  },
};

// 오디오 변환 옵션 (향후 확장용)
export const AUDIO_OPTIONS = {
  mp3: {
    label: "MP3",
    description: "범용 오디오 형식",
    formats: ["mp3"],
    qualities: {
      high: { label: "320kbps", bitrate: "320k", description: "CD 품질" },
      standard: { label: "192kbps", bitrate: "192k", description: "표준 품질" },
      compressed: {
        label: "128kbps",
        bitrate: "128k",
        description: "압축 품질",
      },
    },
  },
};

// 파일 타입별 기본 설정
export const DEFAULT_SETTINGS = {
  video: {
    outputFormat: "webp",
    quality: "standard",
    resolution: "original",
  },
  image: {
    outputFormat: "webp",
    quality: "standard",
    resolution: "original",
  },
  audio: {
    outputFormat: "mp3",
    quality: "standard",
  },
};
