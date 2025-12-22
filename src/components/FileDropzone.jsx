import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MAX_FILES, MAX_FILE_SIZE } from "../constants/quality.js";
import { detectFileType, FILE_TYPE_ICONS } from "../utils/fileDetector.js";

export const FileDropzone = ({
  onFilesAdded,
  hasFiles,
  acceptedFileTypes = ["video", "image", "audio"],
}) => {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles
          .map(({ errors }) => errors[0]?.message)
          .join(", ");
        alert(`파일 업로드 실패: ${errors}`);
        return;
      }

      if (acceptedFiles.length > MAX_FILES) {
        alert(`최대 ${MAX_FILES}개의 파일만 업로드할 수 있습니다.`);
        return;
      }

      // 파일 타입 검증
      const validFiles = acceptedFiles.filter((file) => {
        const fileType = detectFileType(file);
        return acceptedFileTypes.includes(fileType);
      });

      if (validFiles.length !== acceptedFiles.length) {
        alert("지원하지 않는 파일 형식이 포함되어 있습니다.");
      }

      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded, acceptedFileTypes]
  );

  // 동적으로 accept 속성 생성
  const getAcceptTypes = () => {
    const acceptTypes = {};

    if (acceptedFileTypes.includes("video")) {
      acceptTypes["video/*"] = [
        ".mp4",
        ".avi",
        ".mov",
        ".mkv",
        ".webm",
        ".flv",
        ".wmv",
        ".m4v",
        ".3gp",
      ];
    }

    if (acceptedFileTypes.includes("image")) {
      acceptTypes["image/*"] = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tiff",
        ".svg",
        ".avif",
      ];
    }

    if (acceptedFileTypes.includes("audio")) {
      acceptTypes["audio/*"] = [
        ".mp3",
        ".wav",
        ".ogg",
        ".aac",
        ".flac",
        ".m4a",
        ".wma",
        ".opus",
      ];
    }

    return acceptTypes;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptTypes(),
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  });

  // 지원 형식 텍스트 생성
  const getSupportedFormatsText = () => {
    const formats = [];
    if (acceptedFileTypes.includes("video"))
      formats.push("비디오 (MP4, AVI, MOV 등)");
    if (acceptedFileTypes.includes("image"))
      formats.push("이미지 (JPG, PNG, WebP 등)");
    if (acceptedFileTypes.includes("audio"))
      formats.push("오디오 (MP3, WAV, OGG 등)");
    return formats.join(", ");
  };

  // 아이콘 표시
  const getDisplayIcon = () => {
    if (acceptedFileTypes.length === 1) {
      return FILE_TYPE_ICONS[acceptedFileTypes[0]];
    }
    return "📁"; // 여러 타입 지원시 폴더 아이콘
  };

  if (hasFiles) {
    return (
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground"
            }
          `}
        >
          <input {...getInputProps()} />
          <p className="text-muted-foreground">
            {isDragActive
              ? "파일을 여기에 놓으세요..."
              : "추가 파일을 드래그하거나 클릭하여 선택하세요"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors mb-8
        ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-border hover:border-muted-foreground"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="text-6xl mb-4">{getDisplayIcon()}</div>
      <h3 className="text-2xl font-semibold text-foreground mb-2">
        {isDragActive ? "파일을 여기에 놓으세요" : "파일을 선택하세요"}
      </h3>
      <p className="text-muted-foreground mb-4">
        드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
      </p>
      <p className="text-sm text-muted-foreground">
        최대 {MAX_FILES}개 파일, 파일당 최대 {MAX_FILE_SIZE / (1024 * 1024)}MB
      </p>
      <p className="text-sm text-muted-foreground">
        지원 형식: {getSupportedFormatsText()}
      </p>
    </div>
  );
};
