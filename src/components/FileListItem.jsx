import React, { useState, useRef, useCallback } from "react";
import { downloadFile } from "../utils/download.js";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const FileListItem = ({
  file,
  onRemove,
  showPreview,
  onTogglePreview,
  onStartSingle,
  onCancelSingle,
}) => {
  const [previewHeight, setPreviewHeight] = useState(256); // Default height
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const startHeight = useRef(0);
  const handleDownload = () => {
    if (file.webpUrl) {
      fetch(file.webpUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const filename = `${file.file.name.split(".")[0]}.webp`;
          downloadFile(blob, filename);
        });
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case "READY":
        return "text-yellow-400";
      case "PROCESSING":
        return "text-blue-400";
      case "COMPLETED":
        return "text-green-400";
      case "ERROR":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case "IDLE":
        return "시작 대기";
      case "READY":
        return "변환 대기";
      case "PROCESSING":
        // Show hybrid progress: percentage + frame count
        if (file.totalFrames && file.currentFrame) {
          const percentage = Math.round(
            (file.currentFrame / file.totalFrames) * 100
          );
          return `${percentage}% (${file.currentFrame}/${file.totalFrames})`;
        }
        return file.progressStep || "처리 중...";
      case "COMPLETED":
        return "완료";
      case "ERROR":
        return `오류: ${file.error}`;
    }
  };

  const getDetailText = () => {
    if (file.status === "PROCESSING") {
      // Show step info, but not frame count (since it's in status text)
      if (file.totalFrames && file.currentFrame) {
        return file.progressStep || "변환 중...";
      }
      return file.progressStep || "처리 중...";
    } else if (file.status === "IDLE" || file.status === "READY") {
      return file.progressStep || null;
    }
    return null;
  };

  const getProgressPercentage = () => {
    if (file.status === "PROCESSING" && file.totalFrames && file.currentFrame) {
      return Math.round((file.currentFrame / file.totalFrames) * 100);
    }
    return 0;
  };

  const isIndeterminate = () => {
    return (
      file.status === "PROCESSING" &&
      (file.progressStep?.includes("압축") ||
        file.progressStep?.includes("준비") ||
        file.progressStep?.includes("분석") ||
        file.progressStep?.includes("업로드"))
    );
  };

  // Resize handle functions
  const handleMouseDown = useCallback(
    (e) => {
      setIsDragging(true);
      dragStartY.current = e.clientY;
      startHeight.current = previewHeight;
      e.preventDefault();
    },
    [previewHeight]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStartY.current;
      const newHeight = Math.max(
        200,
        Math.min(600, startHeight.current + deltaY)
      );
      setPreviewHeight(newHeight);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded flex items-center justify-center">
          {file.status === "COMPLETED" ? (
            <div className="text-green-400 text-xl">✅</div>
          ) : file.status === "PROCESSING" ? (
            <div className="text-blue-400 text-xl">⚙️</div>
          ) : file.status === "ERROR" ? (
            <div className="text-red-400 text-xl">❌</div>
          ) : (
            <div className="text-muted-foreground text-xl">🎬</div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="text-foreground font-medium truncate">
            {file.file.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {(file.file.size / (1024 * 1024)).toFixed(2)} MB
            {file.status === "COMPLETED" && file.webpSize && (
              <span className="text-green-400 ml-2">
                → {(file.webpSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>
          {/* Detailed progress info */}
          {getDetailText() && (
            <div className="text-xs text-muted-foreground mt-1">
              {getDetailText()}
            </div>
          )}
        </div>

        {/* Status */}
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>

        {/* Progress Bar */}
        {file.status === "PROCESSING" && (
          <div className="w-32">
            {isIndeterminate() ? (
              // Indeterminate progress bar for non-frame steps
              <div className="w-full bg-slate-700 rounded-full h-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400">
                  <div className="h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
                </div>
              </div>
            ) : (
              // Frame-based progress bar
              <Progress value={getProgressPercentage()} className="w-full" />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {(file.status === "IDLE" || file.status === "ERROR") && (
            <Button
              onClick={() => onStartSingle(file.id)}
              variant="default"
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {file.status === "ERROR" ? "재시도" : "시작"}
            </Button>
          )}
          {file.status === "READY" && (
            <Button
              onClick={() => onCancelSingle(file.id)}
              variant="default"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              대기 취소
            </Button>
          )}
          {file.status === "COMPLETED" && (
            <Button
              onClick={handleDownload}
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              다운로드
            </Button>
          )}
          {file.status !== "PROCESSING" && (
            <Button
              onClick={() => onRemove(file.id)}
              variant="destructive"
              size="sm"
            >
              삭제
            </Button>
          )}
          {file.status === "COMPLETED" && (
            <Button
              onClick={() => onTogglePreview(file.id)}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 px-3"
              title={showPreview ? "미리보기 닫기" : "미리보기 열기"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showPreview ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && file.status === "COMPLETED" && file.webpUrl && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-foreground font-medium mb-4">미리보기 비교</h4>

          {/* Side by Side Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Original Video */}
            <div className="bg-muted rounded-lg p-4">
              <div className="text-foreground font-medium mb-2 text-center">
                원본
              </div>
              <video
                src={file.originalUrl}
                autoPlay
                loop
                muted
                className="w-full mx-auto rounded object-contain"
                style={{ height: `${previewHeight}px` }}
              />
              <div className="mt-2 text-xs text-muted-foreground text-center">
                크기: {(file.file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>

            {/* WebP Result */}
            <div className="bg-muted rounded-lg p-4">
              <div className="text-foreground font-medium mb-2 text-center">
                WebP
              </div>
              <img
                src={file.webpUrl}
                alt="WebP 변환 결과"
                className="w-full mx-auto rounded object-contain"
                style={{ height: `${previewHeight}px` }}
              />
              <div className="mt-2 text-xs text-muted-foreground text-center">
                크기:{" "}
                {file.webpSize
                  ? (file.webpSize / (1024 * 1024)).toFixed(2) + " MB"
                  : "계산 중..."}
              </div>
            </div>
          </div>

          {/* Resize Handle */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-2 bg-muted rounded-full cursor-ns-resize hover:bg-muted-foreground/20 transition-colors flex items-center justify-center ${
                isDragging ? "bg-primary" : ""
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="w-8 h-0.5 bg-muted-foreground rounded"></div>
            </div>
          </div>

          {/* Format Comparison */}
          <div className="bg-muted rounded-lg p-3 text-sm border border-border">
            <div className="text-foreground font-medium mb-2">변환 정보</div>
            <div className="grid grid-cols-2 gap-4 text-muted-foreground">
              <div>
                <div>원본: {file.file.type}</div>
                <div>
                  크기: {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
              <div>
                <div>결과: image/webp</div>
                <div>
                  크기:{" "}
                  {file.webpSize
                    ? (file.webpSize / (1024 * 1024)).toFixed(2) + " MB"
                    : "계산 중..."}
                </div>
                {file.webpSize && (
                  <div className="text-green-400 mt-1">
                    압축률:{" "}
                    {(
                      ((file.file.size - file.webpSize) / file.file.size) *
                      100
                    ).toFixed(1)}
                    % 절약
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
