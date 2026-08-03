import {
  DataTable,
  GoBackButton,
  OverlayLoading,
  Pagination,
} from "../../components";
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
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";
import { DateRangePicker } from "react-date-range";
import { enUS } from "date-fns/locale";

export function UserList() {
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
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    key: "selection",
  });

  function handleSelectDateRange(ranges: any) {
    setSelectionRange(ranges.selection);
  }

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/users?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;
        if (selectionRange.startDate)
          url += `&startDate=${selectionRange.startDate}`;
        if (selectionRange.endDate) url += `&endDate=${selectionRange.endDate}`;

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
    [
      pagination.page,
      pagination.limit,
      searchQuery,
      needReload,
      status,
      selectionRange,
    ],
  );

  type Record = {
    name: string;
    mobile: string;
    email: string;
    listings: number;
    createdAt: string;
    status: boolean;
    validity: string;
    id: string;
  };

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<Record extends object> =
    TableInstance<Record> & {
      selectedFlatRows: Row<Record>[];
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
        Cell: ({ value }: any) => {
          return (
            <div className="marketplace-name-cell">
              <strong>{value || "N/A"}</strong>
            </div>
          );
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
        Header: "LISTINGS",
        accessor: "listings",
        Cell: ({ value }: any) => {
          return <span className="badge bg-info">{value ?? 0}</span>;
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
          const status: boolean = value;
          return (
            <span
              className={`marketplace-status-pill ${
                status ? "is-active" : "is-disabled"
              }`}
            >
              {status ? "Active" : "Disabled"}
            </span>
          );
        },
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div className="marketplace-action-cell">
              <Link
                className="marketplace-icon-action"
                to={{
                  pathname: `/users/edit/${value}`,
                }}
                title="Edit user"
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="marketplace-icon-action user-icon-action--view"
                to={{
                  pathname: `/users/details/${value}`,
                }}
                title="View user"
              >
                <span
                  className="fas fa-eye"
                  aria-hidden="true"
                ></span>
              </Link>

              <button
                type="button"
                className="btn marketplace-icon-action marketplace-icon-action--danger"
                data-toggle="modal"
                data-target="#deleteModal"
                title="Delete user"
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
    [],
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        listings: data.totalListings ? data.totalListings : 0,
        createdAt: data.createdAt,
        status: data.status,
        validity: `${moment(data.startDate).format("DD-MMM-YYYY")} to ${moment(
          data.expiryDate,
        ).format("DD-MMM-YYYY")}`,
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
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/users`, recordId);
    } else {
      apiResponse = await remove(`/users/${recordId}`);
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

  return (
    <div className="content-wrapper marketplace-admin-page user-admin-page">
      {loading ? <OverlayLoading /> : null}

      <div className="marketplace-page-header">
        <div>
          <div className="marketplace-page-header__actions">
            <GoBackButton />
            <span className="marketplace-page-eyebrow">
              IFMA Workspace
            </span>
          </div>
          <h1>Users</h1>
          <p>Manage customer accounts, activity status, and signup records.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card marketplace-table-card">
            <div className="marketplace-toolbar user-toolbar">
              <div className="user-filter-group">
                <div className="user-date-filter">
                  <button
                    type="button"
                    className="user-date-trigger"
                    onClick={() => {
                      setCalendarVisible(!isCalendarVisible);
                    }}
                  >
                    <i className="ti-calendar" aria-hidden="true"></i>
                    <span>{`${moment(selectionRange.startDate).format(
                      "ddd MMM DD YYYY",
                    )} - ${moment(selectionRange.endDate).format(
                      "ddd MMM DD YYYY",
                    )}`}</span>
                  </button>

                  {isCalendarVisible && (
                    <div className="user-calendar-popover">
                      <DateRangePicker
                        ranges={[selectionRange]}
                        onChange={(ranges) => {
                          handleSelectDateRange(ranges);
                        }}
                        locale={enUS}
                        minDate={new Date("2024-01-01")}
                        maxDate={new Date("2028-12-31")}
                        direction="horizontal"
                        editableDateInputs={true}
                        scroll={{ enabled: false }}
                        dateDisplayFormat="dd/MM/yyyy"
                        rangeColors={["#1473ff"]}
                      />

                      <div className="user-calendar-actions">
                        <button
                          type="button"
                          className="btn marketplace-primary-action"
                          onClick={() => {
                            setCalendarVisible(false);
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="marketplace-search-wrap user-search-wrap">
                  <i className="ti-search"></i>
                  <input
                    placeholder="Search users, emails, mobile"
                    className="form-control"
                    type="search"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
                </div>
              </div>

              <div className="marketplace-toolbar-actions">
                {selectedFlatRows.length ? (
                  <button
                    type="button"
                    className="marketplace-bulk-delete"
                    title="Delete selected"
                    onClick={() => {
                      handleDeleteData(handleSelectedRows());
                    }}
                  >
                    <i className="fas fa-trash-alt text-danger"></i>
                  </button>
                ) : null}

                <select
                  className="form-control marketplace-status-select"
                  value={String(status)}
                  onChange={handleSetStatus}
                  aria-label="Filter users by status"
                >
                  <option value="All">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>

            <div className="card-body shadow-none">
              <div className="table-responsive marketplace-table-wrap">
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
              </div>
              <div className="marketplace-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"users"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
