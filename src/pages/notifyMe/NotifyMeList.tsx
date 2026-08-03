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
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function NotifyMeList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("All");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/notifyMe?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status && status !== "All") url += `&notifyStatus=${status}`;

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
    [pagination.page, pagination.limit, searchQuery, needReload, status],
  );

  type NotifyMeRow = {
    name: string;
    email: string;
    mobile: string;
    product: any;
    notifyStatus: string;
    createdAt: string;
    id: string;
  };

  type TableInstanceWithRowSelect<TData extends object> =
    TableInstance<TData> & {
      selectedFlatRows: Row<TData>[];
    };

  const columns: Column<NotifyMeRow>[] = React.useMemo(
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
        Header: "EMAIL",
        accessor: "email",
      },
      {
        Header: "MOBILE",
        accessor: "mobile",
      },
      {
        Header: "PRODUCT",
        accessor: "product",
        Cell: ({ value }: any) => (
          <div className="d-flex align-items-center gap-2">
            <img
              src={value?.image || "/images/select-photo.png"}
              alt=""
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <span>{value?.name || "-"}</span>
          </div>
        ),
      },
      {
        Header: "STATUS",
        accessor: "notifyStatus",
        Cell: ({ value }: any) => {
          return (
            <span
              className={`badge ${
                value === "PENDING"
                  ? "bg-warning"
                  : value === "NOTIFIED"
                    ? "bg-info"
                    : "bg-success"
              }`}
            >
              {value}
            </span>
          );
        },
      },
      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => moment(new Date(value)).format("DD-MM-YYYY"),
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => (
          <div className="d-flex gap-1">
            <Link
              className="p-2 bg-light"
              to={{
                pathname: `/notifyMe/details/${value}`,
              }}
            >
              <span className="fas fa-eye text-warning" aria-hidden="true"></span>
            </Link>

            <Link
              className="p-2 bg-light"
              to={{
                pathname: `/notifyMe/edit/${value}`,
              }}
            >
              <span className="fas fa-pencil-alt" aria-hidden="true"></span>
            </Link>

            <button
              type="button"
              className="btn p-2 bg-light"
              onClick={() => handleDeleteData(value)}
            >
              <span
                className="fas fa-trash-alt text-danger"
                aria-hidden="true"
              ></span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const data = React.useMemo(() => {
    return records.map((item) => ({
      name: item.name,
      email: item.email,
      mobile: item.mobile,
      product: item.product,
      notifyStatus: item.notifyStatus,
      createdAt: item.createdAt,
      id: item._id,
    }));
  }, [records]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
  } =
    useTable(
      { columns, data },
      useFilters,
      useSortBy,
      usePagination,
      useRowSelect,
    ) as TableInstanceWithRowSelect<NotifyMeRow>;

  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();
    if (!isConfirmed) return;

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/notifyMe`, recordId);
    } else {
      apiResponse = await remove(`/notifyMe/${recordId}`);
    }

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => !old);
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    return selectedFlatRows
      .map((row: any) => row?.original?.id || row?.original?._id)
      .filter(Boolean);
  }

  function handleSetStatus(evt: React.ChangeEvent<HTMLInputElement>) {
    setStatus(evt.target.value);
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Notify Me</h4>
            </div>
            <div>
              <Link to={"/notifyMe/add"} className="btn btn-primary text-light">
                Add Notify Me
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card rounded-2">
            <div className="card-body shadow-none">
              <div className="row mb-2 gy-2">
                <div className="col-md-8">
                  <input
                    placeholder="Search..."
                    className="form-control py-2"
                    type="search"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
                </div>
                <div className="col-md-4 d-flex gap-2 justify-content-md-end">
                  {selectedFlatRows.length ? (
                    <button
                      className="btn p-2 bg-light border"
                      type="button"
                      onClick={() => handleDeleteData(handleSelectedRows())}
                    >
                      <i className="fas fa-trash-alt text-danger"></i>
                    </button>
                  ) : null}

                  <div className="dropdown">
                    <a
                      className="btn p-2 bg-light border"
                      href="#"
                      role="button"
                      id="dropdownMenuLink"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti-filter"></i>
                    </a>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuLink"
                    >
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="all"
                          value={"All"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="all">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="pending"
                          value={"PENDING"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="pending">Pending</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="notified"
                          value={"NOTIFIED"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="notified">Notified</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="completed"
                          value={"COMPLETED"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="completed">Completed</label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <DataTable
                getTableProps={getTableProps}
                getTableBodyProps={getTableBodyProps}
                headerGroups={headerGroups}
                rows={rows}
                prepareRow={prepareRow}
              />

              <div className="table-responsive px-3">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"notify-me"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
