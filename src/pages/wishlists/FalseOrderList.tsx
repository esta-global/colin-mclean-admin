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

export function FalseOrderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<boolean | string>("All");
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
        let url = `/orders?page=${pagination.page}&limit=${pagination.limit}&orderStatus=PENDING`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;

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
    [pagination.page, pagination.limit, searchQuery, needReload, orderStatus]
  );

  type Record = {
    orderId: any;
    user: any;
    orderDate: string;
    orderStatus: string;
    totalAmount: any;
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
        Header: "ORDER ID",
        accessor: "orderId",
      },

      {
        Header: "USER INFO",
        accessor: "user",
        Cell: ({ value }: any) => {
          return (
            <div className="">
              <h6>{value.name}</h6>
              <p className="p-0 m-0">
                <a className="nav-link" href={`tel:${value.mobile}`}>
                  {value.mobile}
                </a>
              </p>
              {/* <p className="p-0 m-0">
                <a className="nav-link" href={`mailto:${value.email}`}>
                  {value.email}
                </a>
              </p> */}
            </div>
          );
        },
      },

      {
        Header: "ORDER DATE",
        accessor: "orderDate",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MMM-YYYY, hh:mm A");
        },
      },

      {
        Header: "AMOUNT",
        accessor: "totalAmount",
        Cell: ({ value }: any) => {
          return (
            <div className="">
              <h6>₹{value.totalAmount}</h6>
              <b
                className={` ${
                  value.paymentStatus === "pending"
                    ? "text-warning"
                    : value.paymentStatus === "paid"
                    ? "text-success"
                    : value.paymentStatus === "unpaid"
                    ? "text-danger"
                    : "text-secondary"
                }`}
              >
                {value.paymentStatus === "pending"
                  ? "Unpaid"
                  : value.paymentStatus === "paid"
                  ? "Paid"
                  : value.paymentStatus === "unpaid"
                  ? "Failed"
                  : "N/A"}
              </b>
            </div>
          );
        },
      },

      {
        Header: "ORDER STATUS",
        accessor: "orderStatus",
        Cell: ({ value }: any) => {
          return (
            <>
              {value == "PENDING" ? (
                <span className="badge bg-dark">PENDING</span>
              ) : value == "ORDER_PLACED" ? (
                <span className="badge bg-warning">ORDER PLACED</span>
              ) : value == "CONFIRMED" ? (
                <span className="badge bg-primary">CONFIRMED</span>
              ) : value == "DISPATCHED" ? (
                <span className="badge bg-info">DISPATCHED</span>
              ) : value == "DELIVERED" ? (
                <span className="badge bg-success">DELIVERED</span>
              ) : value == "CANCELLED" ? (
                <span className="badge bg-danger">CANCELLED</span>
              ) : (
                ""
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
                  pathname: `/orders/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/orders/details/${value}`,
                }}
              >
                <span
                  className="fas fa-eye text-warning"
                  aria-hidden="true"
                ></span>
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
        orderId: data.orderId,
        user: data?.user || {},
        orderDate: data.createdAt,
        orderStatus: data.orderStatus,
        totalAmount: data,
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
      apiResponse = await remove(`/orders`, recordId);
    } else {
      apiResponse = await remove(`/orders/${recordId}`);
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

  // handleSetOrderStatus
  function handleSetOrderStatus(evt: React.ChangeEvent<HTMLInputElement>) {
    setOrderStatus(evt.target.value);
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Orders</h4>
            </div>
            {/* <div>
              <Link
                to={"/orders/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add User
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card rounded-2">
            <div className="card-body shadow-none">
              <div className="row mb-2 gy-2">
                <div className="col-md-8">
                  <input
                    placeholder="Serach..."
                    className="form-control py-2"
                    type="serach"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
                </div>
                {/* <div className="col-md-4 d-flex gap-2 justify-content-md-end">
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
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="all">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="pending"
                          value={"PENDING"}
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="pending">PENDING</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="order-placed"
                          value={"ORDER_PLACED"}
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="order-placed">ORDER PLACED</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="confirmed"
                          value={"CONFIRMED"}
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="confirmed">CONFIRMED</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="dispatched"
                          value={"DISPATCHED"}
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="dispatched">DISPATCHED</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="delivered"
                          value={"DELIVERED"}
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="delivered">DELIVERED</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="cancelled"
                          value={"CANCELLED"}
                          name="orderStatus"
                          onChange={handleSetOrderStatus}
                        />
                        <label htmlFor="cancelled">CANCELLED</label>
                      </li>
                    </ul>
                  </div>
                </div> */}
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
                  csvFileName={"coupons"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
