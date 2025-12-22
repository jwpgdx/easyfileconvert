import React, { useState, useEffect, useCallback } from "react";
import { QUALITY_OPTIONS } from "./constants/quality.js";
import { convertToWebP } from "./utils/ffmpeg.js";
import { QualitySelector } from "./components/QualitySelector.jsx";
import { FileDropzone } from "./components/FileDropzone.jsx";
import { FileListItem } from "./components/FileListItem.jsx";
import { ConversionControls } from "./components/ConversionControls.jsx";

function App() {
  const [files, setFiles] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState("standard");
  const [isConverting, setIsConverting] = useState(false);
  const [processingTrigger, setProcessingTrigger] = useState(0);
  const [previewFileId, setPreviewFileId] = useState(null);

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

        const qualityArgs = QUALITY_OPTIONS[selectedQuality].ffmpegArgs;
        console.log("⚙️ Using quality args:", qualityArgs);

        console.log("🚀 Starting conversion...");
        const webpBlob = await convertToWebP(
          nextFile.file,
          qualityArgs,
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
        const webpUrl = URL.createObjectURL(webpBlob);
        console.log("🔗 Object URL created:", webpUrl);

        // Update status to completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === nextFile.id
              ? {
                  ...f,
                  status: "COMPLETED",
                  webpUrl,
                  webpSize: webpBlob.size, // Store WebP file size
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
  }, [processingTrigger, selectedQuality, isConverting]); // Use processingTrigger to control when to check for next file

  const handleFilesAdded = useCallback((newFiles) => {
    console.log("📁 Files added:", newFiles.length, "files");
    newFiles.forEach((file, index) => {
      console.log(
        `📄 File ${index + 1}:`,
        file.name,
        `(${(file.size / (1024 * 1024)).toFixed(2)}MB)`
      );
    });

    const conversionFiles = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      originalUrl: URL.createObjectURL(file), // Create original file URL once
      status: "IDLE", // Files start as IDLE, need to be manually started
      progressStep: "업로드 완료 - 시작 대기 중",
      currentFrame: 0,
      totalFrames: null,
    }));

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
      if (fileToRemove?.webpUrl) {
        URL.revokeObjectURL(fileToRemove.webpUrl);
      }
      if (fileToRemove?.originalUrl) {
        URL.revokeObjectURL(fileToRemove.originalUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach((file) => {
      if (file.webpUrl) {
        URL.revokeObjectURL(file.webpUrl);
      }
      if (file.originalUrl) {
        URL.revokeObjectURL(file.originalUrl);
      }
    });
    setFiles([]);
    setPreviewFileId(null);
  }, [files]);

  const handleTogglePreview = useCallback((fileId) => {
    setPreviewFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  const handleStartSingle = useCallback((fileId) => {
    console.log("🚀 Starting single file conversion:", fileId);
    // Mark specific file as READY to start processing
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId && (f.status === "IDLE" || f.status === "ERROR")) {
          return {
            ...f,
            status: "READY",
            progressStep: "변환 대기열에 추가됨",
            error: undefined, // Clear any previous error
          };
        }
        return f;
      })
    );

    // Trigger processing
    setProcessingTrigger((prev) => prev + 1);
  }, []);

  const handleCancelSingle = useCallback((fileId) => {
    console.log("❌ Canceling queued file:", fileId);

    // Mark the file as cancelled (back to IDLE)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">EZ2Convert</h1>
          <p className="text-muted-foreground mt-2">
            클라이언트 사이드 비디오 → WebP 변환기
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Quality Selector */}
        <QualitySelector
          selectedQuality={selectedQuality}
          onQualityChange={setSelectedQuality}
        />

        {/* File Upload */}
        <FileDropzone
          onFilesAdded={handleFilesAdded}
          hasFiles={files.length > 0}
        />

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-white">
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
      <footer className="bg-slate-800 border-t border-slate-700 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* SEO Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              안전하고 빠른 클라이언트 사이드 비디오 변환
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-400">
              <div>
                <h3 className="font-medium text-white mb-2">주요 특징</h3>
                <ul className="space-y-1 text-sm">
                  <li>• 서버 업로드 없이 브라우저에서 직접 변환</li>
                  <li>• 개인정보 보호 - 파일이 외부로 전송되지 않음</li>
                  <li>• 최대 20개 파일 동시 처리</li>
                  <li>• 4가지 품질 옵션 제공</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">지원 형식</h3>
                <ul className="space-y-1 text-sm">
                  <li>• 입력: MP4, AVI, MOV, MKV, WebM, FLV, WMV</li>
                  <li>• 출력: WebP (고효율 이미지 형식)</li>
                  <li>• 최대 파일 크기: 50MB</li>
                  <li>• ZIP 압축 다운로드 지원</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ad Space */}
          <div className="bg-slate-700 rounded-lg p-8 text-center mb-8">
            <div className="text-slate-400">[광고 영역 - Google AdSense]</div>
          </div>

          {/* Copyright */}
          <div className="text-center text-slate-500 text-sm">
            © 2024 EasyFileConvert. 모든 변환은 사용자의 브라우저에서 안전하게
            처리됩니다.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
