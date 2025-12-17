import JSZip from "jszip";
import { saveAs } from "file-saver";

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadAllAsZip = async (files) => {
  const zip = new JSZip();

  const completedFiles = files.filter(
    (f) => f.status === "COMPLETED" && f.webpUrl
  );

  for (const file of completedFiles) {
    if (file.webpUrl) {
      const response = await fetch(file.webpUrl);
      const blob = await response.blob();
      const filename = `${file.file.name.split(".")[0]}.webp`;
      zip.file(filename, blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `converted_webp_${Date.now()}.zip`);
};
