import useTmdb from "./useTmdb";
const EMPTY = [];

export default function useCatalog(path) {
  const { data, loading, error, retry } = useTmdb(path);
  return {
    content: data?.results || EMPTY,
    pages: Math.min(data?.total_pages || 0, 500),
    total: data?.total_results || 0,
    loading,
    error,
    retry,
  };
}
