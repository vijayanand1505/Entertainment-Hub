import Pagination from "@material-ui/lab/Pagination";
export default function CustomPagination({ page, setPage, numOfPages = 10 }) {
  return (
    <nav className="pagination" aria-label="Browse result pages">
      <Pagination
        page={page}
        count={numOfPages}
        siblingCount={0}
        boundaryCount={1}
        color="primary"
        onChange={(_, nextPage) => {
          setPage(nextPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </nav>
  );
}
