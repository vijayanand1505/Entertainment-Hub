import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { buildPickPath, choosePick, pickRuntime } from "../utils/picks";
import { titleKey } from "../utils/library";
import { availableOnServices, isExcluded } from "../utils/personalization";
import { PICK_SESSION_KEY, readPickSession } from "../utils/pickSession";

export default function usePick({ feedback = [], streaming = null } = {}) {
  const preferencesRef = useRef({ feedback, streaming });
  preferencesRef.current = { feedback, streaming };
  const streamingKey = JSON.stringify(streaming);
  const [state, setState] = useState(() => ({
    ...readPickSession(),
    loading: false,
    error: false,
    empty: false,
  }));
  const active = useRef(null);
  const history = useRef({ query: state.query, seen: new Set(state.seen) });
  useEffect(() => {
    try {
      localStorage.setItem(
        PICK_SESSION_KEY,
        JSON.stringify({
          preferences: state.preferences,
          item: state.item,
          filters: state.filters,
          genreName: state.genreName,
          query: history.current.query,
          seen: [...history.current.seen],
        }),
      );
    } catch {
      // Storage restrictions should not prevent generating a recommendation.
    }
  }, [state]);
  useEffect(
    () => () => {
      active.current?.cancel();
      active.current = null;
    },
    [],
  );
  useEffect(() => {
    active.current?.cancel();
    active.current = null;
    setState((current) =>
      current.loading ? { ...current, loading: false } : current,
    );
  }, [streamingKey]);
  const updatePreferences = useCallback((patch) => {
    setState((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch },
    }));
  }, []);
  const pick = useCallback(async (filters, genres) => {
    active.current?.cancel();
    const cancel = axios.CancelToken.source();
    active.current = cancel;
    const criteria = {
      ...filters,
      streaming: preferencesRef.current.streaming,
    };
    const query = buildPickPath(criteria, genres);
    if (history.current.query !== query)
      history.current = { query, seen: new Set() };
    setState((current) => ({
      ...current,
      preferences: filters,
      loading: true,
      error: false,
      empty: false,
    }));
    const request = async (path) => {
      const { data } = await axios.get(`https://api.themoviedb.org/3/${path}`, {
        params: { api_key: process.env.REACT_APP_API_KEY, language: "en-US" },
        cancelToken: cancel.token,
        timeout: 15000,
      });
      return data;
    };
    try {
      const first = await request(query);
      if (active.current !== cancel) return;
      const total = Math.min(10, Number(first.total_pages) || 1);
      const page = 1 + Math.floor(Math.random() * total);
      const another =
        page > 1 ? await request(buildPickPath(criteria, genres, page)) : null;
      const candidates = [
        ...(another?.results || []),
        ...(first.results || []),
      ];
      let item = null;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        if (active.current !== cancel) return;
        const candidate = choosePick(
          candidates,
          filters.type,
          new Set([
            ...history.current.seen,
            ...preferencesRef.current.feedback
              .filter((entry) => entry.watched || entry.hidden)
              .map(titleKey),
          ]),
        );
        if (!candidate) break;
        if (criteria.streaming) {
          const providers = await request(
            `${filters.type}/${candidate.id}/watch/providers`,
          );
          if (active.current !== cancel) return;
          if (!availableOnServices(providers, criteria.streaming)) {
            history.current.seen.add(titleKey(candidate));
            continue;
          }
        }
        if (filters.minutes) {
          // Verify time-limited picks against the title’s own runtime metadata.
          const details = await request(`${filters.type}/${candidate.id}`);
          if (active.current !== cancel) return;
          const runtime = pickRuntime(details, filters.type);
          if (!runtime || runtime > Number(filters.minutes)) {
            history.current.seen.add(titleKey(candidate));
            continue;
          }
          item = { ...candidate, pick_runtime: runtime };
        } else item = candidate;
        if (isExcluded(candidate, preferencesRef.current.feedback)) {
          item = null;
          continue;
        }
        break;
      }
      if (active.current !== cancel) return;
      if (item) history.current.seen.add(titleKey(item));
      setState((current) => ({
        ...current,
        item: item || current.item,
        loading: false,
        error: false,
        empty: !item,
        filters: item ? criteria : current.filters,
        genreName: item
          ? genres.find((genre) => String(genre.id) === String(filters.genre))
              ?.name || ""
          : current.genreName,
      }));
    } catch (error) {
      if (active.current === cancel && !axios.isCancel(error))
        setState((current) => ({
          ...current,
          loading: false,
          error: true,
          empty: false,
        }));
    }
  }, []);
  const reset = useCallback(() => {
    active.current?.cancel();
    active.current = null;
    history.current = { query: "", seen: new Set() };
    setState((current) => ({
      ...current,
      item: null,
      loading: false,
      error: false,
      empty: false,
      filters: null,
      genreName: "",
    }));
  }, []);
  const item =
    state.item &&
    !isExcluded(state.item, feedback) &&
    JSON.stringify(state.filters?.streaming || null) === streamingKey
      ? state.item
      : null;
  return { ...state, item, pick, reset, updatePreferences };
}
