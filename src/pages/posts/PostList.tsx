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
import { addUrlToFile } from "../../utills/addUrlToFile";
import { ContentType } from "../../validationSchemas/postSchema";

type ContentListLabels = {
  eyebrow: string;
  title: string;
  description: string;
  addText: string;
  searchPlaceholder: string;
  csvFileName: string;
};

const contentListLabels: Record<ContentType, ContentListLabels> = {
  blog: {
    eyebrow: "Content",
    title: "Blogs",
    description: "Manage blog posts, visibility, and publishing status.",
    addText: "Add Blog",
    searchPlaceholder: "Search blogs",
    csvFileName: "blogs",
  },
  essay: {
    eyebrow: "Essays",
    title: "Essays",
    description: "Manage essay articles, visibility, and publishing status.",
    addText: "Add Essay",
    searchPlaceholder: "Search essays",
    csvFileName: "essays",
  },
};

function contentPaths(type: ContentType) {
  return type === "essay"
    ? { list: "/essays", add: "/essays/add", edit: "/essays/edit", details: "/essays/details" }
    : { list: "/posts", add: "/posts/add", edit: "/posts/edit", details: "/posts/details" };
}

export function PostList({ defaultType = "blog" }: { defaultType?: ContentType }) {
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
  const labels = contentListLabels[defaultType];
  const paths = contentPaths(defaultType);

  useEffect(() => {
    setRecords([]);
    setSearchQuery("");
    setStatus("All");
    setPagination((old) => ({
      ...old,
      page: 1,
      totalRecords: 0,
      totalPages: 0,
    }));
  }, [defaultType]);

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<T extends object> = TableInstance<T> & {
    selectedFlatRows: Row<T>[];
  };

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
          type: defaultType,
        });
        if (searchQuery.trim()) params.set("searchQuery", searchQuery.trim());
        if (status) params.set("status", String(status));

        const apiResponse = await get(`/blogs?${params.toString()}`, true);
        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination((old) => ({
            ...old,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          }));
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      }

      getData();
    },
    [defaultType, pagination.page, pagination.limit, searchQuery, needReload, status],
  );

  type Record = {
    title: any;
    // slug: any;
    coverImage?: string;
    image?: string;
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
        Header: "",
        accessor: "coverImage",
        disableSortBy: true,
        Cell: ({ row, value }: any) => {
          const img = addUrlToFile(value || row.original?.coverImage || row.original?.image);
          if (img) {
            return (
              <div className="post-thumb-cell">
                <img className="post-thumb" src={img} alt="Post cover" />
              </div>
            );
          } else {
            return (
              <div className="post-thumb-cell">
                <span className="post-thumb-placeholder">
                  <i className="fa fa-image"></i>
                </span>
              </div>
            );
          }
        },
      },

      {
        Header: "TITLE",
        accessor: "title",
        Cell: ({ value }: any) => {
          return <strong className="post-title-text">{value}</strong>;
        },
      },
      // {
      //   Header: "SLUG",
      //   accessor: "slug",
      // },

      {
        Header: "DATE",
        accessor: "date",
        Cell: ({ row, value }: any) => {
          const dateVal = value || row.original?.createdAt;
          if (!dateVal) return "-";
          const m = moment(new Date(dateVal));
          return m.isValid() ? m.format("DD-MM-YYYY") : value;
        },
      },
      {
        Header: "STATUS",
        accessor: "status",
        Cell: ({ value }: any) => {
          return (
            <div className="post-status-cell">
              <span
                className={`post-status-pill ${
                  value?.status ? "is-active" : "is-disabled"
                }`}
              >
                {value?.status ? "Active" : "Disabled"}
              </span>
              <input
                className="form-check-input custom-switch post-status-switch"
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
            <div className="post-action-cell">
              <Link
                className="post-icon-action"
                to={{
                  pathname: `${paths.edit}/${value}`,
                }}
                title="Edit post"
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="post-icon-action post-icon-action--view"
                to={{
                  pathname: `${paths.details}/${value}`,
                }}
                title="View post"
              >
                <span className="fas fa-eye" aria-hidden="true"></span>
              </Link>

              <button
                type="button"
                className="btn post-icon-action post-icon-action--danger"
                data-toggle="modal"
                data-target="#deleteModal"
                title="Delete post"
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
    [paths.details, paths.edit],
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        title: data.title,
        // slug: data.slug,
        image: addUrlToFile(data.coverImage),
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
      useRowSelect,

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
      apiResponse = await remove(`/blogs`, recordId);
    } else {
      apiResponse = await remove(`/blogs/${recordId}`);
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
    let url = `/blogs/${id}`;

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
    <div className="content-wrapper post-admin-page">
      <div className="post-page-header">
        <div>
          <div className="post-page-header__actions">
            <GoBackButton />
            <span className="post-page-eyebrow">{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
        <Link
          to={paths.add}
          type="button"
          className="btn btn-primary post-primary-action"
        >
          {labels.addText}
        </Link>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card post-table-card">
            <div className="post-toolbar">
              <div className="post-search-wrap">
                <i className="ti-search"></i>
                <input
                  placeholder={labels.searchPlaceholder}
                  className="form-control"
                  type="search"
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(evt.target.value)
                  }
                />
              </div>
              <div className="post-toolbar-actions">
                {selectedFlatRows.length ? (
                  <button
                    type="button"
                    className="post-bulk-delete"
                    title="Delete selected"
                    onClick={() => {
                      handleDeleteData(handleSelectedRows());
                    }}
                  >
                    <i className="fas fa-trash-alt text-danger"></i>
                  </button>
                ) : null}

                <select
                  className="form-control post-status-select"
                  value={String(status)}
                  onChange={handleSetStatus}
                  aria-label="Filter posts by status"
                >
                  <option value="All">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div className="card-body shadow-none">
              <div className="table-responsive post-table-wrap">
                {/* Data Table */}
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
              </div>
              <div className="post-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={labels.csvFileName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
