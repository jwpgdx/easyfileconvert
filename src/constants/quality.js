export const QUALITY_OPTIONS = {
  low: {
    label: "저용량",
    description: "작은 파일 크기, 낮은 품질",
    ffmpegArgs: ["-q:v", "30"],
  },
  standard: {
    label: "표준",
    description: "균형잡힌 품질과 크기",
    ffmpegArgs: ["-q:v", "75"],
  },
  high: {
    label: "고화질",
    description: "높은 품질, 큰 파일 크기",
    ffmpegArgs: ["-q:v", "95"],
  },
  lossless: {
    label: "무손실",
    description: "최고 품질, 매우 큰 파일 크기",
    ffmpegArgs: ["-lossless", "1"],
    warning: "용량이 매우 커질 수 있습니다",
  },
};

export const MAX_FILES = 20;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
