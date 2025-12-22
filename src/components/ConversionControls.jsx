import React from "react";
import { downloadAllAsZip } from "../utils/download.js";
import { Button } from "@/components/ui/button";

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
    // 범용 파일 다운로드를 위한 업데이트된 로직
    const completedFilesWithOutput = completedFiles.filter(
      (f) => f.outputBlob && f.outputFilename
    );

    if (completedFilesWithOutput.length === 0) {
      alert("다운로드할 변환된 파일이 없습니다.");
      return;
    }

    // 간단한 ZIP 다운로드 (향후 JSZip 라이브러리 사용 고려)
    if (completedFilesWithOutput.length === 1) {
      // 파일이 하나면 직접 다운로드
      const file = completedFilesWithOutput[0];
      const link = document.createElement("a");
      link.href = file.outputUrl;
      link.download = file.outputFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 여러 파일은 개별 다운로드 (향후 ZIP 구현)
      alert(
        "여러 파일은 개별적으로 다운로드해주세요. ZIP 기능은 곧 추가될 예정입니다."
      );
    }
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
        <Button
          onClick={onStartConversion}
          disabled={isConverting || idleFiles.length === 0}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {getStartButtonText()}
        </Button>
      )}

      {allCompleted && (
        <Button
          onClick={handleZipDownload}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          모두 다운로드 ({completedFiles.length}개)
        </Button>
      )}

      {files.length > 0 && !isConverting && (
        <Button onClick={onClearAll} variant="destructive" size="lg">
          모두 삭제
        </Button>
      )}
    </div>
  );
};
