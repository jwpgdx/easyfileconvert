import React from "react";
import {
  VIDEO_OPTIONS,
  IMAGE_OPTIONS,
  AUDIO_OPTIONS,
} from "../constants/conversionOptions.js";

export const ConversionSettings = ({
  fileType,
  settings,
  onSettingsChange,
}) => {
  if (!fileType || fileType === "unknown") {
    return null;
  }

  const getOptions = () => {
    switch (fileType) {
      case "video":
        return VIDEO_OPTIONS;
      case "image":
        return IMAGE_OPTIONS;
      case "audio":
        return AUDIO_OPTIONS;
      default:
        return {};
    }
  };

  const options = getOptions();
  const currentFormatOptions = options[settings.outputFormat];

  const handleFormatChange = (format) => {
    onSettingsChange({
      ...settings,
      outputFormat: format,
      quality: Object.keys(options[format].qualities)[0], // 첫 번째 품질로 리셋
    });
  };

  const handleQualityChange = (quality) => {
    onSettingsChange({
      ...settings,
      quality,
    });
  };

  const handleResolutionChange = (resolution) => {
    onSettingsChange({
      ...settings,
      resolution,
    });
  };

  return (
    <div className="bg-card rounded-lg p-6 mb-8 border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {fileType === "video" && "🎬 비디오"}
        {fileType === "image" && "🖼️ 이미지"}
        {fileType === "audio" && "🎵 오디오"}
        변환 설정
      </h2>

      {/* 출력 형식 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-3">출력 형식</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(options).map(([format, config]) => (
            <label
              key={format}
              className={`
                relative cursor-pointer rounded-lg border-2 p-4 transition-all
                ${
                  settings.outputFormat === format
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }
              `}
            >
              <input
                type="radio"
                name="outputFormat"
                value={format}
                checked={settings.outputFormat === format}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="font-medium text-foreground mb-1">
                  {config.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {config.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 품질 설정 */}
      {currentFormatOptions && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-3">
            품질 설정
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(currentFormatOptions.qualities).map(
              ([quality, config]) => (
                <label
                  key={quality}
                  className={`
                  relative cursor-pointer rounded-lg border-2 p-3 transition-all
                  ${
                    settings.quality === quality
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }
                `}
                >
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    checked={settings.quality === quality}
                    onChange={(e) => handleQualityChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="font-medium text-foreground text-sm mb-1">
                      {config.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {config.description}
                    </div>
                  </div>
                </label>
              )
            )}
          </div>
        </div>
      )}

      {/* 해상도 설정 (비디오/이미지만) */}
      {(fileType === "video" || fileType === "image") &&
        currentFormatOptions?.resolutions && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground mb-3">
              해상도 설정
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {Object.entries(currentFormatOptions.resolutions).map(
                ([resolution, config]) => (
                  <label
                    key={resolution}
                    className={`
                  relative cursor-pointer rounded-lg border-2 p-2 transition-all text-center
                  ${
                    settings.resolution === resolution
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }
                `}
                  >
                    <input
                      type="radio"
                      name="resolution"
                      value={resolution}
                      checked={settings.resolution === resolution}
                      onChange={(e) => handleResolutionChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-medium text-foreground text-sm">
                      {config.label}
                    </div>
                  </label>
                )
              )}
            </div>
          </div>
        )}

      {/* 설정 요약 */}
      <div className="bg-muted rounded-lg p-3 text-sm">
        <div className="text-foreground font-medium mb-1">현재 설정</div>
        <div className="text-muted-foreground">
          {currentFormatOptions?.label} •{" "}
          {currentFormatOptions?.qualities[settings.quality]?.label}
          {settings.resolution &&
            settings.resolution !== "original" &&
            ` • ${
              currentFormatOptions?.resolutions?.[settings.resolution]?.label
            }`}
        </div>
      </div>
    </div>
  );
};
