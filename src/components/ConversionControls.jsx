import React from "react";
import { downloadAllAsZip } from "../utils/download.js";

export const ConversionControls = ({
  files,
  isConverting,
  onStartConversion,
  onClearAll,
}) => {
  const completedFiles = files.filter((f) => f.status === "COMPLETED");
  const idleFiles = files.filter(
    (f) => f.status === "IDLE" || f.status === "ERROR"
  );
  const processingFiles = files.filter(
    (f) => f.status === "PROCESSING" || f.status === "READY"
  );
  const allCompleted =
    files.length > 0 && files.every((f) => f.status === "COMPLETED");

  const handleZipDownload = () => {
    downloadAllAsZip(files);
  };

  const getStartButtonText = () => {
    if (isConverting) return "변환 중...";
    if (idleFiles.length > 0) return `변환 시작 (${idleFiles.length}개 파일)`;
    if (processingFiles.length > 0) return "변환 진행 중";
    return "변환할 파일 없음";
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mb-8">
      {files.length > 0 && (
        <button
          onClick={onStartConversion}
          disabled={isConverting || idleFiles.length === 0}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {getStartButtonText()}
        </button>
      )}

      {allCompleted && (
        <button
          onClick={handleZipDownload}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          ZIP으로 모두 다운로드 ({completedFiles.length}개)
        </button>
      )}

      {files.length > 0 && !isConverting && (
        <button
          onClick={onClearAll}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          모두 삭제
        </button>
      )}
    </div>
  );
};
