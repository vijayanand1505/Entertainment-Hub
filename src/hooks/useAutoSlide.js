import { useCallback, useEffect, useState } from "react";

export default function useAutoSlide(count, enabled, source) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [selection, setSelection] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [source]);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!enabled || count < 2 || !playing || hovered || focused || !visible)
      return;
    const timer = window.setInterval(() => {
      // Keep the originating slide in place while its details or another dialog is open.
      if (!document.querySelector('[role="dialog"]'))
        setIndex((current) => (current + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [
    count,
    enabled,
    playing,
    hovered,
    focused,
    visible,
    index,
    selection,
    source,
  ]);

  const select = useCallback((next) => {
    setIndex(next);
    setSelection((current) => current + 1);
  }, []);
  return {
    index: index < count ? index : 0,
    select,
    playing,
    togglePlaying: () => setPlaying((current) => !current),
    setHovered,
    setFocused,
  };
}
