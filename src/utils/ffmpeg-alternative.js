// Alternative approach using Canvas API for better progress tracking
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

  try {
    console.log("🔄 Trying to load from node_modules...");
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
    console.log("✅ FFmpeg loaded successfully!");
  } catch (error) {
    console.warn("❌ Failed to load from node_modules, trying CDN...", error);
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

// Alternative: Extract frames and create WebP animation manually
export const convertToWebPWithFrames = async (file, quality, onProgress) => {
  console.log("🎬 Starting frame-based conversion for:", file.name);

  const ffmpeg = await initFFmpeg();
  const inputFileName = `input_${Date.now()}.${file.name.split(".").pop()}`;

  try {
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));
    onProgress(10);

    // First, get video info
    console.log("📊 Getting video information...");
    await ffmpeg.exec(["-i", inputFileName, "-f", "null", "-"]);
    onProgress(20);

    // Extract frames as individual images
    console.log("🖼️ Extracting frames...");
    await ffmpeg.exec([
      "-i",
      inputFileName,
      "-vf",
      "fps=10", // 10 FPS for smaller file size
      "frame_%03d.png",
    ]);
    onProgress(50);

    // Convert frames to animated WebP
    console.log("🔄 Creating animated WebP...");
    const outputFileName = `output_${Date.now()}.webp`;
    await ffmpeg.exec([
      "-framerate",
      "10",
      "-i",
      "frame_%03d.png",
      ...quality,
      "-loop",
      "0",
      "-f",
      "webp",
      outputFileName,
    ]);
    onProgress(90);

    // Read output
    const data = await ffmpeg.readFile(outputFileName);
    const webpBlob = new Blob([data], { type: "image/webp" });

    // Cleanup
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // Clean up frame files
    try {
      for (let i = 1; i <= 100; i++) {
        // Assume max 100 frames
        const frameFile = `frame_${i.toString().padStart(3, "0")}.png`;
        await ffmpeg.deleteFile(frameFile);
      }
    } catch (e) {
      // Ignore cleanup errors for frames
    }

    onProgress(100);
    return webpBlob;
  } catch (error) {
    console.error("❌ Frame-based conversion error:", error);
    throw error;
  }
};

// Simplified direct conversion with better progress
export const convertToWebPSimple = async (file, quality, onProgress) => {
  console.log("🎬 Starting simple conversion for:", file.name);

  const ffmpeg = await initFFmpeg();
  const inputFileName = `input_${Date.now()}.${file.name.split(".").pop()}`;
  const outputFileName = `output_${Date.now()}.webp`;

  try {
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));
    onProgress(20);
    console.log("✅ File uploaded to FFmpeg");

    // Use a timeout-based progress simulation that's more predictable
    const progressPromise = new Promise((resolve) => {
      let currentProgress = 20;
      const interval = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 90) {
          clearInterval(interval);
          resolve();
        } else {
          onProgress(currentProgress);
          console.log(`📈 Progress: ${currentProgress}%`);
        }
      }, 1000); // Every 1 second
    });

    // Start conversion and progress simulation simultaneously
    const conversionPromise = ffmpeg.exec([
      "-i",
      inputFileName,
      ...quality,
      "-loop",
      "0",
      "-f",
      "webp",
      outputFileName,
    ]);

    // Wait for both to complete
    await Promise.all([conversionPromise, progressPromise]);
    onProgress(100);
    console.log("✅ Conversion completed");

    const data = await ffmpeg.readFile(outputFileName);
    const webpBlob = new Blob([data], { type: "image/webp" });

    // Cleanup
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    return webpBlob;
  } catch (error) {
    console.error("❌ Simple conversion error:", error);
    throw error;
  }
};
