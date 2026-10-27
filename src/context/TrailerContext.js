import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import Dialog from "@material-ui/core/Dialog";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import OpenInNewRoundedIcon from "@material-ui/icons/OpenInNewRounded";
import YouTubePlayer from "../components/YouTubePlayer";
import { playableVideos } from "../utils/videos";
import useTmdb from "../hooks/useTmdb";
import "../components/TrailerPlayer.css";

const TrailerContext = createContext(null);
export function useTrailer() {
  const open = useContext(TrailerContext);
  if (!open) throw new Error("useTrailer requires TrailerProvider");
  return open;
}
export function TrailerProvider({ children }) {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const openTrailer = useCallback(({ title, videos, type, id }) => {
    const playable = playableVideos(videos);
    if (!playable.length && !id) return;
    setSession({ title, videos: playable.length ? playable : null, type, id });
    setSelected(0);
    setOpen(true);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.key]);
  const request = useTmdb(
    open && session?.id && !session.videos
      ? `${session.type}/${session.id}/videos`
      : null,
  );
  const videos = session?.videos || playableVideos(request.data?.results);
  const video = videos[selected];
  return (
    <TrailerContext.Provider value={openTrailer}>
      {children}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        style={{ zIndex: 1450 }}
        PaperProps={{ className: "trailer-dialog" }}
        aria-labelledby="trailer-heading"
      >
        {session && (
          <>
            <div className="trailer-heading">
              <div>
                <span className="eyebrow">TAKE A FIRST LOOK</span>
                <h2 id="trailer-heading">{session.title}</h2>
              </div>
              <button
                className="trailer-close"
                aria-label="Close trailer player"
                onClick={() => setOpen(false)}
                autoFocus
              >
                <CloseRoundedIcon />
              </button>
            </div>
            {request.loading && (
              <div className="trailer-stage trailer-pending" role="status">
                Finding a trailer…
              </div>
            )}
            {request.error && (
              <div className="trailer-stage trailer-pending" role="alert">
                <p>We couldn’t load the trailer. Please try again.</p>
                <button className="button" onClick={request.retry}>
                  Try again
                </button>
              </div>
            )}
            {!request.loading && !request.error && !video && (
              <div className="trailer-stage trailer-pending">
                <h3>No trailer available yet</h3>
                <p>Explore the title details for more about this story.</p>
                <button
                  className="button button-secondary"
                  onClick={() => setOpen(false)}
                >
                  Back to browsing
                </button>
              </div>
            )}
            {open && video && (
              <YouTubePlayer
                key={video.key}
                video={video}
                title={session.title}
              />
            )}
            {video && (
              <div className="trailer-footer">
                <div className="trailer-video-choice">
                  {videos.length > 1 ? (
                    <label>
                      Choose a video
                      <select
                        aria-label="Choose trailer video"
                        value={selected}
                        onChange={(event) =>
                          setSelected(Number(event.target.value))
                        }
                      >
                        {videos.map((item, index) => (
                          <option key={item.key} value={index}>
                            {item.name || item.type || `Video ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <span>{video?.name || "Official trailer"}</span>
                  )}
                </div>
                <a
                  className="text-link"
                  href={`https://www.youtube.com/watch?v=${video?.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                  <OpenInNewRoundedIcon />
                </a>
              </div>
            )}
          </>
        )}
      </Dialog>
    </TrailerContext.Provider>
  );
}
