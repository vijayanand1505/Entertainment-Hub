let pending;
export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.id = "eh-youtube-api";
    const previous = window.onYouTubeIframeAPIReady;
    let timer;
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      pending = undefined;
      window.onYouTubeIframeAPIReady = previous;
      reject(new Error("The YouTube player could not load."));
    };
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };
    script.onerror = fail;
    timer = setTimeout(fail, 12000);
    document.head.appendChild(script);
  });
  return pending;
}
