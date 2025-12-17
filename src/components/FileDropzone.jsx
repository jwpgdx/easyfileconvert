import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MAX_FILES, MAX_FILE_SIZE } from "../constants/quality.js";

export const FileDropzone = ({ onFilesAdded, hasFiles }) => {
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

      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
  });

  if (hasFiles) {
    return (
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-blue-400 bg-blue-500/10"
                : "border-slate-600 hover:border-slate-500"
            }
          `}
        >
          <input {...getInputProps()} />
          <p className="text-slate-400">
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
            ? "border-blue-400 bg-blue-500/10"
            : "border-slate-600 hover:border-slate-500"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="text-6xl mb-4">🎬</div>
      <h3 className="text-2xl font-semibold text-white mb-2">
        {isDragActive ? "파일을 여기에 놓으세요" : "비디오 파일을 선택하세요"}
      </h3>
      <p className="text-slate-400 mb-4">
        드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
      </p>
      <p className="text-sm text-slate-500">
        최대 {MAX_FILES}개 파일, 파일당 최대 {MAX_FILE_SIZE / (1024 * 1024)}MB
      </p>
      <p className="text-sm text-slate-500">
        지원 형식: MP4, AVI, MOV, MKV, WebM, FLV, WMV
      </p>
    </div>
  );
};
