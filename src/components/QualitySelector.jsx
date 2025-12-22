import React from "react";
import { QUALITY_OPTIONS } from "../constants/quality.js";

export const QualitySelector = ({ selectedQuality, onQualityChange }) => {
  return (
    <div className="bg-card rounded-lg p-6 mb-8 border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        변환 품질 설정
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(QUALITY_OPTIONS).map(([key, config]) => (
          <label
            key={key}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all
              ${
                selectedQuality === key
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              }
            `}
          >
            <input
              type="radio"
              name="quality"
              value={key}
              checked={selectedQuality === key}
              onChange={(e) => onQualityChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="font-medium text-foreground mb-1">
                {config.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {config.description}
              </div>
              {config.warning && selectedQuality === key && (
                <div className="text-xs text-yellow-400 mt-2">
                  ⚠️ {config.warning}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
