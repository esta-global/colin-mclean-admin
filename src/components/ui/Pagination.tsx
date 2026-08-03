export function Pagination(props: any) {
  const { pagination, setPagination } = props;

  const currentPage = Number(pagination.page) || 1;
  const totalPages = Number(pagination.totalPages) || 0;
  const totalRecords = Number(pagination.totalRecords) || 0;
  const limit = Number(pagination.limit) || 10;
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord =
    totalRecords === 0 ? 0 : Math.min(currentPage * limit, totalRecords);

  const limitHandler = (e: any) => {
    const limit = e.target.value;
    setPagination({
      ...pagination,
      limit,
      page: 1,
    });
  };

  const pageHandler = (e: any, page: number) => {
    e.preventDefault();
    setPagination({
      ...pagination,
      page: page,
    });
  };

  const previousPageHandler = (e: any) => {
    e.preventDefault();
    setPagination({
      ...pagination,
      page: currentPage >= 2 ? currentPage - 1 : 1,
    });
  };

  const nextPageHandler = (e: any) => {
    e.preventDefault();
    setPagination({
      ...pagination,
      page: currentPage < totalPages ? currentPage + 1 : totalPages,
    });
  };

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>([
      1,
      2,
      totalPages - 1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="ss-pagination">
      <div className="ss-pagination__summary">
        <span>
          Showing {startRecord}-{endRecord} of {totalRecords}
        </span>
      </div>

      <div className="ss-pagination__controls">
        <label className="ss-pagination__limit">
          <span>Rows per page</span>
          <select
            value={pagination.limit}
            className="form-control"
            onChange={limitHandler}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            {totalRecords > 0 ? (
              <option value={pagination.totalRecords}>All</option>
            ) : null}
          </select>
        </label>

        <nav className="ss-pagination__nav" aria-label="Pagination">
          <button
            type="button"
            className="ss-pagination__button ss-pagination__button--wide"
            disabled={currentPage <= 1}
            aria-label="Previous page"
            onClick={previousPageHandler}
          >
            <i className="fa fa-chevron-left"></i>
            <span>Previous</span>
          </button>

          <div className="ss-pagination__pages">
            {visiblePages.map((page, index) => {
              const previousPage = visiblePages[index - 1];
              const showGap = previousPage && page - previousPage > 1;

              return (
                <div className="ss-pagination__page-group" key={page}>
                  {showGap ? (
                    <span className="ss-pagination__ellipsis">...</span>
                  ) : null}
                  <button
                    type="button"
                    className={`ss-pagination__button ${
                      currentPage === page ? "is-active" : ""
                    }`}
                    aria-current={currentPage === page ? "page" : undefined}
                    onClick={(e) => pageHandler(e, page)}
                  >
                    {page}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="ss-pagination__button ss-pagination__button--wide"
            disabled={totalPages === 0 || currentPage >= totalPages}
            aria-label="Next page"
            onClick={nextPageHandler}
          >
            <span>Next</span>
            <i className="fa fa-chevron-right"></i>
          </button>
        </nav>
      </div>
    </div>
  );
}
