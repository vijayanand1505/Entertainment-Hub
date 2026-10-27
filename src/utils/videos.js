export function playableVideos(videos = []) {
  if (!Array.isArray(videos)) return [];
  const seen = new Set();
  const rank = (video) =>
    video.type === "Trailer"
      ? video.official
        ? 0
        : 1
      : video.type === "Teaser"
        ? 2
        : 3;
  return videos
    .filter((video) => {
      if (
        video?.site !== "YouTube" ||
        !/^[A-Za-z0-9_-]{11}$/.test(video.key || "") ||
        seen.has(video.key)
      )
        return false;
      seen.add(video.key);
      return true;
    })
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 16);
}
