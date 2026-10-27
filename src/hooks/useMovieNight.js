import { useCallback, useEffect, useRef, useState } from "react";
import {
  forgetRoom,
  nightRequest,
  rememberRoom,
  roomSession,
} from "../utils/movieNight";
export default function useMovieNight(code) {
  const [token, setToken] = useState(() => roomSession(code)?.token || "");
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(Boolean(code));
  const [connectionError, setConnectionError] = useState("");
  const [fatal, setFatal] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [persistent, setPersistent] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const revision = useRef(0);
  const acting = useRef(false);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  useEffect(() => {
    if (!code) return;
    let active = true;
    let fetching = false;
    let timer;
    const controller = new AbortController();
    const poll = async () => {
      if (!active || fetching) return;
      if (!document.hidden && !acting.current) {
        const version = revision.current;
        fetching = true;
        try {
          const next = await nightRequest("/rooms/" + code, {
            token,
            signal: controller.signal,
          });
          if (active && revision.current === version) {
            setRoom(next);
            setConnectionError("");
            setFatal(false);
            setLoading(false);
          }
        } catch (error) {
          if (
            !active ||
            controller.signal.aborted ||
            revision.current !== version
          )
            return;
          if (error.status === 403 && token) {
            forgetRoom(code);
            setToken("");
            setRoom(null);
            setError(error.message);
            return;
          }
          setConnectionError(error.message);
          setLoading(false);
          if ([404, 410].includes(error.status)) {
            setFatal(true);
            setRoom(null);
            return;
          }
        } finally {
          fetching = false;
        }
      }
      if (active) timer = setTimeout(poll, 2000);
    };
    const resume = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        poll();
      }
    };
    poll();
    document.addEventListener("visibilitychange", resume);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [code, token, attempt]);
  const act = useCallback(
    async (action, method = "POST", data = {}) => {
      if (acting.current) return null;
      acting.current = true;
      revision.current++;
      setBusy(true);
      setError("");
      try {
        const next = await nightRequest(`/rooms/${code}/${action}`, {
          token,
          method,
          ...(method !== "DELETE" ? { data } : {}),
        });
        if (mounted.current) {
          revision.current++;
          setRoom(next);
          setConnectionError("");
        }
        return next;
      } catch (error) {
        if (mounted.current) setError(error.message);
        return null;
      } finally {
        acting.current = false;
        if (mounted.current) setBusy(false);
      }
    },
    [code, token],
  );
  const join = useCallback(
    async (values) => {
      if (acting.current) return;
      acting.current = true;
      revision.current++;
      setBusy(true);
      setError("");
      try {
        const result = await nightRequest(`/rooms/${code}/join`, {
          method: "POST",
          data: values,
        });
        if (mounted.current) {
          setPersistent(rememberRoom(result.room, result.token));
          setToken(result.token);
          setRoom(result.room);
          setConnectionError("");
        }
      } catch (error) {
        if (mounted.current) setError(error.message);
      } finally {
        acting.current = false;
        if (mounted.current) setBusy(false);
      }
    },
    [code],
  );
  return {
    room,
    loading,
    connectionError,
    fatal,
    error,
    busy,
    persistent,
    act,
    join,
    clearError: () => setError(""),
    retry: () => {
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
