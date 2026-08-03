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

export function AuthorList() {
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
        let url = `/authors?page=${pagination.page}&limit=${pagination.limit}`;
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
    mobile: any;
    email: any;
    image: string;
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
        accessor: "image",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          if (value) {
            return (
              <div className="author-avatar-cell">
                <img className="author-avatar" src={value} alt="Author" />
              </div>
            );
          } else {
            return null;
          }
        },
      },

      {
        Header: "NAME",
        accessor: "name",
        Cell: ({ value }: any) => {
          return <strong className="author-name-text">{value}</strong>;
        },
      },
      {
        Header: "MOBILE",
        accessor: "mobile",
      },

      {
        Header: "EMAIL",
        accessor: "email",
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
            <div className="author-status-cell">
              <span
                className={`author-status-pill ${
                  value?.status ? "is-active" : "is-disabled"
                }`}
              >
                {value?.status ? "Active" : "Disabled"}
              </span>
              <input
                className="form-check-input custom-switch author-status-switch"
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
            <div className="author-action-cell">
              <Link
                className="author-icon-action"
                to={{
                  pathname: `/authors/edit/${value}`,
                }}
                title="Edit author"
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <button
                type="button"
                className="btn author-icon-action author-icon-action--danger"
                data-toggle="modal"
                data-target="#deleteModal"
                title="Delete author"
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
        mobile: data.mobile,
        email: data.email,
        image: addUrlToFile(data?.profilePhoto),
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
      apiResponse = await remove(`/authors`, recordId);
    } else {
      apiResponse = await remove(`/authors/${recordId}`);
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
    let url = `/authors/${id}`;

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
    <div className="content-wrapper author-admin-page">
      <div className="author-page-header">
        <div>
          <div className="author-page-header__actions">
            <GoBackButton />
            <span className="author-page-eyebrow">IFMA Workspace</span>
          </div>
          <h1>Authors</h1>
          <p>Manage writers, contact details, and blog author availability.</p>
        </div>
        <Link
          to={"/authors/add"}
          type="button"
          className="btn btn-primary author-primary-action"
        >
          Add Author
        </Link>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card author-table-card">
            <div className="author-toolbar">
              <div className="author-search-wrap">
                <i className="ti-search"></i>
                <input
                  placeholder="Search authors, email, mobile"
                  className="form-control"
                  type="search"
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(evt.target.value)
                  }
                />
              </div>
              <div className="author-toolbar-actions">
                {selectedFlatRows.length ? (
                  <button
                    type="button"
                    className="author-bulk-delete"
                    title="Delete selected"
                    onClick={() => {
                      handleDeleteData(handleSelectedRows());
                    }}
                  >
                    <i className="fas fa-trash-alt text-danger"></i>
                  </button>
                ) : null}

                <select
                  className="form-control author-status-select"
                  value={String(status)}
                  onChange={handleSetStatus}
                  aria-label="Filter authors by status"
                >
                  <option value="All">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div className="card-body shadow-none">
              <div className="table-responsive author-table-wrap">
                {/* Data Table */}
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
              </div>
              <div className="author-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"authors"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
