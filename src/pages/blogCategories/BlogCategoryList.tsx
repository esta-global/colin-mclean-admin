import { DataTable, GoBackButton, Pagination } from "../../components";
import {
  Column,
  Row,
  TableInstance,
  useFilters,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { deleteConfirmation, get, put, remove } from "../../utills";
import { toast } from "react-toastify";

export function BlogCategoryList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("All");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<T extends object> = TableInstance<T> & {
    selectedFlatRows: Row<T>[];
  };

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/blogCategories?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;

        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination({
            ...pagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          });
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery, needReload, status]
  );

  type Record = {
    name: any;
    slug: any;
    createdAt: any;
    status: any;
    id: any;
  };
  const columns: Column<Record>[] = React.useMemo(
    () => [
      {
        id: "selection",
        disableSortBy: true,
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <div>
            <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }: any) => (
          <div>
            <input type="checkbox" {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },

      {
        Header: "NAME",
        accessor: "name",
        Cell: ({ row, value }: any) => {
          return (
            <div className="blog-category-name-cell">
              <strong>{value}</strong>
              <span>{row.original.slug}</span>
            </div>
          );
        },
      },
      {
        Header: "SLUG",
        accessor: "slug",
        Cell: ({ value }: any) => {
          return <span className="blog-category-slug">{value}</span>;
        },
      },

      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MM-YYYY");
        },
      },
      {
        Header: "STATUS",
        accessor: "status",
        Cell: ({ value }: any) => {
          return (
            <div className="blog-category-status-cell">
              <span
                className={`blog-category-status-pill ${
                  value?.status ? "is-active" : "is-disabled"
                }`}
              >
                {value?.status ? "Active" : "Disabled"}
              </span>
              <input
                className="form-check-input custom-switch blog-category-status-switch"
                type="checkbox"
                role="switch"
                id="customSwitch"
                checked={value?.status === true ? true : false}
                style={{ width: "3rem", height: "1.5rem" }}
                onChange={(evt) => {
                  handleUpdateStatus(value?._id, evt.target.checked);
                }}
              />
            </div>
          );
        },
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div className="blog-category-action-cell">
              <Link
                className="blog-category-icon-action"
                to={{
                  pathname: `/blogCategories/edit/${value}`,
                }}
                title="Edit category"
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <button
                type="button"
                className="btn blog-category-icon-action blog-category-icon-action--danger"
                data-toggle="modal"
                data-target="#deleteModal"
                title="Delete category"
                onClick={() => {
                  handleDeleteData(value);
                }}
              >
                <span
                  className="fas fa-trash-alt text-danger"
                  aria-hidden="true"
                ></span>
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        name: data.name,
        slug: data.slug,
        createdAt: data.createdAt,
        status: data,
        id: data._id,
      };
    });
  }, [records]);

  const { getTableProps, headerGroups, rows, prepareRow, selectedFlatRows } =
    useTable(
      { columns, data },
      useFilters,
      useSortBy,
      usePagination,
      useRowSelect

      // Use a custom hook to add selection functionality
      // (hooks) => {
      //   hooks.visibleColumns.push((columns) => [
      //     {
      //       id: "selection",
      //       disableSortBy: true,
      //       Header: ({ getToggleAllRowsSelectedProps }) => (
      //         <div>
      //           <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
      //         </div>
      //       ),
      //       Cell: ({ row }) => (
      //         <div>
      //           <input type="checkbox" {...row.getToggleRowSelectedProps()} />
      //         </div>
      //       ),
      //     },
      //     ...columns,
      //   ]);
      // }
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/blogCategories`, recordId);
    } else {
      apiResponse = await remove(`/blogCategories/${recordId}`);
    }

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    const selectedData = selectedFlatRows.map((row: any) => row?.original?.id);
    return selectedData;
  }

  // handleSetStatus
  function handleSetStatus(
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setStatus(evt.target.value);
  }

  async function handleUpdateStatus(id: string, value: boolean) {
    let url = `/blogCategories/${id}`;

    const apiResponse = await put(url, { status: value });
    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  return (
    <div className="content-wrapper blog-category-admin-page">
      <div className="blog-category-page-header">
        <div>
          <div className="blog-category-page-header__actions">
            <GoBackButton />
            <span className="blog-category-page-eyebrow">
              IFMA Workspace
            </span>
          </div>
          <h1>Blog Categories</h1>
          <p>Manage categories used to organize IFMA blog content.</p>
        </div>
        <Link
          to={"/blogCategories/add"}
          type="button"
          className="btn btn-primary blog-category-primary-action"
        >
          Add Category
        </Link>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card blog-category-table-card">
            <div className="blog-category-toolbar">
              <div className="blog-category-search-wrap">
                <i className="ti-search"></i>
                <input
                  placeholder="Search categories, slugs"
                  className="form-control"
                  type="search"
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(evt.target.value)
                  }
                />
              </div>
              <div className="blog-category-toolbar-actions">
                {selectedFlatRows.length ? (
                  <button
                    type="button"
                    className="blog-category-bulk-delete"
                    title="Delete selected"
                    onClick={() => {
                      handleDeleteData(handleSelectedRows());
                    }}
                  >
                    <i className="fas fa-trash-alt text-danger"></i>
                  </button>
                ) : null}

                <select
                  className="form-control blog-category-status-select"
                  value={String(status)}
                  onChange={handleSetStatus}
                  aria-label="Filter blog categories by status"
                >
                  <option value="All">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div className="card-body shadow-none">
              <div className="table-responsive blog-category-table-wrap">
                {/* Data Table */}
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
              </div>
              <div className="blog-category-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"blog-categories"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
