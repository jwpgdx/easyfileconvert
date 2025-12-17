import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg = null;

export const initFFmpeg = async () => {
  console.log("🔧 Initializing FFmpeg...");

  if (ffmpeg) {
    console.log("✅ FFmpeg already initialized, reusing instance");
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  // Add logging for ffmpeg events
  ffmpeg.on("log", ({ message }) => {
    console.log("📝 FFmpeg log:", message);
  });

  try {
    console.log("🔄 Trying to load from node_modules...");
    // Try to load from node_modules first
    const baseURL = "/node_modules/@ffmpeg/core/dist/esm";

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    console.log("✅ FFmpeg loaded from node_modules successfully!");
  } catch (error) {
    console.warn("❌ Failed to load from node_modules, trying CDN...", error);

    // Fallback to CDN with CORS proxy
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    console.log("✅ FFmpeg loaded from CDN successfully!");
  }

  return ffmpeg;
};

// Get total frames using fast frame counting (no encoding)
const getTotalFrames = async (ffmpeg, inputFileName) => {
  return new Promise((resolve) => {
    let detectedFrames = null;

    console.log("🔍 Counting total frames (fast method)...");

    // Set up temporary log handler for frame counting
    const frameCountHandler = ({ message }) => {
      // Look for final frame count in logs
      const frameMatch = message.match(/frame=\s*(\d+)/);
      if (frameMatch) {
        detectedFrames = parseInt(frameMatch[1]);
        console.log(`📊 Frame counting progress: ${detectedFrames}`);
      }
    };

    // Add temporary log listener
    ffmpeg.on("log", frameCountHandler);

    // Fast frame counting command (no encoding, just copy)
    ffmpeg
      .exec([
        "-i",
        inputFileName,
        "-map",
        "0:v:0", // Select video stream
        "-c",
        "copy", // Copy without re-encoding
        "-f",
        "null", // Output to null (don't create file)
        "-",
      ])
      .then(() => {
        // Remove temporary log listener
        ffmpeg.off("log", frameCountHandler);

        console.log(`✅ Total frames detected: ${detectedFrames}`);
        resolve(detectedFrames);
      })
      .catch((error) => {
        // Remove temporary log listener on error
        ffmpeg.off("log", frameCountHandler);

        console.warn(
          "⚠️ Fast frame counting failed, will use fallback method:",
          error
        );
        resolve(null);
      });
  });
};

export const convertToWebP = async (file, quality, onProgress) => {
  console.log("🎬 Starting conversion for:", file.name);
  console.log("📊 File size:", (file.size / (1024 * 1024)).toFixed(2), "MB");
  console.log("⚙️ Quality settings:", quality);

  const ffmpeg = await initFFmpeg();

  const inputFileName = `input_${Date.now()}.${file.name.split(".").pop()}`;
  const outputFileName = `output_${Date.now()}.webp`;

  console.log("📁 Input file name:", inputFileName);
  console.log("📁 Output file name:", outputFileName);

  // Progress tracking variables
  let totalFrames = null;
  let currentFrame = 0;

  // Progress callback with frame-based information
  const updateProgress = (step, frameInfo = null) => {
    const progressData = {
      step,
      frameInfo,
      currentFrame,
      totalFrames,
    };
    console.log(`📈 ${step}${frameInfo ? ` (${frameInfo})` : ""}`);
    onProgress(progressData);
  };

  try {
    updateProgress("파일 업로드 중...");
    console.log("📤 Writing input file to ffmpeg virtual filesystem...");
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));
    console.log("✅ Input file written successfully");

    updateProgress("총 프레임 수 계산 중...");

    // Get total frames using fast counting method
    totalFrames = await getTotalFrames(ffmpeg, inputFileName);

    if (totalFrames) {
      console.log(`🎯 Total frames confirmed: ${totalFrames}`);
      updateProgress("변환 준비 중...", `총 ${totalFrames} 프레임`);
    } else {
      console.log(
        "⚠️ Could not determine total frames, will show progress without total"
      );
      updateProgress("변환 준비 중...");
    }

    // Set up log parsing for conversion progress tracking
    const conversionLogHandler = ({ message }) => {
      // Track current frame progress during conversion
      const frameMatch = message.match(/frame=\s*(\d+)/);

      if (frameMatch) {
        currentFrame = parseInt(frameMatch[1]);

        if (totalFrames && totalFrames > 0) {
          updateProgress("변환 중...", `${currentFrame}/${totalFrames} 프레임`);
        } else {
          updateProgress("변환 중...", `${currentFrame} 프레임 처리됨`);
        }
      }

      // Detect conversion completion
      if (message.includes("video:") && message.includes("audio:")) {
        updateProgress("파일 압축 및 최적화 중...");
      }
    };

    // Set up conversion progress tracking
    ffmpeg.on("log", conversionLogHandler);

    console.log("🔄 Starting ffmpeg conversion...");
    updateProgress("변환 시작...");

    // Convert video to animated WebP
    const command = [
      "-i",
      inputFileName,
      ...quality,
      "-loop",
      "0", // Loop forever
      "-f",
      "webp",
      outputFileName,
    ];
    console.log("🎯 FFmpeg command:", command.join(" "));

    // Execute conversion
    await ffmpeg.exec(command);

    // Remove conversion log listener
    ffmpeg.off("log", conversionLogHandler);

    updateProgress("파일 다운로드 준비 중...");
    console.log("✅ FFmpeg conversion completed!");

    console.log("📖 Reading output file...");
    const data = await ffmpeg.readFile(outputFileName);
    console.log("📊 Output file size:", data.length, "bytes");

    const webpBlob = new Blob([data], { type: "image/webp" });
    console.log("✅ WebP blob created successfully");

    // Clean up virtual filesystem
    console.log("🧹 Cleaning up virtual filesystem...");
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    console.log("✅ Cleanup completed");

    updateProgress("완료!");

    return webpBlob;
  } catch (error) {
    console.error("❌ Conversion error:", error);
    updateProgress("오류 발생", error.message);

    // Clean up on error
    try {
      console.log("🧹 Cleaning up after error...");
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      console.log("✅ Error cleanup completed");
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup error:", cleanupError);
    }
    throw error;
  }
};
