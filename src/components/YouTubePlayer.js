import { useEffect, useRef, useState } from "react";
import { loadYouTubeApi } from "../utils/youtube";

export default function YouTubePlayer({ video, title }) {
  const holder = useRef(null);
  const [state, setState] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const container = holder.current;
    let active = true;
    let player;
    setState("loading");
    const timer = setTimeout(() => {
      if (active) setState("network-error");
    }, 16000);
    loadYouTubeApi()
      .then((YT) => {
        if (!active || !container) return;
        const target = document.createElement("div");
        container.textContent = "";
        container.appendChild(target);
        player = new YT.Player(target, {
          host: "https://www.youtube-nocookie.com",
          videoId: video.key,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (active) {
                clearTimeout(timer);
                setState("ready");
              }
            },
            onError: () => {
              if (active) {
                clearTimeout(timer);
                setState("video-error");
              }
            },
          },
        });
        const iframe = player.getIframe?.();
        if (iframe) {
          iframe.title = `${title} — ${video.name || "Trailer"}`;
          iframe.referrerPolicy = "strict-origin-when-cross-origin";
          iframe.setAttribute(
            "allow",
            "autoplay; encrypted-media; fullscreen; picture-in-picture",
          );
          iframe.setAttribute("allowfullscreen", "");
        }
      })
      .catch(() => {
        if (active) {
          clearTimeout(timer);
          setState("network-error");
        }
      });
    return () => {
      active = false;
      clearTimeout(timer);
      try {
        player?.destroy();
      } catch {
        /* Removing the player stops playback even if its API is unavailable. */
      }
      if (container) container.textContent = "";
    };
  }, [video.key, video.name, title, attempt]);
  const failed = state.endsWith("error");
  return (
    <div
      className={`trailer-stage${failed ? " trailer-stage-error" : ""}`}
      aria-busy={state === "loading"}
    >
      <div className="youtube-holder" ref={holder} />
      {state === "loading" && (
        <div className="trailer-loading" role="status">
          <span className="trailer-spinner" />
          Loading trailer…
        </div>
      )}
      {failed && (
        <div className="trailer-error" role="alert">
          <h3>
            {state === "video-error"
              ? "This video can’t play inside the app."
              : "The player couldn’t load."}
          </h3>
          <p>
            {state === "video-error"
              ? "Try another video or use the YouTube link below."
              : "Check your connection, try again, or watch on YouTube."}
          </p>
          <button
            className="button button-secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
