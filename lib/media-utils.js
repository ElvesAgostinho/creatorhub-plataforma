/**
 * lib/media-utils.js
 * Utilities for detecting, parsing, and converting media URLs.
 * Supports YouTube, Vimeo, Google Drive, direct links, and internal storage.
 */

// ─── Source Detection ───────────────────────────────────────────────────────

/**
 * Detects the source type of a media URL.
 * @param {string} url
 * @returns {'youtube'|'vimeo'|'google_drive'|'storage'|'direct_image'|'direct'|'unknown'}
 */
export function detectMediaSource(url) {
  if (!url || typeof url !== "string") return "unknown";
  const u = url.trim();

  if (u.startsWith("storage:")) return "storage";

  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
      return "youtube";
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      return "vimeo";
    }
    if (host === "drive.google.com" || host === "docs.google.com") {
      return "google_drive";
    }
    if (isDirectImageUrl(u)) return "direct_image";

    return "direct";
  } catch {
    return "unknown";
  }
}

// ─── Image Detection ─────────────────────────────────────────────────────────

/**
 * Returns true if the URL appears to be a direct image link.
 */
export function isDirectImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase().split("?")[0];
  return /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)$/.test(lower);
}

/**
 * Returns true if the URL appears to be a direct video link.
 */
export function isDirectVideoUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase().split("?")[0];
  return /\.(mp4|webm|mov|ogg|mkv|m3u8)$/.test(lower);
}

// ─── YouTube Helpers ──────────────────────────────────────────────────────────

/**
 * Extracts YouTube video ID from various URL formats.
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Returns a privacy-safe YouTube embed URL.
 */
export function getYouTubeEmbedUrl(url) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

/**
 * Returns the YouTube thumbnail URL.
 */
export function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ─── Vimeo Helpers ────────────────────────────────────────────────────────────

/**
 * Extracts Vimeo video ID.
 */
export function extractVimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/**
 * Returns Vimeo embed URL.
 */
export function getVimeoEmbedUrl(url) {
  const id = extractVimeoId(url);
  if (!id) return null;
  return `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0&portrait=0`;
}

// ─── Google Drive Helpers ─────────────────────────────────────────────────────

/**
 * Extracts Google Drive file ID.
 */
export function extractDriveFileId(url) {
  if (!url) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Returns Google Drive embed URL (works for videos and documents).
 */
export function getDriveEmbedUrl(url) {
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

/**
 * Returns a direct image URL from Google Drive.
 */
export function getDriveImageUrl(url) {
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

// ─── Internal Storage Helpers ─────────────────────────────────────────────────

/**
 * Resolves a storage:bucket/path reference to a public Supabase URL.
 */
export function resolveStorageUrl(storageRef) {
  if (!storageRef || !storageRef.startsWith("storage:")) return storageRef;
  const path = storageRef.replace("storage:", "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

// ─── Universal Embed URL ──────────────────────────────────────────────────────

/**
 * Given any media URL, returns { embedUrl, source, isIframe, thumbnail }.
 */
export function resolveMediaUrl(url) {
  if (!url) return { embedUrl: null, source: "unknown", isIframe: false, thumbnail: null };

  const source = detectMediaSource(url);

  switch (source) {
    case "youtube": {
      return {
        embedUrl: getYouTubeEmbedUrl(url),
        source: "youtube",
        isIframe: true,
        thumbnail: getYouTubeThumbnail(url),
      };
    }
    case "vimeo": {
      return {
        embedUrl: getVimeoEmbedUrl(url),
        source: "vimeo",
        isIframe: true,
        thumbnail: null,
      };
    }
    case "google_drive": {
      return {
        embedUrl: getDriveEmbedUrl(url),
        source: "google_drive",
        isIframe: true,
        thumbnail: null,
      };
    }
    case "storage": {
      return {
        embedUrl: resolveStorageUrl(url),
        source: "storage",
        isIframe: false,
        thumbnail: null,
      };
    }
    case "direct_image": {
      return {
        embedUrl: url,
        source: "direct_image",
        isIframe: false,
        thumbnail: url,
      };
    }
    default: {
      return {
        embedUrl: url,
        source: "direct",
        isIframe: false,
        thumbnail: null,
      };
    }
  }
}

// ─── Source Labels ────────────────────────────────────────────────────────────

export const SOURCE_LABELS = {
  youtube: { label: "YouTube", icon: "▶", color: "#FF0000" },
  vimeo: { label: "Vimeo", icon: "▶", color: "#1AB7EA" },
  google_drive: { label: "Google Drive", icon: "📁", color: "#4285F4" },
  storage: { label: "Storage Interno", icon: "🔒", color: "#10B981" },
  direct: { label: "Link Direto", icon: "🔗", color: "#6B7280" },
  direct_image: { label: "Imagem", icon: "🖼", color: "#8B5CF6" },
  unknown: { label: "Desconhecido", icon: "❓", color: "#9CA3AF" },
};
