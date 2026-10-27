import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export default function useTmdb(path) {
  const [state, setState] = useState({
    path,
    data: null,
    loading: Boolean(path),
    error: false,
    status: 0,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path) {
      setState({ path, data: null, loading: false, error: false, status: 0 });
      return;
    }
    let active = true;
    const cancel = axios.CancelToken.source();
    setState({ path, data: null, loading: true, error: false, status: 0 });
    axios
      .get(`https://api.themoviedb.org/3/${path}`, {
        params: { api_key: process.env.REACT_APP_API_KEY, language: "en-US" },
        cancelToken: cancel.token,
        timeout: 15000,
      })
      .then(({ data }) => {
        if (active)
          setState({ path, data, loading: false, error: false, status: 200 });
      })
      .catch((error) => {
        if (active && !axios.isCancel(error))
          setState({
            path,
            data: null,
            loading: false,
            error: true,
            status: error.response?.status || 0,
          });
      });
    return () => {
      active = false;
      cancel.cancel();
    };
  }, [path, attempt]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  // A changed query must never briefly show the previous query's response.
  const current =
    state.path === path
      ? state
      : { data: null, loading: Boolean(path), error: false, status: 0 };
  return { ...current, retry };
}
