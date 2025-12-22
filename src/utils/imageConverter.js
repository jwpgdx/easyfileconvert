// 이미지 변환 유틸리티 (Canvas API 사용)

export const convertImage = async (file, options, onProgress) => {
  return new Promise((resolve, reject) => {
    const { outputFormat, quality, resolution } = options;

    onProgress?.({ step: "이미지 로딩 중...", progress: 0 });

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      try {
        onProgress?.({ step: "이미지 처리 중...", progress: 30 });

        // 해상도 계산
        let { width, height } = calculateDimensions(img, resolution);

        canvas.width = width;
        canvas.height = height;

        onProgress?.({ step: "이미지 변환 중...", progress: 60 });

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        onProgress?.({ step: "파일 생성 중...", progress: 80 });

        // 출력 형식에 따른 변환
        const mimeType = getMimeType(outputFormat);
        const qualityValue = getQualityValue(outputFormat, quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              onProgress?.({ step: "변환 완료!", progress: 100 });
              resolve(blob);
            } else {
              reject(new Error("이미지 변환 실패"));
            }
          },
          mimeType,
          qualityValue
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("이미지 로딩 실패"));
    };

    // 이미지 로드 시작
    img.src = URL.createObjectURL(file);
  });
};

// 해상도 계산
const calculateDimensions = (img, resolution) => {
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  if (resolution === "original") {
    return { width: originalWidth, height: originalHeight };
  }

  // 미리 정의된 해상도
  const resolutionMap = {
    "4k": { width: 3840, height: 2160 },
    "2k": { width: 2560, height: 1440 },
    "1080p": { width: 1920, height: 1080 },
    "720p": { width: 1280, height: 720 },
    "480p": { width: 854, height: 480 },
  };

  if (resolutionMap[resolution]) {
    const target = resolutionMap[resolution];
    const aspectRatio = originalWidth / originalHeight;

    // 비율 유지하면서 크기 조정
    if (aspectRatio > target.width / target.height) {
      return {
        width: target.width,
        height: Math.round(target.width / aspectRatio),
      };
    } else {
      return {
        width: Math.round(target.height * aspectRatio),
        height: target.height,
      };
    }
  }

  return { width: originalWidth, height: originalHeight };
};

// MIME 타입 반환
const getMimeType = (format) => {
  const mimeTypes = {
    webp: "image/webp",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    avif: "image/avif",
    bmp: "image/bmp",
  };

  return mimeTypes[format] || "image/png";
};

// 품질 값 계산
const getQualityValue = (format, quality) => {
  // PNG는 품질 설정이 없음
  if (format === "png") {
    return undefined;
  }

  const qualityMap = {
    lossless: 1.0,
    maximum: 0.95,
    high: 0.85,
    standard: 0.75,
    compressed: 0.6,
  };

  return qualityMap[quality] || 0.75;
};

// 파일 확장자 반환
export const getFileExtension = (format) => {
  const extensions = {
    webp: "webp",
    png: "png",
    jpg: "jpg",
    jpeg: "jpg",
    avif: "avif",
    bmp: "bmp",
  };

  return extensions[format] || "png";
};
