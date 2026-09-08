import { DataTable, GoBackButton, Pagination } from "../../components";
import {
  Column,
  HeaderProps,
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
import { Link, useNavigate } from "react-router-dom";
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";

export function InquiryList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("ALL");
  const [position, setposition] = useState<string>("ALL");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
          inquiryStatus: status,
          position,
        });
        if (searchQuery.trim()) params.set("searchQuery", searchQuery.trim());

        const apiResponse = await get(`/inquiries?${params.toString()}`, true);

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
    [
      pagination.page,
      pagination.limit,
      searchQuery,
      needReload,
      status,
      position,
    ]
  );

  type InquiryStatus = "PENDING" | "RESOLVED";

  type Record = {
    name: string;
    mobile: string;
    email: string;
    position: "ALL" | "HOME_PAGE" | "CONTACT_PAGE" | "OTHER_PAGE" | "ADMIN" | "BECOME_DEALER_PAGE";
    createdAt: string;
    inquiryStatus: InquiryStatus;
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
        Header: "POSITION",
        accessor: "position",
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
        accessor: "inquiryStatus",
        Cell: ({ value }: any) => {
          const inquiryStatus: InquiryStatus = value;
          return (
            <>
              {inquiryStatus === "PENDING" ? (
                <span className="badge bg-danger">Pending</span>
              ) : (
                <span className="badge bg-success">Resolved</span>
              )}
            </>
          );
        },
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div className="d-flex gap-1">
              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/inquiries/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="p-2 bg-light text-warning"
                to={{
                  pathname: `/inquiries/details/${value}`,
                }}
              >
                <span className="fas fa-eye" aria-hidden="true"></span>
              </Link>

              <button
                type="button"
                className="btn p-2 bg-light"
                data-toggle="modal"
                data-target="#deleteModal"
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
        position: data.position,
        createdAt: data.createdAt,
        inquiryStatus: data.inquiryStatus,
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
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/inquiries`, recordId);
    } else {
      apiResponse = await remove(`/inquiries/${recordId}`);
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
  function handleSetStatus(evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setStatus(evt.target.value);
  }

  // handleSetposition
  function handleSetposition(evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setposition(evt.target.value);
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Inquiries</h4>
            </div>
            <div>
              <Link
                to={"/inquiries/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add Inquiry
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card rounded-2">
            <div className="card-body shadow-none">
              <div className="row mb-2 gy-2">
                <div className="col-md-8">
                  <div className="post-search-wrap">
                    <i className="ti-search"></i>
                    <input
                      placeholder="Search inquiries"
                      className="form-control py-2"
                      type="search"
                      value={searchQuery}
                      onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(evt.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="col-md-4 d-flex gap-2 justify-content-md-end">
                  {/* <button className="btn p-2 bg-light border">
                    <i className="ti-search"></i>
                  </button> */}
                  {selectedFlatRows.length ? (
                    <button
                      className="btn p-2 bg-light border"
                      onClick={() => {
                        handleDeleteData(handleSelectedRows());
                      }}
                    >
                      <i className="fas fa-trash-alt text-danger"></i>
                    </button>
                  ) : null}

                  <select className="form-control post-status-select" value={position} onChange={handleSetposition} aria-label="Filter inquiries by source">
                    <option value="ALL">All sources</option>
                    <option value="HOME_PAGE">Home page</option>
                    <option value="CONTACT_PAGE">Contact page</option>
                    <option value="OTHER_PAGE">Other page</option>
                    <option value="ADMIN">Admin</option>
                    <option value="BECOME_DEALER_PAGE">Become dealer page</option>
                  </select>

                  <select className="form-control post-status-select" value={status} onChange={handleSetStatus} aria-label="Filter inquiries by status">
                    <option value="ALL">All status</option>
                    <option value="PENDING">Pending</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                {/* Data Table */}
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
                {/* Pagination */}
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"inquiries"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
