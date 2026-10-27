import useTmdb from "./useTmdb";

export default function useCatalog(path) {
  const { data, loading, error, retry } = useTmdb(path);
  return {
    content: data?.results || [],
    pages: Math.min(data?.total_pages || 0, 500),
    total: data?.total_results || 0,
    loading,
    error,
    retry,
  };
}
