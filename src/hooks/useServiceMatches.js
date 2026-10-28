import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { availableOnServices } from "../utils/personalization";
import { titleKey } from "../utils/library";

const cache = new Map();
export default function useServiceMatches(items, type, streaming) {
  const key = JSON.stringify({
    candidates: items
      .slice(0, 20)
      .map((item) => ({ id: item.id, media_type: item.media_type || type })),
    streaming,
  });
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ key: "", allowed: [], error: false });
  useEffect(() => {
    const { candidates, streaming: selected } = JSON.parse(key);
    if (!selected || !candidates.length) return;
    let active = true;
    const cancel = axios.CancelToken.source();
    (async () => {
      try {
        const allowed = [];
        for (let index = 0; index < candidates.length; index += 4) {
          const batch = await Promise.all(
            candidates.slice(index, index + 4).map(async (item) => {
              const cacheKey = `${selected.region}:${titleKey(item)}`;
              let entry = cache.get(cacheKey);
              if (!entry || entry.expires < Date.now()) {
                const { data } = await axios.get(
                  `https://api.themoviedb.org/3/${item.media_type}/${item.id}/watch/providers`,
                  {
                    params: { api_key: process.env.REACT_APP_API_KEY },
                    cancelToken: cancel.token,
                    timeout: 15000,
                  },
                );
                entry = { data, expires: Date.now() + 5 * 60 * 1000 };
                if (cache.size > 500) cache.clear();
                cache.set(cacheKey, entry);
              }
              return availableOnServices(entry.data, selected)
                ? titleKey(item)
                : null;
            }),
          );
          if (!active) return;
          allowed.push(...batch.filter(Boolean));
        }
        if (active) setState({ key, allowed, error: false });
      } catch (error) {
        if (active && !axios.isCancel(error))
          setState({ key, allowed: [], error: true });
      }
    })();
    return () => {
      active = false;
      cancel.cancel();
    };
  }, [key, attempt]);
  const retry = useCallback(() => {
    setState({ key: "", allowed: [], error: false });
    setAttempt((value) => value + 1);
  }, []);
  if (!streaming || !items.length)
    return { content: items, loading: false, error: false, retry };
  const current = state.key === key;
  return {
    content: current
      ? items.filter((item) =>
          state.allowed.includes(
            titleKey({ ...item, media_type: item.media_type || type }),
          ),
        )
      : [],
    loading: !current,
    error: current && state.error,
    retry,
  };
}
