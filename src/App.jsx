import React, { useState, useEffect, useCallback } from "react";
import {
  convertFile,
  generateOutputFilename,
  validateSettings,
} from "./utils/universalConverter.js";
import { detectFileType, FILE_TYPE_ICONS } from "./utils/fileDetector.js";
import { DEFAULT_SETTINGS } from "./constants/conversionOptions.js";
import { ConversionSettings } from "./components/ConversionSettings.jsx";
import { FileDropzone } from "./components/FileDropzone.jsx";
import { FileListItem } from "./components/FileListItem.jsx";
import { ConversionControls } from "./components/ConversionControls.jsx";

function App() {
  const [files, setFiles] = useState([]);
  const [conversionSettings, setConversionSettings] = useState(
    DEFAULT_SETTINGS.video
  ); // 기본값
  const [currentFileType, setCurrentFileType] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [processingTrigger, setProcessingTrigger] = useState(0);
  const [previewFileId, setPreviewFileId] = useState(null);

  // 파일 타입이 변경될 때 설정 업데이트
  useEffect(() => {
    if (currentFileType && DEFAULT_SETTINGS[currentFileType]) {
      setConversionSettings(DEFAULT_SETTINGS[currentFileType]);
    }
  }, [currentFileType]);

  // Sequential conversion queue (only processes files marked as READY)
  useEffect(() => {
    const processNextFile = async () => {
      console.log("🔍 Checking for next file to process...");
      console.log(
        "📊 Current state - isConverting:",
        isConverting,
        "files:",
        files.length
      );

      if (isConverting) {
        console.log("⏸️ Already converting, skipping...");
        return;
      }

      const nextFile = files.find((f) => f.status === "READY");
      if (!nextFile) {
        console.log("✅ No files ready to process");
        return;
      }

      console.log("🎯 Found file to process:", nextFile.file.name);
      setIsConverting(true);

      try {
        console.log("📝 Updating file status to PROCESSING...");
        // Update status to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === nextFile.id
              ? { ...f, status: "PROCESSING", progressStep: "시작 중..." }
              : f
          )
        );

        // 설정 검증
        const validation = validateSettings(
          nextFile.fileType,
          conversionSettings
        );
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        console.log("⚙️ Using conversion settings:", conversionSettings);
        console.log("🚀 Starting conversion...");

        const outputBlob = await convertFile(
          nextFile.file,
          conversionSettings,
          (progressData) => {
            console.log("📈 Progress callback received:", progressData);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === nextFile.id
                  ? {
                      ...f,
                      progressStep: progressData?.step || "처리 중...",
                      frameInfo: progressData?.frameInfo || null,
                      currentFrame: progressData?.currentFrame || 0,
                      totalFrames: progressData?.totalFrames || null,
                    }
                  : f
              )
            );
          }
        );

        console.log("✅ Conversion completed, creating object URL...");
        const outputUrl = URL.createObjectURL(outputBlob);
        const outputFilename = generateOutputFilename(
          nextFile.file,
          conversionSettings
        );
        console.log("🔗 Object URL created:", outputUrl);

        // Update status to completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === nextFile.id
              ? {
                  ...f,
                  status: "COMPLETED",
                  outputUrl,
                  outputBlob,
                  outputFilename,
                  outputSize: outputBlob.size,
                  progressStep: "완료!",
                }
              : f
          )
        );
        console.log("✅ File status updated to COMPLETED");

        // Trigger next file processing
        setProcessingTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("❌ Conversion error:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === nextFile.id
              ? {
                  ...f,
                  status: "ERROR",
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : f
          )
        );
      } finally {
        console.log("🏁 Setting isConverting to false");
        setIsConverting(false);
      }
    };

    processNextFile();
  }, [processingTrigger, conversionSettings, isConverting]);

  const handleFilesAdded = useCallback((newFiles) => {
    console.log("📁 Files added:", newFiles.length, "files");

    // 파일 타입 감지 및 그룹화
    const filesByType = {};
    newFiles.forEach((file, index) => {
      const fileType = detectFileType(file);
      console.log(
        `📄 File ${index + 1}:`,
        file.name,
        `(${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
        `Type: ${fileType}`
      );

      if (!filesByType[fileType]) {
        filesByType[fileType] = [];
      }
      filesByType[fileType].push(file);
    });

    // 첫 번째 파일의 타입을 현재 타입으로 설정
    const firstFileType = detectFileType(newFiles[0]);
    if (firstFileType !== "unknown") {
      setCurrentFileType(firstFileType);
    }

    const conversionFiles = newFiles.map((file) => {
      const fileType = detectFileType(file);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        fileType,
        originalUrl: URL.createObjectURL(file),
        status: "IDLE",
        progressStep: "업로드 완료 - 시작 대기 중",
        currentFrame: 0,
        totalFrames: null,
      };
    });

    setFiles((prev) => {
      const newFileList = [...prev, ...conversionFiles];
      console.log("📊 Total files in queue:", newFileList.length);
      return newFileList;
    });
  }, []);

  const handleStartConversion = useCallback(() => {
    console.log("🚀 Starting conversion for all IDLE files...");
    // Mark all IDLE files as READY to start processing
    setFiles((prev) =>
      prev.map((f) => {
        if (f.status === "IDLE") {
          return {
            ...f,
            status: "READY",
            progressStep: "변환 대기열에 추가됨",
          };
        } else if (f.status === "ERROR") {
          return { ...f, status: "READY", progressStep: "재시도 준비 중" };
        }
        return f;
      })
    );

    // Trigger processing
    setProcessingTrigger((prev) => prev + 1);
  }, []);

  const handleRemoveFile = useCallback((id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.outputUrl) {
        URL.revokeObjectURL(fileToRemove.outputUrl);
      }
      if (fileToRemove?.originalUrl) {
        URL.revokeObjectURL(fileToRemove.originalUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach((file) => {
      if (file.outputUrl) {
        URL.revokeObjectURL(file.outputUrl);
      }
      if (file.originalUrl) {
        URL.revokeObjectURL(file.originalUrl);
      }
    });
    setFiles([]);
    setPreviewFileId(null);
    setCurrentFileType(null);
  }, [files]);

  const handleTogglePreview = useCallback((fileId) => {
    setPreviewFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  const handleStartSingle = useCallback((fileId) => {
    console.log("🚀 Starting single file conversion:", fileId);
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId && (f.status === "IDLE" || f.status === "ERROR")) {
          return {
            ...f,
            status: "READY",
            progressStep: "변환 대기열에 추가됨",
            error: undefined,
          };
        }
        return f;
      })
    );

    setProcessingTrigger((prev) => prev + 1);
  }, []);

  const handleCancelSingle = useCallback((fileId) => {
    console.log("❌ Canceling queued file:", fileId);
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId && f.status === "READY") {
          return {
            ...f,
            status: "IDLE",
            progressStep: "대기 취소됨",
            currentFrame: 0,
            totalFrames: null,
          };
        }
        return f;
      })
    );
  }, []);

  // 현재 파일들의 타입 분석
  const getFileTypeStats = () => {
    const stats = {};
    files.forEach((file) => {
      const type = file.fileType || "unknown";
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  const fileTypeStats = getFileTypeStats();
  const hasMultipleTypes = Object.keys(fileTypeStats).length > 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">EZ2Convert</h1>
          <p className="text-muted-foreground mt-2">
            범용 파일 변환기 - 비디오, 이미지, 오디오 변환
          </p>

          {/* 파일 타입 통계 표시 */}
          {files.length > 0 && (
            <div className="mt-3 flex gap-4 text-sm">
              {Object.entries(fileTypeStats).map(([type, count]) => (
                <span
                  key={type}
                  className="flex items-center gap-1 text-muted-foreground"
                >
                  <span className="text-lg">
                    {FILE_TYPE_ICONS[type] || "📄"}
                  </span>
                  {type} {count}개
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* File Upload */}
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          hasFiles={files.length > 0}
          acceptedFileTypes={["video", "image"]} // 현재는 비디오와 이미지만
        />

        {/* Conversion Settings */}
        {currentFileType && !hasMultipleTypes && (
          <ConversionSettings
            fileType={currentFileType}
            settings={conversionSettings}
            onSettingsChange={setConversionSettings}
          />
        )}

        {/* Multiple File Types Warning */}
        {hasMultipleTypes && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-yellow-600">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-medium">
                  여러 파일 타입이 감지되었습니다
                </div>
                <div className="text-sm mt-1">
                  현재는 같은 타입의 파일들을 함께 변환하는 것을 권장합니다. 각
                  타입별로 별도로 업로드해주세요.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-foreground">
              파일 목록 ({files.length}개)
            </h3>
            {files.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                onRemove={handleRemoveFile}
                showPreview={previewFileId === file.id}
                onTogglePreview={handleTogglePreview}
                onStartSingle={handleStartSingle}
                onCancelSingle={handleCancelSingle}
              />
            ))}
          </div>
        )}

        {/* Conversion Controls */}
        <ConversionControls
          files={files}
          isConverting={isConverting}
          onStartConversion={handleStartConversion}
          onClearAll={handleClearAll}
        />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              안전하고 빠른 클라이언트 사이드 파일 변환
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  🎬 비디오 변환
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• WebP 애니메이션으로 변환</li>
                  <li>• 4가지 품질 옵션</li>
                  <li>• 해상도 조정 가능</li>
                  <li>• MP4, AVI, MOV 등 지원</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  🖼️ 이미지 변환
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• WebP, PNG, JPG, AVIF</li>
                  <li>• 무손실/손실 압축</li>
                  <li>• 해상도 변경 가능</li>
                  <li>• 품질 세부 조정</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  🔒 개인정보 보호
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• 서버 업로드 없음</li>
                  <li>• 브라우저에서 직접 처리</li>
                  <li>• 파일이 외부로 전송되지 않음</li>
                  <li>• 완전한 클라이언트 사이드</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center text-muted-foreground text-sm">
            © 2024 EZ2Convert. 모든 변환은 사용자의 브라우저에서 안전하게
            처리됩니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
