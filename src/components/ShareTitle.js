import { useEffect, useRef, useState } from "react";
import LinkRoundedIcon from "@material-ui/icons/LinkRounded";
import CheckRoundedIcon from "@material-ui/icons/CheckRounded";
import { titlePath } from "../utils/titleUrls";

export default function ShareTitle({ type, id }) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const timer = useRef(null);
  const field = useRef(null);
  const url = window.location.origin + titlePath(type, id);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    setCopied(false);
    setManual(false);
    clearTimeout(timer.current);
  }, [type, id]);
  useEffect(() => {
    if (manual) {
      field.current?.focus();
      field.current?.select();
    }
  }, [manual]);
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setManual(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 3000);
    } catch {
      setManual(true);
    }
  };
  return (
    <div className="share-title">
      <button
        className="button button-secondary"
        onClick={copy}
        aria-label={copied ? "Title link copied" : "Copy title link"}
      >
        {copied ? <CheckRoundedIcon /> : <LinkRoundedIcon />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      {copied && (
        <span className="sr-only" role="status">
          Title link copied
        </span>
      )}
      {manual && (
        <label className="share-manual">
          Select and copy this title link
          <input
            ref={field}
            aria-label="Title link"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
          />
        </label>
      )}
    </div>
  );
}
