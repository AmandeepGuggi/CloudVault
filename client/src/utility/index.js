export function getUniquename(baseName, existingNames) {
  const normalized = baseName.trim();
  if (!existingNames.includes(normalized)) {
    return normalized;
  }

  const regex = new RegExp(`^${normalized} \\((\\d+)\\)$`);
  const usedNumbers = new Set();

  existingNames.forEach(name => {
    const match = name.match(regex);
    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  });

  let i = 1;
  while (usedNumbers.has(i)) {
    i++;
  }

  return `${normalized} (${i})`;
}
export const BASE_URL = "http://localhost:4000"

export  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      // Document
      case "pdf":
        return "/assets/icons/file-pdf.svg";
      case "doc":
        return "/assets/icons/file-doc.svg";
      case "docx":
        return "/assets/icons/file-docx.svg";
      case "csv":
        return "/assets/icons/file-csv.svg";
      case "txt":
        return "/assets/icons/file-txt.svg";
      case "zip":
          return "/assets/icons/zip.svg";
      case "xls":
      case "xlsx":
        return "/assets/icons/file-document.svg";
      // Image
      case "svg":
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "/assets/icons/file-image.svg";
      // // Video
      case "mkv":
      case "mov":
      case "avi":
      case "wmv":
      case "mp4":
      case "flv":
      case "webm":
      case "m4v":
      case "3gp":
        return "/assets/icons/file-video.svg";
      // // Audio
      case "mp3":
      case "mpeg":
      case "wav":
      case "aac":
      case "flac":
      case "ogg":
      case "wma":
      case "m4a":
      case "aiff":
      case "alac":
        return "/assets/icons/file-audio.svg";

      default:
        switch (ext) {
          case "image":
            return "/assets/icons/file-image.svg";
          case "document":
            return "/assets/icons/file-document.svg";
          case "video":
            return "/assets/icons/file-video.svg";
          case "audio":
            return "/assets/icons/file-audio.svg";
          default:
            return "/assets/icons/file-other.svg";
        }
    }
  };

export  function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export const loginWithGoogle = async (credentials) => {
   const response = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ idToken: credentials}),
  })
  const data = await response.json();
  console.log(data);
  return data.user
}


// console.log(formatBytes(43343)); // 42.33 KB
